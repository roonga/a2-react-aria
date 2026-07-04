"""Admin API routes for the survey manager."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from survey_agent import db

router = APIRouter(prefix="/api/admin", tags=["admin"])


class SurveyCreate(BaseModel):
    title: str
    description: str = ""


class SurveyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    theme: dict[str, str] | None = None


class StepCreate(BaseModel):
    slug: str
    title: str
    nodes: list = []
    position: int | None = None


class StepUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    nodes: list | None = None
    skip_if: dict | None = None
    clear_skip_if: bool = False


class ReorderRequest(BaseModel):
    step_ids: list[str]


# ── Surveys ────────────────────────────────────────────────────────────────────

@router.get("/surveys")
def list_surveys():
    return db.list_surveys()


@router.post("/surveys", status_code=201)
def create_survey(body: SurveyCreate):
    return db.create_survey(body.title, body.description)


@router.get("/surveys/{survey_id}")
def get_survey(survey_id: str):
    survey = db.get_survey(survey_id)
    if not survey:
        raise HTTPException(404, "Survey not found")
    steps = db.get_survey_steps(survey_id)
    return {**survey, "steps": steps}


@router.put("/surveys/{survey_id}")
def update_survey(survey_id: str, body: SurveyUpdate):
    updated = db.update_survey(survey_id, body.title, body.description, body.theme)
    if not updated:
        raise HTTPException(404, "Survey not found")
    return updated


@router.delete("/surveys/{survey_id}", status_code=204)
def delete_survey(survey_id: str):
    if not db.delete_survey(survey_id):
        raise HTTPException(404, "Survey not found")


@router.put("/surveys/{survey_id}/publish")
def publish_survey(survey_id: str):
    updated = db.publish_survey(survey_id)
    if not updated:
        raise HTTPException(404, "Survey not found")
    return updated


# ── Steps — reorder must be registered before /{step_id} ──────────────────────

@router.put("/surveys/{survey_id}/steps/reorder")
def reorder_steps(survey_id: str, body: ReorderRequest):
    return db.reorder_steps(survey_id, body.step_ids)


@router.post("/surveys/{survey_id}/steps", status_code=201)
def create_step(survey_id: str, body: StepCreate):
    step = db.create_step(survey_id, body.slug, body.title, body.nodes, body.position)
    if not step:
        raise HTTPException(404, "Survey not found")
    return step


@router.put("/surveys/{survey_id}/steps/{step_id}")
def update_step(survey_id: str, step_id: str, body: StepUpdate):
    updated = db.update_step(
        step_id,
        survey_id=survey_id,
        slug=body.slug,
        title=body.title,
        nodes=body.nodes,
        skip_if=body.skip_if,
        clear_skip_if=body.clear_skip_if,
    )
    if not updated:
        raise HTTPException(404, "Step not found")
    return updated


@router.delete("/surveys/{survey_id}/steps/{step_id}", status_code=204)
def delete_step(survey_id: str, step_id: str):
    if not db.delete_step(step_id, survey_id=survey_id):
        raise HTTPException(404, "Step not found")
