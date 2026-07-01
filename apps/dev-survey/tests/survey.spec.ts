import { expect, test } from "@playwright/test"

// Survey steps fixture — mirrors what the backend returns
const SURVEY_STEPS = [
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
					{ type: "Text", props: { as: "h2", size: "lg", weight: "semibold" }, children: "About You" },
					{
						type: "Select",
						props: {
							label: "Which country are you based in?",
							name: "country",
							isRequired: true,
							items: [{ value: "Australia", label: "Australia" }],
						},
					},
					{
						type: "RadioGroup",
						props: { label: "What is your age range?", name: "age", isRequired: true },
						children: [{ type: "Radio", props: { value: "25–34" }, children: "25–34" }],
					},
					{
						type: "RadioGroup",
						props: { label: "What is your highest level of education?", name: "education", isRequired: true },
						children: [{ type: "Radio", props: { value: "Bachelor's degree" }, children: "Bachelor's degree" }],
					},
					{
						type: "Flex",
						props: { gap: "sm", justify: "end" },
						children: [{ type: "Button", props: { variant: "primary", value: "__next__" }, children: "Next" }],
					},
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

test.beforeEach(async ({ page }) => {
	await page.route("**/api/survey/steps", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ steps: SURVEY_STEPS }),
		}),
	)
	await page.route("**/api/survey/submit", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ ok: true, id: "test-sub-1" }),
		}),
	)
})

test("landing page renders survey title", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByRole("heading", { name: "Developer Survey", level: 1 })).toBeVisible()
	await expect(page.getByText("Powered by")).toBeVisible()
	await expect(page.getByText("@a2ra/core")).toBeVisible()
})

test("welcome step is rendered on load", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByRole("heading", { name: "Developer Survey 2026" })).toBeVisible({ timeout: 10_000 })
	await expect(page.getByText("10 minutes · anonymous")).toBeVisible()
	await expect(page.getByRole("button", { name: "Start Survey" })).toBeVisible()
})

test("Start Survey navigates to first question step", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("button", { name: "Start Survey" }).click()
	await expect(page.getByRole("heading", { name: "About You" })).toBeVisible({ timeout: 5_000 })
})

test("progress bar is visible on question steps", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("button", { name: "Start Survey" }).click()
	await expect(page.getByText("About You")).toBeVisible()
	const bar = page.locator(".h-2.flex-1")
	await expect(bar).toBeVisible()
})

test("Next button advances through steps", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("button", { name: "Start Survey" }).click()
	await expect(page.getByRole("heading", { name: "About You" })).toBeVisible({ timeout: 5_000 })
	// Use exact:true to avoid matching the Next.js dev tools button
	await page.getByRole("button", { name: "Next", exact: true }).click()
	await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible({ timeout: 5_000 })
})

test("submit is called when reaching the done step", async ({ page }) => {
	const submittedBodies: unknown[] = []
	await page.route("**/api/survey/submit", async (route, request) => {
		submittedBodies.push(JSON.parse(request.postData() ?? "{}"))
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ ok: true, id: "test-sub-1" }),
		})
	})

	await page.goto("/")
	await page.getByRole("button", { name: "Start Survey" }).click()
	await page.getByRole("button", { name: "Next", exact: true }).click()
	await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible({ timeout: 5_000 })

	await page.waitForTimeout(500)
	expect(submittedBodies.length).toBeGreaterThanOrEqual(1)
})

test("done step shows completion message", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("button", { name: "Start Survey" }).click()
	await page.getByRole("button", { name: "Next", exact: true }).click()
	await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible({ timeout: 5_000 })
	await expect(page.getByText("Your responses have been recorded")).toBeVisible()
})

test("error state is shown when API fails", async ({ page }) => {
	// Override the steps route from beforeEach with an error response
	await page.route("**/api/survey/steps", (route) => route.fulfill({ status: 500, body: "Internal Server Error" }))

	await page.goto("/")
	// Use a partial regex match since the error message includes the HTTP status
	await expect(page.getByText(/Could not load survey/)).toBeVisible({ timeout: 5_000 })
})
