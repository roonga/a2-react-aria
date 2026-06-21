import logging
import re
from datetime import date, timedelta

from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.llm_agent import Agent
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse
from google.genai import types

from .restaurant_data import (
    build_confirmation_card,
    build_guest_form,
    build_intent_confirmation,
    build_search_form,
    build_search_results,
    build_slots_card,
    find_restaurant_by_name,
    find_restaurants,
    generate_confirmation_number,
    serialize,
)

_log = logging.getLogger(__name__)

_A2UI_TOOLS = {"search_restaurants", "get_available_slots", "confirm_booking"}

_FIND_RE = re.compile(r"^Find Restaurants", re.IGNORECASE)
_BOOK_ANOTHER_RE = re.compile(r"^Book Another Table$", re.IGNORECASE)
_BOOK_RE = re.compile(r"^Book (.+)$", re.IGNORECASE)
_CONTINUE_RE = re.compile(r"^Continue", re.IGNORECASE)
_CONFIRM_RE = re.compile(r"^Confirm Booking", re.IGNORECASE)
_EDIT_SEARCH_RE = re.compile(r"^Edit Search", re.IGNORECASE)

# Natural language extraction — used in Case 0
_CUISINE_EXTRACT_RE = re.compile(
    r"\b(italian|japanese|thai|indian|modern australian)\b", re.IGNORECASE
)
_LOCATION_IN_RE = re.compile(
    r"\bin\s+([\w\s]+?)(?=\s+for\b|\s+table\b|\s+on\b|\s*,"
    r"|\s+tomorrow\b|\s+tonight\b|\s+today\b"
    r"|\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\s*$)",
    re.IGNORECASE,
)
_TOMORROW_RE = re.compile(r"\btomorrow\b", re.IGNORECASE)
_TODAY_RE = re.compile(r"\btoday\b|\btonight\b", re.IGNORECASE)
_WEEKDAY_RE = re.compile(
    r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.IGNORECASE
)


def _extract_initial_params(text: str) -> dict:
    """Extract search params from a natural language opening message."""
    params: dict = {}

    m = _CUISINE_EXTRACT_RE.search(text)
    if m:
        c = m.group(1).lower()
        params["cuisine"] = "Modern Australian" if "australian" in c else c.title()

    m = _LOCATION_IN_RE.search(text)
    if m:
        params["location"] = m.group(1).strip()

    # First digit 1-20 not immediately followed by am/pm (avoids "7pm" → 7)
    for m in re.finditer(r"\b(\d+)\b(?!\s*(?:pm|am)\b)", text, re.IGNORECASE):
        n = int(m.group(1))
        if 1 <= n <= 20:
            params["party_size"] = n
            break

    today = date.today()
    if _TOMORROW_RE.search(text):
        d = today + timedelta(days=1)
        params["date"] = d.isoformat()
        params["date_display"] = f"{d.strftime('%A')} {d.day} {d.strftime('%B')}"
    elif _TODAY_RE.search(text):
        params["date"] = today.isoformat()
        params["date_display"] = f"{today.strftime('%A')} {today.day} {today.strftime('%B')}"
    else:
        m = _WEEKDAY_RE.search(text)
        if m:
            days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            target_dow = days.index(m.group(1).lower())
            days_ahead = (target_dow - today.weekday()) % 7 or 7
            d = today + timedelta(days=days_ahead)
            params["date"] = d.isoformat()
            params["date_display"] = f"{d.strftime('%A')} {d.day} {d.strftime('%B')}"

    return params


def _parse_action(text: str) -> tuple[str, dict[str, str]]:
    """Parse 'ButtonLabel | Key: value | Key: value' into (label, fields)."""
    parts = [p.strip() for p in text.split("|")]
    label = parts[0]
    fields: dict[str, str] = {}
    for part in parts[1:]:
        if ": " in part:
            k, v = part.split(": ", 1)
            fields[k.strip()] = v.strip()
    return label, fields


def _extract_context(llm_request: LlmRequest) -> dict:
    """Extract booking context (restaurant, date, party_size, time_slot) from history."""
    ctx: dict = {
        "restaurant_name": None,
        "date": "Saturday",
        "party_size": 2,
        "time_slot": None,
    }
    for content in llm_request.contents or []:
        for part in content.parts or []:
            if not part.text:
                continue
            text = part.text.strip()
            if _FIND_RE.match(text):
                _, fields = _parse_action(text)
                if "Guests" in fields:
                    try:
                        ctx["party_size"] = int(fields["Guests"])
                    except ValueError:
                        pass
                if "Date" in fields and fields["Date"]:
                    ctx["date"] = fields["Date"]
            # "Book Another Table" must be checked before the generic "Book <name>"
            if _BOOK_ANOTHER_RE.match(text):
                continue
            m = _BOOK_RE.match(text)
            if m:
                ctx["restaurant_name"] = m.group(1)
            if _CONTINUE_RE.match(text):
                _, fields = _parse_action(text)
                if "Time" in fields:
                    ctx["time_slot"] = fields["Time"]
    return ctx


def _llm_response(text: str) -> LlmResponse:
    return LlmResponse(content=types.Content(role="model", parts=[types.Part(text=text)]))


def _before_model(
    callback_context: CallbackContext, *, llm_request: LlmRequest
) -> LlmResponse | None:
    """Bypass the LLM for all a2UI form actions — deterministic routing.

    Case 1: A2UI tool response pass-through (function_response in latest content).
    Case 2: "Find Restaurants | ..." — call search_restaurants.
    Case 3: "Book Another Table" — return search form.
    Case 4: "Book <name>" — call get_available_slots.
    Case 5: "Continue | Time: X" — build and return guest form.
    Case 6: "Confirm Booking | ..." — call confirm_booking.
    """
    contents = llm_request.contents or []
    if not contents:
        return None

    # Case 0: First user message — extract intent, then confirm or pre-fill form
    has_prior_model = any(c.role == "model" for c in contents)
    if not has_prior_model:
        first_text = next(
            (p.text.strip() for c in contents if c.role == "user" for p in (c.parts or []) if p.text),
            "",
        )
        params = _extract_initial_params(first_text) if first_text else {}
        location = params.get("location", "")
        cuisine = params.get("cuisine", "any")
        party_size = params.get("party_size", 2)
        date_iso = params.get("date", "")
        date_display = params.get("date_display", "")

        if location and date_iso:
            _log.info(
                "intercept: first message → intent confirmation (loc=%r, cuisine=%r, guests=%d, date=%r)",
                location, cuisine, party_size, date_iso,
            )
            nodes = build_intent_confirmation(location, cuisine, party_size, date_iso, date_display)
        else:
            _log.info(
                "intercept: first message → pre-filled form (loc=%r, cuisine=%r, guests=%d, date=%r)",
                location, cuisine, party_size, date_iso,
            )
            nodes = build_search_form(
                location_value=location,
                cuisine_value=cuisine,
                guests_value=party_size,
                date_value=date_iso,
            )
        return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

    latest = contents[-1]

    # Case 1 — a2UI tool response
    for part in latest.parts or []:
        if part.function_response and part.function_response.name in _A2UI_TOOLS:
            result = (part.function_response.response or {}).get("result", "")
            _log.info("intercept: %s → pass through", part.function_response.name)
            return _llm_response(result)

    # Form action routing — check text parts in latest content
    for part in latest.parts or []:
        if not part.text:
            continue
        text = part.text.strip()

        # Case: Edit Search — user wants to adjust auto-extracted params
        if _EDIT_SEARCH_RE.match(text):
            _, fields = _parse_action(text)
            location = fields.get("Location", "")
            cuisine = fields.get("Cuisine", "any")
            date_val = fields.get("Date", "")
            try:
                party_size = int(fields.get("Guests", "2"))
            except ValueError:
                party_size = 2
            _log.info("intercept: Edit Search → pre-filled form (loc=%r, cuisine=%r)", location, cuisine)
            nodes = build_search_form(
                location_value=location,
                cuisine_value=cuisine,
                guests_value=party_size,
                date_value=date_val,
            )
            return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

        # Case 2 — search form submitted
        if _FIND_RE.match(text):
            _, fields = _parse_action(text)
            location = fields.get("Location", "").strip()
            date_val = fields.get("Date", "").strip()
            cuisine = fields.get("Cuisine", "any")
            try:
                party_size = int(fields.get("Guests", "2"))
            except ValueError:
                party_size = 2

            location_error = "Please enter a location" if not location else ""
            date_error = "Please pick a date" if not date_val else ""

            if location_error or date_error:
                _log.info("intercept: Find Restaurants → validation errors (loc=%r, date=%r)", location_error, date_error)
                nodes = build_search_form(
                    location_error=location_error,
                    date_error=date_error,
                    location_value=location,
                    cuisine_value=cuisine,
                    guests_value=party_size,
                    date_value=date_val,
                )
                return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

            _log.info("intercept: Find Restaurants(%s, %s, %d)", location, cuisine, party_size)
            return _llm_response(search_restaurants(location, cuisine, party_size))

        # Case 3 — restart flow
        if _BOOK_ANOTHER_RE.match(text):
            _log.info("intercept: Book Another Table → search form")
            nodes = build_search_form()
            return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

        # Case 4 — time slot picker
        m = _BOOK_RE.match(text)
        if m:
            restaurant_name = m.group(1)
            ctx = _extract_context(llm_request)
            _log.info("intercept: Book %s → get_available_slots", restaurant_name)
            return _llm_response(get_available_slots(restaurant_name, ctx["date"], ctx["party_size"]))

        # Case 5 — guest details form
        if _CONTINUE_RE.match(text):
            _, fields = _parse_action(text)
            time_slot = fields.get("Time", "").strip()
            ctx = _extract_context(llm_request)
            restaurant_name = ctx["restaurant_name"] or "the restaurant"

            if not time_slot:
                _log.info("intercept: Continue → time validation error (%s)", restaurant_name)
                restaurant = find_restaurant_by_name(restaurant_name)
                if restaurant:
                    nodes = build_slots_card(
                        restaurant, ctx["date"], ctx["party_size"],
                        time_error="Please select a time slot",
                    )
                    return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

            _log.info("intercept: Continue → guest form (%s, %s, %s)", restaurant_name, ctx["date"], time_slot)
            nodes = build_guest_form(restaurant_name, ctx["date"], time_slot, ctx["party_size"])
            return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

        # Case 6 — confirmation
        if _CONFIRM_RE.match(text):
            _, fields = _parse_action(text)
            ctx = _extract_context(llm_request)
            restaurant_name = ctx["restaurant_name"] or "the restaurant"
            time_slot = ctx["time_slot"] or "7:00 PM"
            guest_name = fields.get("Name", "").strip()
            email = fields.get("Email", "").strip()
            phone = fields.get("Phone", "").strip()

            name_error = "Please enter your full name" if not guest_name else ""
            email_error = "Please enter your email address" if not email else ""

            if name_error or email_error:
                _log.info("intercept: Confirm Booking → validation errors (name=%r, email=%r)", name_error, email_error)
                nodes = build_guest_form(
                    restaurant_name, ctx["date"], time_slot, ctx["party_size"],
                    name_error=name_error, email_error=email_error,
                )
                return _llm_response(f"<a2ui-json>{serialize(nodes)}</a2ui-json>")

            _log.info(
                "intercept: Confirm Booking → confirm(%s, %s, %s, %s)",
                restaurant_name, ctx["date"], time_slot, guest_name,
            )
            return _llm_response(
                confirm_booking(restaurant_name, ctx["date"], time_slot, ctx["party_size"], guest_name, email, phone)
            )

    return None


def search_restaurants(location: str, cuisine: str = "any", party_size: int = 2) -> str:
    """Search for available restaurants by location and cuisine.

    Args:
        location: Suburb or city (e.g. "Sydney CBD", "Newtown").
        cuisine: Cuisine type — "Italian", "Japanese", "Thai", "Modern Australian", or "any".
        party_size: Number of diners (default 2).
    """
    results = find_restaurants(location, cuisine, party_size)
    if not results:
        return f"No restaurants found for {cuisine} cuisine in {location}. Try a different cuisine or location."
    nodes = build_search_results(results)
    return f"Here are {len(results)} restaurants in {location}:\n<a2ui-json>{serialize(nodes)}</a2ui-json>"


def get_available_slots(restaurant_name: str, date: str, party_size: int = 2) -> str:
    """Get available booking time slots for a specific restaurant.

    Args:
        restaurant_name: Name of the restaurant (partial match is fine).
        date: Requested date in plain English (e.g. "Saturday 21 June").
        party_size: Number of diners (default 2).
    """
    restaurant = find_restaurant_by_name(restaurant_name)
    if not restaurant:
        return f"Could not find a restaurant matching '{restaurant_name}'. Please check the name and try again."
    nodes = build_slots_card(restaurant, date, party_size)
    return (
        f"Available times at {restaurant['name']} on {date}:\n"
        f"<a2ui-json>{serialize(nodes)}</a2ui-json>"
    )


def confirm_booking(
    restaurant_name: str,
    date: str,
    time_slot: str,
    party_size: int,
    guest_name: str,
    email: str,
    phone: str = "",
) -> str:
    """Confirm a restaurant booking and return a confirmation card.

    Args:
        restaurant_name: Name of the restaurant.
        date: Booking date in plain English.
        time_slot: Selected time (e.g. "7:00 PM").
        party_size: Number of diners.
        guest_name: Full name of the lead guest.
        email: Guest email address.
        phone: Guest phone number (optional).
    """
    restaurant = find_restaurant_by_name(restaurant_name)
    if not restaurant:
        return f"Could not find '{restaurant_name}'. Please check the name."
    confirmation = generate_confirmation_number()
    nodes = build_confirmation_card(
        restaurant, date, time_slot, party_size, guest_name, email, confirmation
    )
    _log.info("booking confirmed: %s %s %s %s", confirmation, restaurant["name"], date, time_slot)
    return f"<a2ui-json>{serialize(nodes)}</a2ui-json>"


_INSTRUCTION = """\
You are a restaurant booking assistant for Australia.

Tools available:
  search_restaurants(location, cuisine, party_size)
  get_available_slots(restaurant_name, date, party_size)
  confirm_booking(restaurant_name, date, time_slot, party_size, guest_name, email, phone)

Decision rules — apply the FIRST matching rule:

RULE 1 — Search:
  Trigger: user asks to find, show, or list restaurants.
  Action: call search_restaurants immediately.

RULE 2 — Show available times:
  Trigger: message is "Book <name>", "Reserve <name>", "I want to book <name>",
           or any variant where the user names a specific restaurant.
  Action: call get_available_slots(restaurant_name=<name>, date=<date from context>,
          party_size=<size from context>) immediately.
  NOTE: "Book La Dolce Vita" means show times for La Dolce Vita — do NOT search again.

RULE 3 — Confirm booking:
  Trigger: user has selected a time slot AND provided a name AND provided an email.
  Action: call confirm_booking immediately with all fields from context.

RULE 4 — Ask for missing details:
  Trigger: user provided a time slot but no name or email yet.
  Action: reply "What name and email should I use for the reservation?"

RULE 5 — General:
  Action: reply in 1-2 sentences. Do not call a tool.

A2UI components you can emit in any response by including a <a2ui-json> block:
  FeedbackSurvey — collects a star rating and optional comment from the user.
    Props: title (string), description (string), submitLabel (string), commentPlaceholder (string)
    Example: {"type":"FeedbackSurvey","props":{"title":"How did we do?","description":"Rate your experience"}}
    Use after any positive completion where feedback is appropriate.

Strict requirements:
- Never write a plan, summary, or preamble before calling a tool. Call the tool first.
- Never call search_restaurants when the user is booking or selecting a restaurant.
- Output tool results exactly as returned. Do not paraphrase or summarise.
"""

root_agent = Agent(
    model="openai/google/gemma-4-12b-qat",
    name="restaurant_agent",
    description="A restaurant booking assistant that finds restaurants and manages reservations.",
    instruction=_INSTRUCTION,
    tools=[search_restaurants, get_available_slots, confirm_booking],
    before_model_callback=_before_model,
)
