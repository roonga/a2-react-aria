import logging
import uuid
from contextvars import ContextVar

req_id: ContextVar[str] = ContextVar("req_id", default="-")


def new_id() -> str:
    return uuid.uuid4().hex[:8]


class _Filter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.req_id = req_id.get()  # type: ignore[attr-defined]
        return True


def configure(service: str) -> None:
    fmt = f"%(asctime)s.%(msecs)03d %(levelname)s [{service}] [%(req_id)s] %(message)s"
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(fmt, datefmt="%H:%M:%S"))
    handler.addFilter(_Filter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)
    for noisy in ("httpx", "httpcore", "uvicorn.access", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
