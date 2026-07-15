"""Database operations for the survey manager."""
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_db_path: Path | None = None


def init(db_path: Path) -> None:
    global _db_path
    _db_path = db_path
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS surveys (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                status      TEXT NOT NULL DEFAULT 'draft',
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS steps (
                id          TEXT PRIMARY KEY,
                survey_id   TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
                slug        TEXT NOT NULL,
                title       TEXT NOT NULL,
                position    INTEGER NOT NULL,
                nodes_json  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS flow_rules (
                id                TEXT PRIMARY KEY,
                step_id           TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
                condition_field   TEXT NOT NULL,
                condition_values  TEXT NOT NULL,
                UNIQUE(step_id)
            );
        """)
    try:
        with _conn() as conn:
            conn.execute("ALTER TABLE surveys ADD COLUMN theme_json TEXT NOT NULL DEFAULT '{}'")
    except sqlite3.OperationalError:
        pass
    try:
        with _conn() as conn:
            conn.execute("ALTER TABLE steps ADD COLUMN skip_if_json TEXT")
    except sqlite3.OperationalError:
        pass
    _migrate_nodes_to_survey_page()
    _migrate_sq_label_to_inner()
    _maybe_seed()
    _reseed_descriptions()


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _card_to_survey_page(nodes: list) -> list:
    """Convert a legacy Card-rooted step to SurveyPage format. Returns the input unchanged if already migrated."""
    if not nodes or not isinstance(nodes[0], dict):
        return nodes
    root = nodes[0]
    if root.get("type") != "Card":
        return nodes
    children = root.get("children") or []
    question_nodes = []
    for c in children:
        if not isinstance(c, dict):
            continue
        t = c.get("type")
        if t == "Text" and isinstance(c.get("props"), dict) and c["props"].get("as") == "h2":
            continue
        if t == "Flex":
            kids = c.get("children") or []
            if kids and all(isinstance(k, dict) and k.get("type") == "Button" for k in kids):
                continue
        question_nodes.append(c)
    wrapped = []
    for qn in question_nodes:
        if not isinstance(qn, dict):
            continue
        if qn.get("type") == "Text":
            wrapped.append(qn)
        else:
            # label/isRequired stay on the inner node; SurveyQuestion is a layout wrapper only
            wrapped.append({"type": "SurveyQuestion", "props": {}, "children": qn})
    return [{"type": "SurveyPage", "props": {}, "children": wrapped}]


def _sq_node_label_to_inner(node: dict) -> dict:
    """Move label/required from SurveyQuestion.props to inner node props (one-time migration)."""
    if node.get("type") != "SurveyQuestion":
        return node
    sq_props = dict(node.get("props") or {})
    inner = node.get("children")
    if not isinstance(inner, dict):
        return node
    inner_props = dict(inner.get("props") or {})
    label = sq_props.pop("label", None)
    required = sq_props.pop("required", None)
    if label and not inner_props.get("label"):
        inner_props["label"] = label
    if required and not inner_props.get("isRequired"):
        inner_props["isRequired"] = True
    return {**node, "props": sq_props, "children": {**inner, "props": inner_props}}


def _migrate_sq_label_to_inner() -> None:
    """Move label/required from SurveyQuestion.props to inner node for all steps in the DB."""
    with _conn() as conn:
        rows = conn.execute("SELECT id, nodes_json FROM steps").fetchall()
        for row in rows:
            try:
                nodes = json.loads(row["nodes_json"] or "[]")
                if not nodes or not isinstance(nodes[0], dict):
                    continue
                root = nodes[0]
                if root.get("type") != "SurveyPage":
                    continue
                children = root.get("children") or []
                new_children = [_sq_node_label_to_inner(c) if isinstance(c, dict) else c for c in children]
                migrated = [{**root, "children": new_children}]
                if json.dumps(migrated) != json.dumps(nodes):
                    conn.execute(
                        "UPDATE steps SET nodes_json=? WHERE id=?",
                        (json.dumps(migrated), row["id"]),
                    )
            except (json.JSONDecodeError, TypeError):
                # Malformed nodes_json: leave the row unmigrated and keep processing the rest.
                continue


def _migrate_nodes_to_survey_page() -> None:
    """Rewrite all Card-rooted step nodes to SurveyPage format in-place."""
    with _conn() as conn:
        rows = conn.execute("SELECT id, nodes_json FROM steps").fetchall()
        for row in rows:
            try:
                nodes = json.loads(row["nodes_json"] or "[]")
                migrated = _card_to_survey_page(nodes)
                if migrated is not nodes:
                    conn.execute(
                        "UPDATE steps SET nodes_json=? WHERE id=?",
                        (json.dumps(migrated), row["id"]),
                    )
            except (json.JSONDecodeError, TypeError):
                # Malformed nodes_json: leave the row unmigrated and keep processing the rest.
                continue


def _reseed_descriptions() -> None:
    """Apply description/hint from SURVEY_STEPS seed data to existing DB steps, keyed by slug + field name."""
    from survey_agent.survey_data import SURVEY_STEPS

    # Build lookup: {slug: {field_name: {description?, hint?}}}
    lookup: dict[str, dict[str, dict]] = {}
    for step in SURVEY_STEPS:
        slug = step["id"]
        lookup[slug] = {}
        nodes = step.get("nodes") or []
        if not nodes or not isinstance(nodes[0], dict):
            continue
        page = nodes[0]
        if page.get("type") != "SurveyPage":
            continue
        for child in (page.get("children") or []):
            if not isinstance(child, dict) or child.get("type") != "SurveyQuestion":
                continue
            sq_props = child.get("props") or {}
            inner = child.get("children")
            if not isinstance(inner, dict):
                continue
            name = (inner.get("props") or {}).get("name")
            if not name:
                continue
            desc_data = {k: sq_props[k] for k in ("description", "hint") if k in sq_props}
            if desc_data:
                lookup[slug][name] = desc_data

    with _conn() as conn:
        rows = conn.execute("SELECT id, slug, nodes_json FROM steps").fetchall()
        for row in rows:
            slug = row["slug"]
            name_to_desc = lookup.get(slug)
            if not name_to_desc:
                continue
            try:
                nodes = json.loads(row["nodes_json"] or "[]")
                if not nodes or not isinstance(nodes[0], dict):
                    continue
                page = nodes[0]
                if page.get("type") != "SurveyPage":
                    continue
                children = page.get("children") or []
                changed = False
                new_children = []
                for child in children:
                    if isinstance(child, dict) and child.get("type") == "SurveyQuestion":
                        inner = child.get("children")
                        if isinstance(inner, dict):
                            name = (inner.get("props") or {}).get("name")
                            if name and name in name_to_desc:
                                old_props = dict(child.get("props") or {})
                                new_props = {**old_props, **name_to_desc[name]}
                                if new_props != old_props:
                                    child = {**child, "props": new_props}
                                    changed = True
                    new_children.append(child)
                if changed:
                    new_nodes = [{**page, "children": new_children}]
                    conn.execute(
                        "UPDATE steps SET nodes_json=? WHERE id=?",
                        (json.dumps(new_nodes), row["id"]),
                    )
            except (json.JSONDecodeError, TypeError):
                # Malformed nodes_json: skip reseeding this row and keep processing the rest.
                continue


def _maybe_seed() -> None:
    """Seed the DB from survey_data.py SURVEY_STEPS if no surveys exist yet."""
    from survey_agent.survey_data import SURVEY_STEPS

    with _conn() as conn:
        if conn.execute("SELECT COUNT(*) FROM surveys").fetchone()[0] > 0:
            return

        survey_id = str(uuid.uuid4())
        now = _now()
        conn.execute(
            "INSERT INTO surveys (id, title, description, status, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (survey_id, "Developer Survey 2026", "Annual developer community survey", "published", now, now),
        )
        for pos, step in enumerate(SURVEY_STEPS):
            step_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO steps (id, survey_id, slug, title, position, nodes_json, updated_at) VALUES (?,?,?,?,?,?,?)",
                (step_id, survey_id, step["id"], step["title"], pos, json.dumps(step["nodes"]), now),
            )
            if "skipIf" in step:
                conn.execute(
                    "INSERT INTO flow_rules (id, step_id, condition_field, condition_values) VALUES (?,?,?,?)",
                    (str(uuid.uuid4()), step_id, step["skipIf"]["field"], json.dumps(step["skipIf"]["oneOf"])),
                )


# ── Survey CRUD ────────────────────────────────────────────────────────────────

def list_surveys() -> list[dict]:
    with _conn() as conn:
        rows = conn.execute("""
            SELECT s.*, (SELECT COUNT(*) FROM steps WHERE survey_id = s.id) AS step_count
            FROM surveys s ORDER BY s.created_at DESC
        """).fetchall()
    return [dict(r) for r in rows]


def get_survey(survey_id: str) -> dict | None:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM surveys WHERE id = ?", (survey_id,)).fetchone()
    if not row:
        return None
    result = dict(row)
    raw = result.pop("theme_json", "{}")
    try:
        parsed = json.loads(raw or "{}")
        result["theme"] = parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        result["theme"] = {}
    return result


def create_survey(title: str, description: str = "") -> dict:
    survey_id = str(uuid.uuid4())
    now = _now()
    with _conn() as conn:
        conn.execute(
            "INSERT INTO surveys (id, title, description, status, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (survey_id, title, description, "draft", now, now),
        )
    return get_survey(survey_id)  # type: ignore[return-value]


def update_survey(
    survey_id: str,
    title: str | None = None,
    description: str | None = None,
    theme: dict | None = None,
) -> dict | None:
    survey = get_survey(survey_id)
    if not survey:
        return None
    conn_title = title if title is not None else survey["title"]
    conn_desc = description if description is not None else survey["description"]
    conn_theme = json.dumps(theme) if theme is not None else json.dumps(survey["theme"])
    with _conn() as conn:
        conn.execute(
            "UPDATE surveys SET title=?, description=?, theme_json=?, updated_at=? WHERE id=?",
            (conn_title, conn_desc, conn_theme, _now(), survey_id),
        )
    return get_survey(survey_id)


def delete_survey(survey_id: str) -> bool:
    with _conn() as conn:
        result = conn.execute("DELETE FROM surveys WHERE id=?", (survey_id,))
    return result.rowcount > 0


def publish_survey(survey_id: str) -> dict | None:
    """Toggle: draft→published (unpublishes all others), published→draft."""
    survey = get_survey(survey_id)
    if not survey:
        return None
    new_status = "draft" if survey["status"] == "published" else "published"
    now = _now()
    with _conn() as conn:
        if new_status == "published":
            conn.execute("UPDATE surveys SET status='draft', updated_at=? WHERE id != ?", (now, survey_id))
        conn.execute("UPDATE surveys SET status=?, updated_at=? WHERE id=?", (new_status, now, survey_id))
    return get_survey(survey_id)


def get_published_steps() -> dict[str, Any]:
    """Return steps and theme from the published survey for the public /api/survey/steps endpoint."""
    with _conn() as conn:
        survey = conn.execute(
            "SELECT id, theme_json FROM surveys WHERE status='published' LIMIT 1"
        ).fetchone()
        if not survey:
            return {"steps": [], "theme": {}}
        rows = conn.execute(
            "SELECT s.slug, s.title, s.nodes_json, s.skip_if_json, f.condition_field, f.condition_values "
            "FROM steps s LEFT JOIN flow_rules f ON f.step_id = s.id "
            "WHERE s.survey_id = ? ORDER BY s.position",
            (survey["id"],),
        ).fetchall()
        try:
            parsed_theme = json.loads(survey["theme_json"] or "{}")
            theme: dict[str, Any] = parsed_theme if isinstance(parsed_theme, dict) else {}
        except json.JSONDecodeError:
            theme = {}
    result: list[dict[str, Any]] = []
    for r in rows:
        step: dict[str, Any] = {"id": r["slug"], "title": r["title"], "nodes": json.loads(r["nodes_json"])}
        if r["skip_if_json"]:
            try:
                step["skip_if"] = json.loads(r["skip_if_json"])
            except json.JSONDecodeError:
                pass
        elif r["condition_field"]:
            step["skip_if"] = {"field": r["condition_field"], "one_of": json.loads(r["condition_values"])}
        result.append(step)
    return {"steps": result, "theme": theme}


# ── Step CRUD ──────────────────────────────────────────────────────────────────

def _row_to_step(r: sqlite3.Row) -> dict:
    step = dict(r)
    step["nodes"] = json.loads(step.pop("nodes_json"))
    skip_if_json_raw = step.pop("skip_if_json", None)
    cond_field = step.pop("condition_field", None)
    cond_vals = step.pop("condition_values", None)
    if skip_if_json_raw:
        try:
            step["skip_if"] = json.loads(skip_if_json_raw)
        except json.JSONDecodeError:
            step["skip_if"] = None
    elif cond_field:
        step["skip_if"] = {"field": cond_field, "one_of": json.loads(cond_vals)}
    else:
        step["skip_if"] = None
    return step


def get_survey_steps(survey_id: str) -> list[dict]:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT s.*, f.condition_field, f.condition_values FROM steps s "
            "LEFT JOIN flow_rules f ON f.step_id = s.id "
            "WHERE s.survey_id = ? ORDER BY s.position",
            (survey_id,),
        ).fetchall()
    return [_row_to_step(r) for r in rows]


def get_step(step_id: str) -> dict | None:
    with _conn() as conn:
        r = conn.execute(
            "SELECT s.*, f.condition_field, f.condition_values FROM steps s "
            "LEFT JOIN flow_rules f ON f.step_id = s.id WHERE s.id = ?",
            (step_id,),
        ).fetchone()
    return _row_to_step(r) if r else None


def create_step(survey_id: str, slug: str, title: str, nodes: list, position: int | None = None) -> dict | None:
    if not get_survey(survey_id):
        return None
    step_id = str(uuid.uuid4())
    now = _now()
    with _conn() as conn:
        if position is None:
            max_pos = conn.execute("SELECT MAX(position) FROM steps WHERE survey_id=?", (survey_id,)).fetchone()[0]
            position = (max_pos + 1) if max_pos is not None else 0
        conn.execute(
            "INSERT INTO steps (id, survey_id, slug, title, position, nodes_json, updated_at) VALUES (?,?,?,?,?,?,?)",
            (step_id, survey_id, slug, title, position, json.dumps(nodes), now),
        )
    return get_step(step_id)


def update_step(
    step_id: str,
    survey_id: str | None = None,
    slug: str | None = None,
    title: str | None = None,
    nodes: list | None = None,
    skip_if: dict | None = None,
    clear_skip_if: bool = False,
) -> dict | None:
    step = get_step(step_id)
    if not step:
        return None
    if survey_id is not None and step.get("survey_id") != survey_id:
        return None
    new_slug = slug if slug is not None else step["slug"]
    new_title = title if title is not None else step["title"]
    new_nodes = nodes if nodes is not None else step["nodes"]
    now = _now()
    with _conn() as conn:
        conn.execute(
            "UPDATE steps SET slug=?, title=?, nodes_json=?, updated_at=? WHERE id=?",
            (new_slug, new_title, json.dumps(new_nodes), now, step_id),
        )
        if clear_skip_if:
            conn.execute("DELETE FROM flow_rules WHERE step_id=?", (step_id,))
            conn.execute("UPDATE steps SET skip_if_json=NULL WHERE id=?", (step_id,))
        elif skip_if:
            conn.execute(
                "UPDATE steps SET skip_if_json=? WHERE id=?",
                (json.dumps(skip_if), step_id),
            )
            if "field" in skip_if and "one_of" in skip_if:
                # Legacy format: also maintain flow_rules for backward compat
                existing = conn.execute("SELECT id FROM flow_rules WHERE step_id=?", (step_id,)).fetchone()
                if existing:
                    conn.execute(
                        "UPDATE flow_rules SET condition_field=?, condition_values=? WHERE step_id=?",
                        (skip_if["field"], json.dumps(skip_if["one_of"]), step_id),
                    )
                else:
                    conn.execute(
                        "INSERT INTO flow_rules (id, step_id, condition_field, condition_values) VALUES (?,?,?,?)",
                        (str(uuid.uuid4()), step_id, skip_if["field"], json.dumps(skip_if["one_of"])),
                    )
            else:
                # New multi-group format: remove legacy single-condition rule
                conn.execute("DELETE FROM flow_rules WHERE step_id=?", (step_id,))
    return get_step(step_id)


def delete_step(step_id: str, survey_id: str | None = None) -> bool:
    step = get_step(step_id)
    if not step:
        return False
    if survey_id is not None and step.get("survey_id") != survey_id:
        return False
    with _conn() as conn:
        result = conn.execute("DELETE FROM steps WHERE id=?", (step_id,))
    return result.rowcount > 0


def reorder_steps(survey_id: str, step_ids: list[str]) -> list[dict]:
    now = _now()
    with _conn() as conn:
        for pos, sid in enumerate(step_ids):
            conn.execute(
                "UPDATE steps SET position=?, updated_at=? WHERE id=? AND survey_id=?",
                (pos, now, sid, survey_id),
            )
    return get_survey_steps(survey_id)
