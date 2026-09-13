from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import User


class StrictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) - set(self.fields):
            raise serializers.ValidationError({"non_field_errors": ["Campos desconhecidos ou formato inválido."]})
        return super().to_internal_value(data)


class StrictInteger(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            raise serializers.ValidationError("Informe um inteiro JSON.")
        return super().to_internal_value(data)


class RegisterSerializer(StrictSerializer):
    username = serializers.CharField(
        min_length=3, max_length=30, validators=User._meta.get_field("username").validators
    )
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)

    def validate(self, data):
        data["email"] = data["email"].lower()
        if (
            User.objects.filter(username__iexact=data["username"]).exists()
            or User.objects.filter(email__iexact=data["email"]).exists()
        ):
            raise serializers.ValidationError("Nome de usuário ou e-mail indisponível.")
        try:
            validate_password(data["password"], User(username=data["username"], email=data["email"]))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        return data


class LoginSerializer(StrictSerializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, trim_whitespace=False)


class SessionSerializer(StrictSerializer):
    game = serializers.ChoiceField(choices=["snake", "tetris", "bomb-arena"])
    client_version = serializers.ChoiceField(choices=["1.0.0"])


class FinishSerializer(StrictSerializer):
    score = StrictInteger(min_value=0, max_value=2_000_000_000)
    metadata = serializers.DictField()

    def validate_metadata(self, value):
        slug = self.context["game"]
        required = {"outcome", "duration_ms"} | {
            "snake": {"foods"},
            "tetris": {"lines"},
            "bomb-arena": {"crates", "enemies"},
        }[slug]
        if set(value) != required or value.get("outcome") not in ("over", "won"):
            raise serializers.ValidationError("Metadados inválidos para este jogo.")
        if any(type(v) is not int or v < 0 for k, v in value.items() if k != "outcome"):
            raise serializers.ValidationError("Contadores devem ser inteiros não negativos.")
        if value["duration_ms"] > 86_400_000:
            raise serializers.ValidationError("Duração excede o limite.")
        return value

    def validate(self, data):
        m, score, slug = data["metadata"], data["score"], self.context["game"]
        seconds = m["duration_ms"] / 1000
        valid = True
        if slug == "snake":
            valid = m["foods"] <= 397 and score == m["foods"] * 10 and m["foods"] <= seconds / 0.07
            valid = valid and ((m["outcome"] == "won") == (m["foods"] == 397))
        elif slug == "tetris":
            lines = m["lines"]
            valid = (
                lines <= 10000
                and lines <= seconds * 20
                and score % 100 == 0
                and lines * 100 <= score <= lines * 200 * (1 + lines // 10)
                and m["outcome"] == "over"
            )
        else:
            won = m["outcome"] == "won"
            valid = m["crates"] <= 63 and m["enemies"] <= 3 and (not won or m["enemies"] == 3)
            valid = valid and m["crates"] + m["enemies"] <= seconds * 40
            valid = valid and score == m["crates"] * 10 + m["enemies"] * 100 + (500 if won else 0)
        if not valid:
            raise serializers.ValidationError("Pontuação incompatível com as regras do jogo.")
        return data
