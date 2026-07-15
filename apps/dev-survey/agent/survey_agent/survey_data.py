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


def _q(label: str, input_node: dict, *, required: bool = False, description: str = "", hint: str = "") -> dict:
    inner_props = dict(input_node.get("props") or {})
    inner_props["label"] = label
    if required:
        inner_props["isRequired"] = True
    inner = {**input_node, "props": inner_props}
    sq_props: dict = {}
    if description:
        sq_props["description"] = description
    if hint:
        sq_props["hint"] = hint
    return {"type": "SurveyQuestion", "props": sq_props, "children": inner}


def _page(title: str, children: list[dict], description: str = "") -> dict:
    props: dict = {"title": title}
    if description:
        props["description"] = description
    return {"type": "SurveyPage", "props": props, "children": children}


SURVEY_STEPS: list[dict] = [
    {
        "id": "welcome",
        "title": "Welcome",
        "nodes": [
            _page(
                "Developer Survey 2026",
                [],
                description="10 minutes · anonymous · helps us understand the developer community",
            )
        ],
    },
    {
        "id": "about",
        "title": "About You",
        "nodes": [
            _page("About You", [
                _q("Which country are you based in?", {
                    "type": "Select",
                    "props": {
                        "name": "country",
                        "items": [{"value": c, "label": c} for c in COUNTRIES],
                    },
                }, required=True,
                description="We use this to segment results by region.",
                hint="If your country isn't listed, choose 'Other'."),
                _q("What is your age range?", {
                    "type": "RadioGroup",
                    "props": {"name": "age"},
                    "children": _radio(["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"]),
                }, required=True,
                description="We ask this to help analyse responses across different career stages.",
                hint="Select the range that includes your age at the time you complete this survey."),
                _q("What is your highest level of education?", {
                    "type": "RadioGroup",
                    "props": {"name": "education"},
                    "children": _radio([
                        "Secondary school", "Some college / university", "Associate degree",
                        "Bachelor's degree", "Master's degree", "Doctoral degree", "Professional degree",
                    ]),
                }, required=True,
                description="Your highest completed level of formal education.",
                hint="Select your highest completed level, even if you are currently studying for a higher degree."),
            ])
        ],
    },
    {
        "id": "employment",
        "title": "Employment",
        "nodes": [
            _page("Employment", [
                _q("Which best describes your current employment status?", {
                    "type": "RadioGroup",
                    "props": {"name": "employment"},
                    "children": _radio([
                        "Employed full-time", "Employed part-time", "Self-employed / freelancer",
                        "Student", "Not employed but looking", "Not employed and not looking",
                    ]),
                }, required=True,
                description="Select the option that best describes your current situation.",
                hint="If you are between roles, choose the option that best matches your current situation."),
                _q("How do you work?", {
                    "type": "RadioGroup",
                    "props": {"name": "workStyle"},
                    "children": _radio(["Fully remote", "Hybrid", "In-person / on-site", "Not applicable"]),
                }, required=True,
                description="Think about your typical working arrangement, not exceptions.",
                hint="'Not applicable' covers students, self-employed without a fixed arrangement, and those not currently working."),
            ])
        ],
    },
    {
        "id": "experience",
        "title": "Experience",
        "nodes": [
            _page("Experience", [
                _q("How many years have you been coding?", {
                    "type": "RadioGroup",
                    "props": {"name": "yearsTotal"},
                    "children": _radio(["Less than 1 year", "1–4 years", "5–9 years", "10–19 years", "20+ years"]),
                }, required=True,
                description="Include personal projects, school assignments, and professional work.",
                hint="If you're unsure, think of when you first wrote code regularly."),
                _q("How many years have you coded professionally?", {
                    "type": "RadioGroup",
                    "props": {"name": "yearsPro"},
                    "children": _radio([
                        "Less than 1 year", "1–4 years", "5–9 years", "10–19 years", "20+ years",
                        "I have not coded professionally",
                    ]),
                }, required=True,
                description="Count only years you were paid to write code as part of your role.",
                hint="Include internships and contract or freelance work."),
            ])
        ],
    },
    {
        "id": "languages",
        "title": "Languages",
        "nodes": [
            _page(
                "Programming Languages",
                [
                    _q("Languages used in the past year", {
                        "type": "CheckboxGroup",
                        "props": {"name": "languages"},
                        "children": _checkbox(LANGUAGES),
                    }, description="Include any language you've written code in, even occasionally.",
                    hint="Personal projects, open source contributions, and work all count."),
                    _q("Languages you want to learn next year", {
                        "type": "CheckboxGroup",
                        "props": {"name": "languagesWant"},
                        "children": _checkbox(LANGUAGES),
                    }, description="Which languages are you planning to explore or deepen in the coming year?",
                    hint="Include languages you are already learning, not just ones you are curious about."),
                ],
                description="Select all that apply.",
            )
        ],
    },
    {
        "id": "frameworks",
        "title": "Frameworks",
        "nodes": [
            _page("Frameworks & Libraries", [
                _q("Which frameworks do you use regularly?", {
                    "type": "CheckboxGroup",
                    "props": {"name": "frameworks"},
                    "children": _checkbox(FRAMEWORKS),
                }, description="Include both frontend and backend frameworks you use at least occasionally.",
                hint="A framework you used for a single project this year still counts."),
            ])
        ],
    },
    {
        "id": "tools",
        "title": "Tools",
        "nodes": [
            _page("Tools & Technology", [
                _q("Which editors or IDEs do you use?", {
                    "type": "CheckboxGroup",
                    "props": {"name": "ides"},
                    "children": _checkbox(IDES),
                }, description="Include all editors you use, even occasionally.",
                hint="Count an editor even if you only use it for specific file types or projects."),
                _q("What is your primary OS for development?", {
                    "type": "RadioGroup",
                    "props": {"name": "os"},
                    "children": _radio(["Windows", "macOS", "Linux"]),
                }, required=True,
                description="The operating system you spend most of your development time on.",
                hint="If you split time across OSes, pick the one you use for the majority of your work."),
            ])
        ],
    },
    {
        "id": "ai",
        "title": "AI Tools",
        "nodes": [
            _page("AI-Assisted Development", [
                _q("Which AI coding tools do you use regularly?", {
                    "type": "CheckboxGroup",
                    "props": {"name": "aiTools"},
                    "children": _checkbox(AI_TOOLS),
                }, description="Include tools you use at least occasionally in your development workflow.",
                hint="If you use the same underlying model through multiple clients, count it once."),
                _q("How has AI tooling affected your productivity?", {
                    "type": "RadioGroup",
                    "props": {"name": "aiImpact"},
                    "children": _radio([
                        "Large positive impact", "Moderate positive impact", "No noticeable impact",
                        "Moderate negative impact", "I don't use AI tools",
                    ]),
                }, required=True,
                description="Think about your overall productivity over the past 6 months.",
                hint="If you use different tools for different tasks, pick the option that best describes the overall effect."),
                _q("Any thoughts on AI in your workflow? (optional)", {
                    "type": "TextField",
                    "props": {"name": "aiComment"},
                }, description="What works well, what doesn't, or what you wish existed.",
                hint="Feel free to mention specific tools, workflows, or pain points."),
            ])
        ],
    },
    {
        "id": "salary",
        "title": "Compensation",
        "skipIf": {"field": "employment", "oneOf": ["Student", "Not employed and not looking"]},
        "nodes": [
            _page("Compensation", [
                _q("What is your approximate annual salary (USD)?", {
                    "type": "RadioGroup",
                    "props": {"name": "salary"},
                    "children": _radio([
                        "Under $30,000", "$30,000–$59,999", "$60,000–$99,999",
                        "$100,000–$149,999", "$150,000–$199,999", "$200,000+", "Prefer not to say",
                    ]),
                }, required=True,
                description="Base salary only — do not include bonuses, equity, or other compensation.",
                hint="Convert to USD if you are paid in another currency."),
                _q("How satisfied are you with your compensation?", {
                    "type": "RadioGroup",
                    "props": {"name": "salaryHappy"},
                    "children": _radio([
                        "Very satisfied", "Somewhat satisfied", "Neutral",
                        "Somewhat unsatisfied", "Very unsatisfied",
                    ]),
                }, required=True,
                description="Consider your total package — salary, equity, benefits, and growth opportunities.",
                hint="Your honest response helps us report on satisfaction trends across the community."),
            ])
        ],
    },
    {
        "id": "done",
        "title": "Done",
        "nodes": [
            _page(
                "Thank you!",
                [],
                description="Your responses have been recorded. Results will be published later this year.",
            )
        ],
    },
]
