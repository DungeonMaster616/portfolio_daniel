import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core_backend.settings")
if os.environ.get("VERCEL") and not os.environ.get("POSTGRES_DB"):
    os.environ.setdefault("SQLITE_PATH", "/tmp/db.sqlite3")

import django  # noqa: E402
from django.core.management import call_command  # noqa: E402
from django.core.wsgi import get_wsgi_application  # noqa: E402

django.setup()

if os.environ.get("VERCEL") and not os.environ.get("POSTGRES_DB"):
    db_path = Path(os.environ.get("SQLITE_PATH", "/tmp/db.sqlite3"))
    if not db_path.exists():
        call_command("migrate", interactive=False, verbosity=0)

app = get_wsgi_application()

