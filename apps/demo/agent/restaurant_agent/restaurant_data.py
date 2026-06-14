"""Mock restaurant data and a2UI JSON builders."""

import json
import random
import string

_RESTAURANTS = [
    {
        "id": "la-dolce-vita",
        "name": "La Dolce Vita",
        "cuisine": "Italian",
        "suburb": "CBD",
        "rating": "4.8",
        "price_range": "$$",
        "time_slots": ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"],
    },
    {
        "id": "osteria-roma",
        "name": "Osteria Roma",
        "cuisine": "Italian",
        "suburb": "Surry Hills",
        "rating": "4.6",
        "price_range": "$$$",
        "time_slots": ["6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "9:00 PM"],
    },
    {
        "id": "sakura-garden",
        "name": "Sakura Garden",
        "cuisine": "Japanese",
        "suburb": "Surry Hills",
        "rating": "4.7",
        "price_range": "$$",
        "time_slots": ["6:00 PM", "6:30 PM", "7:00 PM", "8:00 PM", "8:30 PM"],
    },
    {
        "id": "nobu-sydney",
        "name": "Nobu Sydney",
        "cuisine": "Japanese",
        "suburb": "CBD",
        "rating": "4.9",
        "price_range": "$$$",
        "time_slots": ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"],
    },
    {
        "id": "thai-orchid",
        "name": "Thai Orchid",
        "cuisine": "Thai",
        "suburb": "Newtown",
        "rating": "4.5",
        "price_range": "$",
        "time_slots": ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
    },
    {
        "id": "spice-of-siam",
        "name": "Spice of Siam",
        "cuisine": "Thai",
        "suburb": "Glebe",
        "rating": "4.4",
        "price_range": "$",
        "time_slots": ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
    },
    {
        "id": "quay-restaurant",
        "name": "Quay Restaurant",
        "cuisine": "Modern Australian",
        "suburb": "The Rocks",
        "rating": "4.9",
        "price_range": "$$$$",
        "time_slots": ["6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
    },
    {
        "id": "bentley-restaurant",
        "name": "Bentley Restaurant",
        "cuisine": "Modern Australian",
        "suburb": "CBD",
        "rating": "4.7",
        "price_range": "$$$",
        "time_slots": ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"],
    },
]


def find_restaurants(location: str, cuisine: str = "any", party_size: int = 2) -> list[dict]:
    """Filter restaurants by cuisine. Location is accepted but not filtered (demo data)."""
    if cuisine.lower() == "any":
        return _RESTAURANTS
    return [r for r in _RESTAURANTS if r["cuisine"].lower() == cuisine.lower()]


def find_restaurant_by_name(name: str) -> dict | None:
    """Look up a restaurant by partial name match (case-insensitive)."""
    name_lower = name.lower()
    for r in _RESTAURANTS:
        if name_lower in r["name"].lower() or r["name"].lower() in name_lower:
            return r
    return None


def generate_confirmation_number() -> str:
    suffix = "".join(random.choices(string.digits, k=4))
    return f"RB-20260614-{suffix}"


# ── a2UI JSON builders ────────────────────────────────────────────────────────

def _text(children: str, **props) -> dict:
    node: dict = {"type": "Text"}
    if props:
        node["props"] = props
    node["children"] = children
    return node


def _card(children: list, **props) -> dict:
    node: dict = {"type": "Card"}
    if props:
        node["props"] = props
    node["children"] = children
    return node


def build_search_results(restaurants: list[dict]) -> list:
    count = len(restaurants)
    label = f"{count} restaurant{'s' if count != 1 else ''} found"

    cards = []
    for r in restaurants:
        cards.append(
            _card(
                [
                    _text(r["name"], **{"as": "h3", "weight": "semibold"}),
                    _text(f"{r['cuisine']} · {r['suburb']}", size="sm", color="muted"),
                    _text(f"⭐ {r['rating']} · {r['price_range']}", size="sm"),
                ],
                padding="md",
                shadow="sm",
                radius="md",
                border=True,
            )
        )

    return [
        {
            "type": "Flex",
            "props": {"direction": "column", "gap": "md"},
            "children": [
                _text(label, **{"as": "h3", "size": "lg", "weight": "semibold"}),
                {
                    "type": "Grid",
                    "props": {"columns": 2, "gap": "md"},
                    "children": cards,
                },
            ],
        }
    ]


def build_slots_card(restaurant: dict, date: str, party_size: int) -> list:
    slot_labels = [_text(slot, weight="medium") for slot in restaurant["time_slots"]]

    return [
        _card(
            [
                _text(
                    f"{restaurant['name']} — Available Times",
                    **{"as": "h3", "weight": "bold"},
                ),
                _text(
                    f"{date} · {party_size} {'guest' if party_size == 1 else 'guests'}",
                    size="sm",
                    color="muted",
                ),
                {
                    "type": "Flex",
                    "props": {"gap": "sm", "wrap": True},
                    "children": slot_labels,
                },
                _text(
                    "Reply with your preferred time, then your name, email, and phone number.",
                    size="sm",
                    color="muted",
                ),
            ],
            padding="lg",
            shadow="sm",
            radius="md",
            border=True,
        )
    ]


def build_confirmation_card(
    restaurant: dict,
    date: str,
    time_slot: str,
    party_size: int,
    guest_name: str,
    email: str,
    confirmation_number: str,
) -> list:
    def row(label: str, value: str) -> list:
        return [
            _text(label, weight="semibold"),
            _text(value),
        ]

    detail_cells = (
        row("Restaurant", restaurant["name"])
        + row("Date", date)
        + row("Time", time_slot)
        + row("Party size", f"{party_size} {'guest' if party_size == 1 else 'guests'}")
        + row("Guest name", guest_name)
        + row("Email", email)
        + [
            _text("Confirmation #", weight="semibold"),
            _text(confirmation_number, color="primary"),
        ]
    )

    return [
        _card(
            [
                _text(
                    "Booking Confirmed! 🎉",
                    **{"as": "h2", "size": "xl", "weight": "bold", "color": "primary", "align": "center"},
                ),
                _text(
                    "See you soon! A confirmation email has been sent.",
                    **{"as": "p", "color": "muted", "align": "center"},
                ),
                {
                    "type": "Grid",
                    "props": {"columns": 2, "gap": "sm"},
                    "children": detail_cells,
                },
            ],
            padding="lg",
            shadow="md",
            radius="lg",
            border=True,
        )
    ]


def serialize(nodes: list) -> str:
    return json.dumps(nodes, separators=(",", ":"))
