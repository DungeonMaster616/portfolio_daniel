import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower


class User(AbstractUser):
    email = models.EmailField(unique=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="unique_email_ci"),
            models.UniqueConstraint(Lower("username"), name="unique_username_ci"),
        ]


class Game(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=16, default="started", choices=[(s, s) for s in ["started", "completed", "abandoned", "rejected"]]
    )
    client_version = models.CharField(max_length=20)


class Score(models.Model):
    session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    score = models.PositiveIntegerField()
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)

    class Meta:
        ordering = ["-score", "created_at", "id"]
        indexes = [models.Index(fields=["game", "is_valid", "-score", "created_at"])]


class Achievement(models.Model):
    code = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=200)
    game = models.ForeignKey(Game, null=True, blank=True, on_delete=models.CASCADE)
    criteria = models.JSONField(default=dict)


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "achievement"], name="unique_user_achievement")]
