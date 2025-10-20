import bcrypt

# Cost factor for bcrypt. 12 is a good default balance of security/perf.
_BCRYPT_ROUNDS = 12

def _truncate_to_72_bytes(text: str) -> bytes:
    """Return the UTF-8 bytes of text truncated to bcrypt's 72-byte limit."""
    b = text.encode("utf-8")
    if len(b) > 72:
        b = b[:72]
    return b


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw = _truncate_to_72_bytes(plain_password)
    try:
        return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pw = _truncate_to_72_bytes(password)
    salt = bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(pw, salt)
    return hashed.decode("utf-8")
