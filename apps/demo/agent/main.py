"""ADK agent server for the restaurant booking demo.

Run locally (from the agent/ directory):
    uv run python main.py
API at: http://localhost:9080
"""

import logging
import sys
import time
from pathlib import Path

_root = Path(__file__).parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(_root / ".env", override=True)

from restaurant_agent._log import configure, new_id, req_id  # noqa: E402

configure("restaurant-agent")
_log = logging.getLogger(__name__)

from google.adk.cli.fast_api import get_fast_api_app  # noqa: E402
from starlette.requests import Request  # noqa: E402

_data_dir = _root / "data"
_data_dir.mkdir(exist_ok=True)

app = get_fast_api_app(
    agents_dir=str(_root),
    session_service_uri=f"sqlite+aiosqlite:///{_data_dir}/sessions.db",
    allow_origins=["http://localhost:9001"],
    web=False,
)


@app.middleware("http")
async def _request_logging(request: Request, call_next):
    rid = request.headers.get("x-request-id") or new_id()
    tok = req_id.set(rid)
    start = time.monotonic()
    _log.info("→ %s %s", request.method, request.url.path)
    try:
        response = await call_next(request)
        _log.info("← %s (%.0fms)", response.status_code, (time.monotonic() - start) * 1000)
        return response
    finally:
        req_id.reset(tok)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9080)
