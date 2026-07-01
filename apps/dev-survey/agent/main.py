"""FastAPI survey backend for the a2-react-aria developer survey.

Run locally (from the agent/ directory):
    uv run python main.py
API at: http://localhost:9081
"""

import json
import logging
import sqlite3
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

_root = Path(__file__).parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(_root / ".env", override=True)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from survey_agent.survey_data import SURVEY_STEPS  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
_log = logging.getLogger(__name__)

_data_dir = _root / "data"
_data_dir.mkdir(exist_ok=True)
_db_path = _data_dir / "submissions.db"


def _init_db() -> None:
    with sqlite3.connect(_db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS submissions (
                id TEXT PRIMARY KEY,
                answers TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


_init_db()

app = FastAPI(title="survey-agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/survey/steps")
def get_steps():
    return {"steps": SURVEY_STEPS}


class SubmitRequest(BaseModel):
    answers: dict


@app.post("/api/survey/submit")
def submit(body: SubmitRequest):
    sub_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(_db_path) as conn:
        conn.execute(
            "INSERT INTO submissions (id, answers, created_at) VALUES (?, ?, ?)",
            (sub_id, json.dumps(body.answers), now),
        )
    _log.info("survey submitted: %s", sub_id)
    return {"ok": True, "id": sub_id}


if __name__ == "__main__":
    import os

    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("UVICORN_HOST", "127.0.0.1"),
        port=int(os.getenv("UVICORN_PORT", "9081")),
    )
