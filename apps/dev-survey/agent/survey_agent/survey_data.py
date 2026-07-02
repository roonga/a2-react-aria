"""Survey step definitions as A2UI JSON nodes."""

COUNTRIES = ["Australia", "Canada", "Germany", "India", "United Kingdom", "United States", "Other"]

LANGUAGES = [
    "JavaScript", "TypeScript", "Python", "Rust", "Go", "Java",
    "C#", "C/C++", "PHP", "Ruby", "Swift", "Kotlin",
]

FRAMEWORKS = [
    "React", "Next.js", "Vue", "Angular", "Svelte",
    "Django", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
]

IDES = ["VS Code", "JetBrains IDE", "Vim / Neovim", "Emacs", "Visual Studio", "Xcode", "Sublime Text"]

AI_TOOLS = ["GitHub Copilot", "Claude", "ChatGPT", "Cursor", "Gemini", "None of the above"]


def _radio(values: list[str]) -> list[dict]:
    return [{"type": "Radio", "props": {"value": v, "label": v}} for v in values]


def _checkbox(values: list[str]) -> list[dict]:
    return [{"type": "Checkbox", "props": {"value": v, "label": v}} for v in values]


def _nav(back: bool) -> dict:
    buttons: list[dict] = []
    if back:
        buttons.append({"type": "Button", "props": {"variant": "secondary", "value": "__back__"}, "children": "Back"})
    buttons.append({"type": "Button", "props": {"variant": "primary", "value": "__next__"}, "children": "Next"})
    return {"type": "Flex", "props": {"gap": "sm", "justify": "end"}, "children": buttons}


SURVEY_STEPS: list[dict] = [
    {
        "id": "welcome",
        "title": "Welcome",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "xl", "weight": "bold", "align": "center"}, "children": "Developer Survey 2026"},
                    {"type": "Text", "props": {"color": "muted", "align": "center", "size": "sm"}, "children": "10 minutes · anonymous · helps us understand the developer community"},
                    {"type": "Flex", "props": {"gap": "sm", "justify": "center"}, "children": [
                        {"type": "Button", "props": {"variant": "primary", "size": "lg", "value": "__next__"}, "children": "Start Survey"},
                    ]},
                ],
            }
        ],
    },
    {
        "id": "about",
        "title": "About You",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "About You"},
                    {
                        "type": "Select",
                        "props": {
                            "label": "Which country are you based in?",
                            "name": "country",
                            "isRequired": True,
                            "items": [{"value": c, "label": c} for c in COUNTRIES],
                        },
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "What is your age range?", "name": "age", "isRequired": True},
                        "children": _radio(["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"]),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "What is your highest level of education?", "name": "education", "isRequired": True},
                        "children": _radio([
                            "Secondary school", "Some college / university", "Associate degree",
                            "Bachelor's degree", "Master's degree", "Doctoral degree", "Professional degree",
                        ]),
                    },
                    _nav(False),
                ],
            }
        ],
    },
    {
        "id": "employment",
        "title": "Employment",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Employment"},
                    {
                        "type": "RadioGroup",
                        "props": {"label": "Which best describes your current employment status?", "name": "employment", "isRequired": True},
                        "children": _radio([
                            "Employed full-time", "Employed part-time", "Self-employed / freelancer",
                            "Student", "Not employed but looking", "Not employed and not looking",
                        ]),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "How do you work?", "name": "workStyle", "isRequired": True},
                        "children": _radio(["Fully remote", "Hybrid", "In-person / on-site", "Not applicable"]),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "experience",
        "title": "Experience",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Experience"},
                    {
                        "type": "RadioGroup",
                        "props": {"label": "How many years have you been coding?", "name": "yearsTotal", "isRequired": True},
                        "children": _radio(["Less than 1 year", "1–4 years", "5–9 years", "10–19 years", "20+ years"]),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "How many years have you coded professionally?", "name": "yearsPro", "isRequired": True},
                        "children": _radio([
                            "Less than 1 year", "1–4 years", "5–9 years", "10–19 years", "20+ years",
                            "I have not coded professionally",
                        ]),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "languages",
        "title": "Languages",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Programming Languages"},
                    {"type": "Text", "props": {"color": "muted", "size": "sm"}, "children": "Select all that you have used in the past year."},
                    {
                        "type": "CheckboxGroup",
                        "props": {"label": "Languages used", "name": "languages"},
                        "children": _checkbox(LANGUAGES),
                    },
                    {
                        "type": "CheckboxGroup",
                        "props": {"label": "Languages you want to learn next year", "name": "languagesWant"},
                        "children": _checkbox(LANGUAGES),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "frameworks",
        "title": "Frameworks",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Frameworks & Libraries"},
                    {
                        "type": "CheckboxGroup",
                        "props": {"label": "Which frameworks do you use regularly?", "name": "frameworks"},
                        "children": _checkbox(FRAMEWORKS),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "tools",
        "title": "Tools",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Tools & Technology"},
                    {
                        "type": "CheckboxGroup",
                        "props": {"label": "Which editors or IDEs do you use?", "name": "ides"},
                        "children": _checkbox(IDES),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "What is your primary OS for development?", "name": "os", "isRequired": True},
                        "children": _radio(["Windows", "macOS", "Linux"]),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "ai",
        "title": "AI Tools",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "AI-Assisted Development"},
                    {
                        "type": "CheckboxGroup",
                        "props": {"label": "Which AI coding tools do you use regularly?", "name": "aiTools"},
                        "children": _checkbox(AI_TOOLS),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "How has AI tooling affected your productivity?", "name": "aiImpact", "isRequired": True},
                        "children": _radio([
                            "Large positive impact", "Moderate positive impact", "No noticeable impact",
                            "Moderate negative impact", "I don't use AI tools",
                        ]),
                    },
                    {
                        "type": "TextField",
                        "props": {"label": "Any thoughts on AI in your workflow? (optional)", "name": "aiComment"},
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "salary",
        "title": "Compensation",
        "skipIf": {"field": "employment", "oneOf": ["Student", "Not employed and not looking"]},
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "lg", "weight": "semibold"}, "children": "Compensation"},
                    {
                        "type": "RadioGroup",
                        "props": {"label": "What is your approximate annual salary (USD)?", "name": "salary", "isRequired": True},
                        "children": _radio([
                            "Under $30,000", "$30,000–$59,999", "$60,000–$99,999",
                            "$100,000–$149,999", "$150,000–$199,999", "$200,000+", "Prefer not to say",
                        ]),
                    },
                    {
                        "type": "RadioGroup",
                        "props": {"label": "How satisfied are you with your compensation?", "name": "salaryHappy", "isRequired": True},
                        "children": _radio([
                            "Very satisfied", "Somewhat satisfied", "Neutral", "Somewhat unsatisfied", "Very unsatisfied",
                        ]),
                    },
                    _nav(True),
                ],
            }
        ],
    },
    {
        "id": "done",
        "title": "Done",
        "nodes": [
            {
                "type": "Card",
                "props": {"padding": "lg"},
                "children": [
                    {"type": "Text", "props": {"as": "h2", "size": "xl", "weight": "bold", "color": "primary", "align": "center"}, "children": "Thank you!"},
                    {"type": "Text", "props": {"color": "muted", "align": "center"}, "children": "Your responses have been recorded. Results will be published later this year."},
                ],
            }
        ],
    },
]
