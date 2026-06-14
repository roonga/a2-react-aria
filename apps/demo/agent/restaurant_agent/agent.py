import logging
import re

from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.llm_agent import Agent
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse
from google.genai import types

from .restaurant_data import (
    build_confirmation_card,
    build_search_results,
    build_slots_card,
    find_restaurant_by_name,
    find_restaurants,
    generate_confirmation_number,
    serialize,
)

_log = logging.getLogger(__name__)

_A2UI_TOOLS = {"search_restaurants", "get_available_slots", "confirm_booking"}

_BOOK_RE = re.compile(r"^Book (.+)$", re.IGNORECASE)
_DAY_RE = re.compile(r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.IGNORECASE)
_SIZE_RE = re.compile(r"\bfor (\d+)\b", re.IGNORECASE)


def _extract_context(llm_request: LlmRequest) -> tuple[str, int]:
    """Scan conversation history for date (day name) and party size."""
    date = "Saturday"
    party_size = 2
    for content in llm_request.contents or []:
        for part in content.parts or []:
            if part.text:
                m = _DAY_RE.search(part.text)
                if m:
                    date = m.group(1).title()
                m = _SIZE_RE.search(part.text)
                if m:
                    party_size = int(m.group(1))
    return date, party_size


def _before_model(
    callback_context: CallbackContext, *, llm_request: LlmRequest
) -> LlmResponse | None:
    """Bypass the LLM for two cases:

    1. A tool that returns a2UI JSON has just responded — pass its result
       straight to the client without re-invoking the LLM.

    2. The latest user message is a "Book <name>" button click — route
       deterministically to get_available_slots so small models can't misfire.

    Only the LATEST content is checked for case 1.  Scanning the entire
    history would re-intercept old function responses on subsequent turns.
    """
    contents = llm_request.contents or []
    if not contents:
        return None

    latest = contents[-1]

    # Case 1 — latest content is an a2UI tool response
    for part in latest.parts or []:
        if part.function_response and part.function_response.name in _A2UI_TOOLS:
            result = (part.function_response.response or {}).get("result", "")
            _log.info("intercept: %s → pass through", part.function_response.name)
            return LlmResponse(
                content=types.Content(
                    role="model",
                    parts=[types.Part(text=result)],
                )
            )

    # Case 2 — "Book <name>" button click → get_available_slots directly
    for part in latest.parts or []:
        if part.text:
            m = _BOOK_RE.match(part.text.strip())
            if m:
                restaurant_name = m.group(1)
                date, party_size = _extract_context(llm_request)
                result = get_available_slots(restaurant_name, date, party_size)
                _log.info(
                    "intercept: Book → get_available_slots(%s, %s, %d)",
                    restaurant_name,
                    date,
                    party_size,
                )
                return LlmResponse(
                    content=types.Content(
                        role="model",
                        parts=[types.Part(text=result)],
                    )
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
