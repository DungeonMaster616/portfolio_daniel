"""Start a disposable E2E backend without touching the developer database."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    with tempfile.TemporaryDirectory(prefix="portfolio-e2e-") as temp:
        env = {
            **os.environ,
            "DJANGO_DEBUG": "1",
            "DJANGO_SETTINGS_MODULE": "core_backend.test_settings",
            "SQLITE_PATH": str(Path(temp) / "e2e.sqlite3"),
        }
        if env.get("POSTGRES_DB") and not env["POSTGRES_DB"].startswith(
            ("test_", "e2e_")
        ):
            raise RuntimeError(
                "E2E requires a disposable database named test_* or e2e_*."
            )
        command = [sys.executable, str(ROOT / "backend/manage.py")]
        subprocess.run([*command, "migrate", "--noinput"], env=env, check=True)
        subprocess.run(
            [*command, "runserver", "127.0.0.1:8000", "--noreload"], env=env, check=True
        )


if __name__ == "__main__":
    main()
