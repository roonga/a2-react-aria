export interface SurveyAnswers {
	[key: string]: string | string[]
}

export interface SurveyStep {
	id: string
	title: string
	nodes: unknown[]
	/** Return true to skip this step based on prior answers */
	skip?: (answers: SurveyAnswers) => boolean
}

const COUNTRIES = ["Australia", "Canada", "Germany", "India", "United Kingdom", "United States", "Other"]

const LANGUAGES = [
	"JavaScript",
	"TypeScript",
	"Python",
	"Rust",
	"Go",
	"Java",
	"C#",
	"C/C++",
	"PHP",
	"Ruby",
	"Swift",
	"Kotlin",
]

const FRAMEWORKS = [
	"React",
	"Next.js",
	"Vue",
	"Angular",
	"Svelte",
	"Django",
	"FastAPI",
	"Spring Boot",
	"ASP.NET",
	"Laravel",
	"Ruby on Rails",
]

const IDES = ["VS Code", "JetBrains IDE", "Vim / Neovim", "Emacs", "Visual Studio", "Xcode", "Sublime Text"]

const AI_TOOLS = ["GitHub Copilot", "Claude", "ChatGPT", "Cursor", "Gemini", "None of the above"]

function radioOptions(values: string[]) {
	return values.map((v) => ({
		type: "Radio",
		props: { value: v },
		children: v,
	}))
}

function checkboxOptions(values: string[]) {
	return values.map((v) => ({
		type: "Checkbox",
		props: { value: v },
		children: v,
	}))
}

function navButtons(back: boolean) {
	const buttons: unknown[] = []
	if (back) {
		buttons.push({
			type: "Button",
			props: { variant: "secondary", value: "__back__" },
			children: "Back",
		})
	}
	buttons.push({
		type: "Button",
		props: { variant: "primary", value: "__next__" },
		children: "Next",
	})
	return {
		type: "Flex",
		props: { gap: "sm", justify: "end" },
		children: buttons,
	}
}

export const SURVEY_STEPS: SurveyStep[] = [
	{
		id: "welcome",
		title: "Welcome",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "xl", weight: "bold", align: "center" },
						children: "Developer Survey 2026",
					},
					{
						type: "Text",
						props: { color: "muted", align: "center", size: "sm" },
						children: "10 minutes · anonymous · helps us understand the developer community",
					},
					{
						type: "Flex",
						props: { gap: "sm", justify: "center" },
						children: [
							{
								type: "Button",
								props: { variant: "primary", size: "lg", value: "__next__" },
								children: "Start Survey",
							},
						],
					},
				],
			},
		],
	},
	{
		id: "about",
		title: "About You",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "About You",
					},
					{
						type: "Select",
						props: {
							label: "Which country are you based in?",
							name: "country",
							isRequired: true,
							options: COUNTRIES.map((c) => ({ value: c, label: c })),
						},
					},
					{
						type: "RadioGroup",
						props: { label: "What is your age range?", name: "age", isRequired: true },
						children: radioOptions(["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"]),
					},
					{
						type: "RadioGroup",
						props: {
							label: "What is your highest level of education?",
							name: "education",
							isRequired: true,
						},
						children: radioOptions([
							"Secondary school",
							"Some college / university",
							"Associate degree",
							"Bachelor's degree",
							"Master's degree",
							"Doctoral degree",
							"Professional degree",
						]),
					},
					navButtons(false),
				],
			},
		],
	},
	{
		id: "employment",
		title: "Employment",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Employment",
					},
					{
						type: "RadioGroup",
						props: {
							label: "Which best describes your current employment status?",
							name: "employment",
							isRequired: true,
						},
						children: radioOptions([
							"Employed full-time",
							"Employed part-time",
							"Self-employed / freelancer",
							"Student",
							"Not employed but looking",
							"Not employed and not looking",
						]),
					},
					{
						type: "RadioGroup",
						props: {
							label: "How do you work?",
							name: "workStyle",
							isRequired: true,
						},
						children: radioOptions(["Fully remote", "Hybrid", "In-person / on-site", "Not applicable"]),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "experience",
		title: "Experience",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Experience",
					},
					{
						type: "RadioGroup",
						props: {
							label: "How many years have you been coding?",
							name: "yearsTotal",
							isRequired: true,
						},
						children: radioOptions(["Less than 1 year", "1–4 years", "5–9 years", "10–19 years", "20+ years"]),
					},
					{
						type: "RadioGroup",
						props: {
							label: "How many years have you coded professionally?",
							name: "yearsPro",
							isRequired: true,
						},
						children: radioOptions([
							"Less than 1 year",
							"1–4 years",
							"5–9 years",
							"10–19 years",
							"20+ years",
							"I have not coded professionally",
						]),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "languages",
		title: "Languages",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Programming Languages",
					},
					{
						type: "Text",
						props: { color: "muted", size: "sm" },
						children: "Select all that you have used in the past year.",
					},
					{
						type: "CheckboxGroup",
						props: { label: "Languages used", name: "languages" },
						children: checkboxOptions(LANGUAGES),
					},
					{
						type: "CheckboxGroup",
						props: { label: "Languages you want to learn next year", name: "languagesWant" },
						children: checkboxOptions(LANGUAGES),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "frameworks",
		title: "Frameworks",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Frameworks & Libraries",
					},
					{
						type: "CheckboxGroup",
						props: { label: "Which frameworks do you use regularly?", name: "frameworks" },
						children: checkboxOptions(FRAMEWORKS),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "tools",
		title: "Tools",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Tools & Technology",
					},
					{
						type: "CheckboxGroup",
						props: { label: "Which editors or IDEs do you use?", name: "ides" },
						children: checkboxOptions(IDES),
					},
					{
						type: "RadioGroup",
						props: {
							label: "What is your primary OS for development?",
							name: "os",
							isRequired: true,
						},
						children: radioOptions(["Windows", "macOS", "Linux"]),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "ai",
		title: "AI Tools",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "AI-Assisted Development",
					},
					{
						type: "CheckboxGroup",
						props: {
							label: "Which AI coding tools do you use regularly?",
							name: "aiTools",
						},
						children: checkboxOptions(AI_TOOLS),
					},
					{
						type: "RadioGroup",
						props: {
							label: "How has AI tooling affected your productivity?",
							name: "aiImpact",
							isRequired: true,
						},
						children: radioOptions([
							"Large positive impact",
							"Moderate positive impact",
							"No noticeable impact",
							"Moderate negative impact",
							"I don't use AI tools",
						]),
					},
					{
						type: "TextField",
						props: {
							label: "Any thoughts on AI in your workflow? (optional)",
							name: "aiComment",
						},
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "salary",
		title: "Compensation",
		skip: (a) => a["employment"] === "Student" || a["employment"] === "Not employed and not looking",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "lg", weight: "semibold" },
						children: "Compensation",
					},
					{
						type: "RadioGroup",
						props: {
							label: "What is your approximate annual salary (USD)?",
							name: "salary",
							isRequired: true,
						},
						children: radioOptions([
							"Under $30,000",
							"$30,000–$59,999",
							"$60,000–$99,999",
							"$100,000–$149,999",
							"$150,000–$199,999",
							"$200,000+",
							"Prefer not to say",
						]),
					},
					{
						type: "RadioGroup",
						props: {
							label: "How satisfied are you with your compensation?",
							name: "salaryHappy",
							isRequired: true,
						},
						children: radioOptions([
							"Very satisfied",
							"Somewhat satisfied",
							"Neutral",
							"Somewhat unsatisfied",
							"Very unsatisfied",
						]),
					},
					navButtons(true),
				],
			},
		],
	},
	{
		id: "done",
		title: "Done",
		nodes: [
			{
				type: "Card",
				props: { padding: "lg" },
				children: [
					{
						type: "Text",
						props: { as: "h2", size: "xl", weight: "bold", color: "primary", align: "center" },
						children: "Thank you!",
					},
					{
						type: "Text",
						props: { color: "muted", align: "center" },
						children: "Your responses have been recorded. Results will be published later this year.",
					},
				],
			},
		],
	},
]
