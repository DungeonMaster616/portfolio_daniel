from django.db import migrations


def seed(apps, schema_editor):
    Game = apps.get_model("games", "Game")
    Achievement = apps.get_model("games", "Achievement")
    for slug, name, description in [
        ("snake", "Snake", "Colete alimentos e evite colisões."),
        ("tetris", "Tetris", "Encaixe peças e complete linhas."),
        ("bomb-arena", "Bomb Arena", "Arena original com bombas e inimigos."),
    ]:
        Game.objects.get_or_create(slug=slug, defaults={"name": name, "description": description})
    for code, name, description, slug, criteria in [
        ("first-finish", "Primeira partida", "Registre seu primeiro resultado.", None, {}),
        ("snake-100", "Cem pontos", "Faça 100 pontos no Snake.", "snake", {"min_score": 100}),
        ("arena-win", "Arena conquistada", "Vença uma partida de Bomb Arena.", "bomb-arena", {"outcome": "won"}),
    ]:
        Achievement.objects.get_or_create(
            code=code,
            defaults={
                "name": name,
                "description": description,
                "game": Game.objects.get(slug=slug) if slug else None,
                "criteria": criteria,
            },
        )


class Migration(migrations.Migration):
    dependencies = [("games", "0001_initial")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
