from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("auth/csrf/", views.CSRFView.as_view()),
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/logout/", views.LogoutView.as_view()),
    path("games/", views.GamesView.as_view()),
    path("game-sessions/", views.SessionView.as_view()),
    path("game-sessions/<uuid:session_id>/finish/", views.FinishView.as_view()),
    path("game-sessions/<uuid:session_id>/abandon/", views.AbandonView.as_view()),
    path("games/<slug:slug>/ranking/", views.RankingView.as_view()),
    path("users/me/", views.ProfileView.as_view()),
    path("users/me/achievements/", views.AchievementsView.as_view()),
]
