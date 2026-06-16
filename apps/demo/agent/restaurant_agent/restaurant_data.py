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

_CUISINES = ["Italian", "Japanese", "Thai", "Modern Australian"]


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
    return f"RB-20260615-{suffix}"


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


def _vflex(children: list, gap: str = "md") -> dict:
    return {"type": "Flex", "props": {"direction": "column", "gap": gap}, "children": children}


def build_search_form(
    location_error: str = "",
    date_error: str = "",
    location_value: str = "",
    cuisine_value: str = "any",
    guests_value: int = 2,
    date_value: str = "",
) -> list:
    """Search form shown on welcome (and re-shown with errors + prior values on failed validation)."""
    cuisine_items = [{"label": "Any cuisine", "value": "any"}] + [
        {"label": c, "value": c} for c in _CUISINES
    ]

    location_props: dict = {
        "label": "Location",
        "placeholder": "e.g. Sydney CBD",
        "isRequired": True,
    }
    if location_value:
        location_props["defaultValue"] = location_value
    if location_error:
        location_props["isInvalid"] = True
        location_props["errorMessage"] = location_error

    date_props: dict = {"label": "Date", "isRequired": True}
    if date_value:
        date_props["defaultValue"] = date_value
    if date_error:
        date_props["isInvalid"] = True
        date_props["errorMessage"] = date_error

    return [
        _card(
            [
                _vflex([
                    _text("Find Your Table", **{"as": "h2", "size": "xl", "weight": "bold"}),
                    _text(
                        "Powered by a2UI + Google ADK",
                        **{"as": "p", "size": "sm", "color": "muted"},
                    ),
                    {
                        "type": "Grid",
                        "props": {"columns": 2, "gap": "md"},
                        "children": [
                            {"type": "TextField", "props": location_props},
                            {
                                "type": "Select",
                                "props": {
                                    "label": "Cuisine",
                                    "items": cuisine_items,
                                    "defaultValue": cuisine_value,
                                },
                            },
                            {
                                "type": "NumberField",
                                "props": {
                                    "label": "Guests",
                                    "minValue": 1,
                                    "maxValue": 20,
                                    "defaultValue": guests_value,
                                    "isRequired": True,
                                },
                            },
                            {"type": "DatePicker", "props": date_props},
                        ],
                    },
                    {
                        "type": "Flex",
                        "props": {"justify": "end", "gap": "sm"},
                        "children": [
                            {
                                "type": "Button",
                                "props": {"variant": "primary"},
                                "children": "Find Restaurants",
                            }
                        ],
                    },
                ])
            ],
            padding="lg",
            shadow="sm",
            radius="lg",
            border=True,
        )
    ]


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
                    {"type": "Button", "props": {"variant": "primary", "size": "sm"}, "children": f"Book {r['name']}"},
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
    """Time-slot picker using RadioGroup so the selection is a proper form field."""
    radio_items = [
        {
            "type": "Radio",
            "props": {"value": slot, "label": slot},
        }
        for slot in restaurant["time_slots"]
    ]

    return [
        _card(
            [
                _vflex([
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
                        "type": "RadioGroup",
                        "props": {
                            "label": "Time",
                            "orientation": "horizontal",
                            "isRequired": True,
                        },
                        "children": radio_items,
                    },
                    {
                        "type": "Flex",
                        "props": {"justify": "end", "gap": "sm"},
                        "children": [
                            {
                                "type": "Button",
                                "props": {"variant": "primary"},
                                "children": "Continue",
                            }
                        ],
                    },
                ])
            ],
            padding="lg",
            shadow="sm",
            radius="md",
            border=True,
        )
    ]


def build_guest_form(
    restaurant_name: str,
    date: str,
    time_slot: str,
    party_size: int,
    name_error: str = "",
    email_error: str = "",
) -> list:
    """Guest details form shown after time slot selection.

    Pass name_error / email_error to surface validation failures inline.
    """
    name_props: dict = {
        "label": "Name",
        "placeholder": "Full name",
        "isRequired": True,
    }
    if name_error:
        name_props["isInvalid"] = True
        name_props["errorMessage"] = name_error

    email_props: dict = {
        "label": "Email",
        "placeholder": "you@example.com",
        "type": "email",
        "isRequired": True,
    }
    if email_error:
        email_props["isInvalid"] = True
        email_props["errorMessage"] = email_error

    return [
        _card(
            [
                _vflex([
                    _text("Your Details", **{"as": "h3", "weight": "bold"}),
                    _text(
                        f"{restaurant_name} · {date} · {time_slot} · {party_size} {'guest' if party_size == 1 else 'guests'}",
                        size="sm",
                        color="muted",
                    ),
                    {
                        "type": "Grid",
                        "props": {"columns": 2, "gap": "md"},
                        "children": [
                            {"type": "TextField", "props": name_props},
                            {"type": "TextField", "props": email_props},
                        ],
                    },
                    {
                        "type": "TextField",
                        "props": {
                            "label": "Phone",
                            "placeholder": "Optional",
                            "type": "tel",
                        },
                    },
                    {
                        "type": "Flex",
                        "props": {"justify": "end", "gap": "sm"},
                        "children": [
                            {
                                "type": "Button",
                                "props": {"variant": "primary"},
                                "children": "Confirm Booking",
                            }
                        ],
                    },
                ])
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
                _vflex([
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
                    {
                        "type": "Flex",
                        "props": {"justify": "center", "gap": "md"},
                        "children": [
                            {
                                "type": "Button",
                                "props": {"variant": "secondary"},
                                "children": "Book Another Table",
                            }
                        ],
                    },
                ])
            ],
            padding="lg",
            shadow="md",
            radius="lg",
            border=True,
        )
    ]


def serialize(nodes: list) -> str:
    return json.dumps(nodes, separators=(",", ":"))
