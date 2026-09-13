from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Game, GameSession, Score, Achievement, UserAchievement

admin.site.register(User, UserAdmin)
admin.site.register([Game, GameSession, Achievement, UserAchievement])


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ["user", "game", "score", "is_valid", "created_at"]
    list_filter = ["game", "is_valid"]
    readonly_fields = ["session", "user", "game", "score", "metadata", "created_at"]
