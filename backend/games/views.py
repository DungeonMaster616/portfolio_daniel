from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.db.models import Count, Max
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Achievement, Game, GameSession, Score, User, UserAchievement
from .serializers import FinishSerializer, LoginSerializer, RegisterSerializer, SessionSerializer


class PublicView(APIView):
    permission_classes = [AllowAny]


class CSRFView(PublicView):
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class AuthView(PublicView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class RegisterView(AuthView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = User.objects.create_user(**serializer.validated_data)
        except IntegrityError:
            return Response({"detail": "Nome de usuário ou e-mail indisponível."}, status=400)
        login(request, user)
        return Response({"username": user.username, "csrfToken": get_token(request)}, status=201)


class LoginView(AuthView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, **serializer.validated_data)
        if user is None:
            return Response({"detail": "Credenciais inválidas."}, status=400)
        login(request, user)
        return Response({"username": user.username, "csrfToken": get_token(request)})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=204)


class GamesView(PublicView):
    def get(self, request):
        return Response(list(Game.objects.filter(is_active=True).order_by("id").values("slug", "name", "description")))


class SessionView(APIView):
    def post(self, request):
        serializer = SessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = get_object_or_404(Game, slug=serializer.validated_data["game"], is_active=True)
        session = GameSession.objects.create(
            user=request.user, game=game, client_version=serializer.validated_data["client_version"]
        )
        return Response({"id": str(session.id)}, status=201)


def grant_achievements(score):
    for achievement in Achievement.objects.all():
        criteria = achievement.criteria
        if achievement.game_id and achievement.game_id != score.game_id:
            continue
        if score.score < criteria.get("min_score", 0):
            continue
        if criteria.get("outcome") and criteria["outcome"] != score.metadata["outcome"]:
            continue
        UserAchievement.objects.get_or_create(user=score.user, achievement=achievement)


class FinishView(APIView):
    @transaction.atomic
    def post(self, request, session_id):
        session = get_object_or_404(GameSession.objects.select_for_update(), pk=session_id, user=request.user)
        serializer = FinishSerializer(data=request.data, context={"game": session.game.slug})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        existing = Score.objects.filter(session=session).first()
        if existing:
            if existing.score == data["score"] and existing.metadata == data["metadata"]:
                return Response({"id": existing.id, "score": existing.score}, status=200)
            return Response({"detail": "Sessão já finalizada com outro resultado."}, status=409)
        if session.status != "started":
            return Response({"detail": "Sessão não está ativa."}, status=409)
        elapsed = (timezone.now() - session.started_at).total_seconds()
        if elapsed > 86400 or data["metadata"]["duration_ms"] > elapsed * 1000 + 2000:
            return Response({"detail": "Duração incompatível com a sessão."}, status=400)
        score = Score.objects.create(session=session, user=request.user, game=session.game, **data)
        session.status = "completed"
        session.finished_at = timezone.now()
        session.save(update_fields=["status", "finished_at"])
        grant_achievements(score)
        return Response({"id": score.id, "score": score.score}, status=201)


class AbandonView(APIView):
    @transaction.atomic
    def post(self, request, session_id):
        session = get_object_or_404(GameSession.objects.select_for_update(), pk=session_id, user=request.user)
        if session.status == "completed":
            return Response({"detail": "Sessão já concluída."}, status=409)
        session.status = "abandoned"
        session.finished_at = timezone.now()
        session.save(update_fields=["status", "finished_at"])
        return Response(status=204)


class RankingView(PublicView):
    def get(self, request, slug):
        game = get_object_or_404(Game, slug=slug, is_active=True)
        scores = Score.objects.filter(game=game, is_valid=True).select_related("user")
        period = request.query_params.get("period", "all")
        if period not in ("all", "day", "week"):
            return Response({"detail": "Período inválido."}, status=400)
        if period != "all":
            scores = scores.filter(created_at__gte=timezone.now() - timedelta(days=1 if period == "day" else 7))
        paginator = PageNumberPagination()
        rows = paginator.paginate_queryset(scores, request)
        return paginator.get_paginated_response(
            [{"username": row.user.username, "score": row.score, "created_at": row.created_at} for row in rows]
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scores = Score.objects.filter(user=request.user, is_valid=True)
        records = scores.values("game__slug").annotate(best=Max("score"), matches=Count("id")).order_by("game__slug")
        return Response(
            {
                "username": request.user.username,
                "email": request.user.email,
                "records": list(records),
                "matches": list(scores.order_by("-created_at").values("game__slug", "score", "created_at")[:20]),
            }
        )


class AchievementsView(APIView):
    def get(self, request):
        unlocked = dict(UserAchievement.objects.filter(user=request.user).values_list("achievement_id", "unlocked_at"))
        return Response(
            [
                {"code": a.code, "name": a.name, "description": a.description, "unlocked_at": unlocked.get(a.id)}
                for a in Achievement.objects.order_by("id")
            ]
        )


def health(request):
    from django.db import connection

    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"status": "ok"})
