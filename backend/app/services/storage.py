import os
from typing import Tuple

from app.core.config import settings


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def save_bytes(filename: str, content: bytes) -> Tuple[str, str]:
    """Save bytes to the configured storage provider.

    Currently only supports local storage. Returns a tuple of (absolute_path, public_url).
    """
    provider = settings.STORAGE_PROVIDER
    if provider != "local":
        # Placeholder for future providers like Supabase
        provider = "local"

    root = settings.STORAGE_LOCAL_DIR
    ensure_dir(root)
    abs_path = os.path.join(root, filename)

    # Avoid clobbering existing files by adding suffix
    base, ext = os.path.splitext(abs_path)
    counter = 1
    while os.path.exists(abs_path):
        abs_path = f"{base}_{counter}{ext}"
        counter += 1

    with open(abs_path, "wb") as f:
        f.write(content)

    # Build a best-effort URL for dev; in real deployment you would serve this dir statically
    public_url = f"{settings.APP_BASE_URL}/static/{os.path.basename(abs_path)}"
    return abs_path, public_url
