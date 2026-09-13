from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from . import tests as fixtures
from .models import Game, GameSession, Score, User


class AdditionalAPITests(TestCase):
    setUp = fixtures.APITests.setUp
    csrf = fixtures.APITests.csrf
    sign_in = fixtures.APITests.sign_in
    session = fixtures.APITests.session
    payload = fixtures.APITests.payload

    def test_TC_022_pagination_and_period(self):
        self.sign_in()
        for _ in range(12):
            self.client.post(self.session(), self.payload(), format="json")
        first = self.client.get("/api/v1/games/snake/ranking/").json()
        self.assertEqual(len(first["results"]), 10)
        self.assertIsNotNone(first["next"])
        self.assertEqual(len(self.client.get("/api/v1/games/snake/ranking/?page=2").json()["results"]), 2)
        Score.objects.update(created_at=timezone.now() - timedelta(days=2))
        self.assertEqual(self.client.get("/api/v1/games/snake/ranking/?period=day").json()["count"], 0)
        self.assertEqual(self.client.get("/api/v1/games/snake/ranking/?period=week").json()["count"], 12)
        self.assertEqual(self.client.get("/api/v1/games/snake/ranking/?period=invalid").status_code, 400)

    def test_TC_024_admin_requires_staff(self):
        self.sign_in()
        self.assertEqual(self.client.get("/admin/games/score/").status_code, 302)
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.assertEqual(self.client.get("/admin/games/score/").status_code, 200)

    def test_TC_018_tetris_arena_metadata_and_anonymous_session(self):
        self.csrf()
        self.assertEqual(
            self.client.post(
                "/api/v1/game-sessions/", {"game": "snake", "client_version": "1.0.0"}, format="json"
            ).status_code,
            403,
        )
        self.sign_in()
        for slug, score, metadata in [("tetris", 100, {"lines": 1}), ("bomb-arena", 800, {"crates": 0, "enemies": 3})]:
            session = GameSession.objects.create(
                user=self.user, game=Game.objects.get(slug=slug), client_version="1.0.0"
            )
            GameSession.objects.filter(pk=session.pk).update(started_at=timezone.now() - timedelta(seconds=10))
            body = {
                "score": score,
                "metadata": {**metadata, "duration_ms": 1000, "outcome": "won" if slug == "bomb-arena" else "over"},
            }
            self.assertEqual(
                self.client.post(f"/api/v1/game-sessions/{session.pk}/finish/", body, format="json").status_code, 201
            )

    def test_TC_016_other_profiles_are_private(self):
        self.sign_in()
        self.client.post(self.session(), self.payload(), format="json")
        other = User.objects.create_user(username="private", email="private@example.test")
        self.client.force_login(other)
        self.csrf()
        self.assertEqual(self.client.get("/api/v1/users/me/").json()["records"], [])
