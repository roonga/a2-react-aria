import logging

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


def _before_model(
    callback_context: CallbackContext, *, llm_request: LlmRequest
) -> LlmResponse | None:
    """Bypass the LLM when a tool that returns a2UI JSON has just responded.

    Checks all content roles (user/tool) because LiteLLM may map function
    responses to role="tool" instead of the Gemini-native role="user".
    """
    for content in reversed(llm_request.contents or []):
        for part in content.parts or []:
            if part.function_response and part.function_response.name in _A2UI_TOOLS:
                result = (part.function_response.response or {}).get("result", "")
                _log.info("intercept: %s → pass through", part.function_response.name)
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

Tools:
- search_restaurants(location, cuisine, party_size)
- get_available_slots(restaurant_name, date, party_size)
- confirm_booking(restaurant_name, date, time_slot, party_size, guest_name, email, phone)

Rules — follow exactly:
1. User wants to find restaurants → call search_restaurants immediately. No preamble.
2. User picks a restaurant or asks to book one → call get_available_slots immediately. No preamble.
3. User provides a time slot plus name and email → call confirm_booking immediately. No preamble.
4. Anything else → reply in 1-2 sentences. Do not call a tool.

Critical: Never write a plan, summary, or explanation before calling a tool.
Call the tool first. Output tool results verbatim without modification.
"""

root_agent = Agent(
    model="openai/google/gemma-4-12b-qat",
    name="restaurant_agent",
    description="A restaurant booking assistant that finds restaurants and manages reservations.",
    instruction=_INSTRUCTION,
    tools=[search_restaurants, get_available_slots, confirm_booking],
    before_model_callback=_before_model,
)
