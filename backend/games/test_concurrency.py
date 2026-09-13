"""Executed by the PostgreSQL CI job; not collected by SQLite development runs."""

import os
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from django.db import close_old_connections
from django.test import TransactionTestCase
from rest_framework.test import APIClient

from .models import Game, GameSession, Score, User


if os.environ.get("POSTGRES_DB"):

    class ConcurrentFinishTests(TransactionTestCase):
        def test_TC_019_concurrent_finish_has_one_score(self):
            user = User.objects.create_user(username="parallel", email="parallel@example.test")
            game = (
                Game.objects.create(slug="snake", name="Snake")
                if not Game.objects.filter(slug="snake").exists()
                else Game.objects.get(slug="snake")
            )
            session = GameSession.objects.create(user=user, game=game, client_version="1.0.0")
            barrier = Barrier(2)

            def finish():
                close_old_connections()
                try:
                    client = APIClient()
                    client.force_authenticate(user=User.objects.get(pk=user.pk))
                    barrier.wait(timeout=10)
                    return client.post(
                        f"/api/v1/game-sessions/{session.pk}/finish/",
                        {"score": 0, "metadata": {"foods": 0, "duration_ms": 0, "outcome": "over"}},
                        format="json",
                    ).status_code
                finally:
                    close_old_connections()

            with ThreadPoolExecutor(max_workers=2) as pool:
                responses = list(pool.map(lambda _: finish(), range(2)))
            self.assertEqual(sorted(responses), [200, 201])
            self.assertEqual(Score.objects.filter(session=session).count(), 1)
