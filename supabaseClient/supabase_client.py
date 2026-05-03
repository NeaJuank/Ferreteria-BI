import os
from pathlib import Path
from supabase import Client, create_client


def load_env(path: Path | str = Path(__file__).parent.parent / ".env") -> None:
    path = Path(path)
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key and key not in os.environ:
            os.environ[key] = value


def get_supabase_client(env_path: Path | str = Path(__file__).parent.parent / ".env") -> Client:
    load_env(env_path)
    url = os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_KEY")

    if not url or not key:
        raise EnvironmentError(
            "VITE_SUPABASE_URL y VITE_SUPABASE_KEY deben estar configurados en el entorno o en el archivo .env"
        )

    return create_client(url, key)
