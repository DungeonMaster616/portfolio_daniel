from datetime import timedelta
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Game, GameSession, Score, User, UserAchievement


class APITests(TestCase):
    def setUp(self):
        cache.clear()
        from importlib import import_module
        from django.apps import apps

        import_module("games.migrations.0002_catalog").seed(apps, None)
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            username="daniel", email="daniel@example.test", password="Safe-testing-pass-82!"
        )
        self.game = Game.objects.get(slug="snake")

    def csrf(self):
        token = self.client.get("/api/v1/auth/csrf/").json()["csrfToken"]
        self.client.credentials(HTTP_X_CSRFTOKEN=token)

    def sign_in(self):
        self.client.force_login(self.user)
        self.csrf()

    def session(self):
        session = GameSession.objects.create(user=self.user, game=self.game, client_version="1.0.0")
        GameSession.objects.filter(pk=session.pk).update(started_at=timezone.now() - timedelta(seconds=10))
        return f"/api/v1/game-sessions/{session.pk}/finish/"

    def payload(self, score=10):
        return {"score": score, "metadata": {"foods": score // 10, "duration_ms": 1000, "outcome": "over"}}

    def test_TC_015_csrf_register_login_logout(self):
        data = {"username": "player", "email": "player@example.test", "password": "Safe-testing-pass-82!"}
        self.assertEqual(self.client.post("/api/v1/auth/register/", data, format="json").status_code, 403)
        self.csrf()
        response = self.client.post("/api/v1/auth/register/", data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.json())
        self.assertTrue(User.objects.get(username="player").check_password(data["password"]))
        self.csrf()
        self.assertEqual(self.client.post("/api/v1/auth/register/", data, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/v1/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/v1/users/me/").status_code, 403)
        self.csrf()
        self.assertEqual(
            self.client.post(
                "/api/v1/auth/login/", {"username": "player", "password": "bad"}, format="json"
            ).status_code,
            400,
        )
        self.assertEqual(
            self.client.post(
                "/api/v1/auth/login/", {"username": "player", "password": data["password"]}, format="json"
            ).status_code,
            200,
        )

    def test_TC_018_reject_invalid_scores_and_forged_identity(self):
        self.sign_in()
        url = self.session()
        for value in [-1, 1.5, True, "10", 500000]:
            self.assertEqual(
                self.client.post(
                    url, {"score": value, "metadata": self.payload()["metadata"]}, format="json"
                ).status_code,
                400,
            )
        self.assertEqual(self.client.post(url, {**self.payload(), "user": 99}, format="json").status_code, 400)
        self.assertEqual(Score.objects.count(), 0)
        self.assertEqual(self.client.post(url, self.payload(), format="json").status_code, 201)
        self.assertEqual(Score.objects.get().user, self.user)

    def test_TC_019_idempotence_and_conflict(self):
        self.sign_in()
        url = self.session()
        first = self.client.post(url, self.payload(), format="json")
        second = self.client.post(url, self.payload(), format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.json(), second.json())
        self.assertEqual(self.client.post(url, self.payload(20), format="json").status_code, 409)
        self.assertEqual(Score.objects.count(), 1)
        self.assertEqual(UserAchievement.objects.count(), 1)

    def test_TC_018_other_users_session_is_inaccessible(self):
        url = self.session()
        other = User.objects.create_user(username="other", email="other@example.test")
        self.client.force_login(other)
        self.csrf()
        self.assertEqual(self.client.post(url, self.payload(), format="json").status_code, 404)

    def test_TC_016_TC_021_profile_ranking_and_invalidated_score(self):
        self.sign_in()
        for score in [10, 20, 20]:
            self.client.post(self.session(), self.payload(score), format="json")
        scores = list(Score.objects.order_by("id"))
        ranking = self.client.get("/api/v1/games/snake/ranking/").json()
        self.assertEqual([r["score"] for r in ranking["results"]], [20, 20, 10])
        self.assertLess(ranking["results"][0]["created_at"], ranking["results"][1]["created_at"])
        profile = self.client.get("/api/v1/users/me/").json()
        self.assertEqual(profile["records"][0]["best"], 20)
        self.assertNotIn("password", profile)
        Score.objects.filter(pk=scores[1].pk).update(is_valid=False)
        self.assertEqual(self.client.get("/api/v1/games/snake/ranking/").json()["count"], 2)

    def test_TC_018_abandoned_and_impossible_duration(self):
        self.sign_in()
        url = self.session()
        payload = self.payload()
        payload["metadata"]["duration_ms"] = 100000
        self.assertEqual(self.client.post(url, payload, format="json").status_code, 400)
        self.assertEqual(self.client.post(url.replace("finish/", "abandon/")).status_code, 204)
        self.assertEqual(self.client.post(url, self.payload(), format="json").status_code, 409)

    def test_TC_023_achievements_show_locked_and_unlocked(self):
        self.sign_in()
        self.assertTrue(all(a["unlocked_at"] is None for a in self.client.get("/api/v1/users/me/achievements/").json()))
        self.client.post(self.session(), self.payload(), format="json")
        self.assertEqual(
            sum(a["unlocked_at"] is not None for a in self.client.get("/api/v1/users/me/achievements/").json()), 1
        )

    def test_TC_107_login_requires_csrf_and_is_throttled(self):
        self.assertEqual(self.client.post("/api/v1/auth/login/", {}, format="json").status_code, 403)
        self.csrf()
        for _ in range(10):
            self.client.post("/api/v1/auth/login/", {"username": "missing", "password": "bad"}, format="json")
        self.assertEqual(self.client.post("/api/v1/auth/login/", {}, format="json").status_code, 429)
