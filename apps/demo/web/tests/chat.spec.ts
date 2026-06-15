import { expect, test } from "@playwright/test"

// Helpers ─────────────────────────────────────────────────────────────────────

/** Build a minimal SSE body that Chat.tsx SSE parser understands. */
function sseBody(text: string): string {
	const events = [
		// Non-streaming turn (partial: false) carrying the full text
		`data: ${JSON.stringify({ content: { parts: [{ text }] }, partial: false, turnComplete: false })}\n\n`,
		// Signal end of turn
		`data: ${JSON.stringify({ turnComplete: true })}\n\n`,
	]
	return events.join("")
}

/** A2UI JSON that the search_restaurants tool emits (includes Book buttons). */
const SEARCH_A2UI = JSON.stringify([
	{
		type: "Flex",
		props: { direction: "column", gap: "md" },
		children: [
			{
				type: "Text",
				props: { as: "h3", size: "lg", weight: "semibold" },
				children: "2 restaurants found in Sydney CBD",
			},
			{
				type: "Grid",
				props: { columns: 2, gap: "md" },
				children: [
					{
						type: "Card",
						props: { padding: "md", shadow: "sm", radius: "md", border: true },
						children: [
							{ type: "Text", props: { as: "h3", weight: "semibold" }, children: "La Dolce Vita" },
							{ type: "Text", props: { size: "sm", color: "muted" }, children: "Italian · CBD" },
							{ type: "Text", props: { size: "sm" }, children: "⭐ 4.8 · $$" },
							{ type: "Button", props: { variant: "primary", size: "sm" }, children: "Book La Dolce Vita" },
						],
					},
					{
						type: "Card",
						props: { padding: "md", shadow: "sm", radius: "md", border: true },
						children: [
							{ type: "Text", props: { as: "h3", weight: "semibold" }, children: "Osteria Roma" },
							{ type: "Text", props: { size: "sm", color: "muted" }, children: "Italian · Surry Hills" },
							{ type: "Text", props: { size: "sm" }, children: "⭐ 4.6 · $$$" },
							{ type: "Button", props: { variant: "primary", size: "sm" }, children: "Book Osteria Roma" },
						],
					},
				],
			},
		],
	},
])

/** A2UI JSON for the slots card (time slots are Buttons). */
const SLOTS_A2UI = JSON.stringify([
	{
		type: "Card",
		props: { padding: "md", shadow: "sm", radius: "md", border: true },
		children: [
			{ type: "Text", props: { as: "h3", weight: "semibold" }, children: "La Dolce Vita — Available Times" },
			{ type: "Text", props: { size: "sm", color: "muted" }, children: "Saturday 21 June · 2 guests" },
			{
				type: "Flex",
				props: { gap: "sm", wrap: true },
				children: [
					{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "6:00 PM" },
					{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "7:00 PM" },
					{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "8:00 PM" },
				],
			},
		],
	},
])

/** A2UI JSON for the confirmation card. */
const CONFIRM_A2UI = JSON.stringify([
	{
		type: "Card",
		props: { padding: "lg", shadow: "md", radius: "md", border: true },
		children: [
			{
				type: "Text",
				props: { as: "h2", size: "xl", weight: "bold", color: "primary", align: "center" },
				children: "Booking Confirmed!",
			},
			{
				type: "Grid",
				props: { columns: 2, gap: "sm" },
				children: [
					{ type: "Text", props: { weight: "semibold" }, children: "Restaurant" },
					{ type: "Text", children: "La Dolce Vita" },
					{ type: "Text", props: { weight: "semibold" }, children: "Date" },
					{ type: "Text", children: "Saturday 21 June" },
					{ type: "Text", props: { weight: "semibold" }, children: "Time" },
					{ type: "Text", children: "7:00 PM" },
					{ type: "Text", props: { weight: "semibold" }, children: "Guests" },
					{ type: "Text", children: "2" },
					{ type: "Text", props: { weight: "semibold" }, children: "Confirmation #" },
					{ type: "Text", props: { color: "primary", weight: "semibold" }, children: "RES-A1B2C3" },
				],
			},
		],
	},
])

// Test setup ──────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
	// Session creation — return a fixed session ID
	await page.route("**/apps/restaurant_agent/users/*/sessions", (route) =>
		route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "test-session-1" }) }),
	)
})

// Tests ───────────────────────────────────────────────────────────────────────

test("chat UI loads with welcome message", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByText("Welcome!")).toBeVisible()
	await expect(page.getByPlaceholder("Type your message…")).toBeVisible()
	await expect(page.getByRole("button", { name: "Send" })).toBeVisible()
})

test("search returns restaurant cards", async ({ page }) => {
	await page.route("**/run_sse", (route) =>
		route.fulfill({
			status: 200,
			contentType: "text/event-stream",
			body: sseBody(`Here are 2 restaurants in Sydney CBD:\n<a2ui-json>${SEARCH_A2UI}</a2ui-json>`),
		}),
	)

	await page.goto("/")
	await page.getByPlaceholder("Type your message…").fill("Italian restaurants in Sydney for 2")
	await page.getByRole("button", { name: "Send" }).click()

	// The plain-text prefix before the a2ui-json block
	await expect(page.getByText("Here are 2 restaurants in Sydney CBD:")).toBeVisible({ timeout: 10_000 })

	// Restaurant cards rendered by A2Renderer
	await expect(page.getByRole("heading", { name: "La Dolce Vita" })).toBeVisible()
	await expect(page.getByRole("heading", { name: "Osteria Roma" })).toBeVisible()
	await expect(page.getByText("Italian · CBD")).toBeVisible()
	await expect(page.getByText("⭐ 4.8 · $$")).toBeVisible()
})

test("clicking Book button sends restaurant name as message", async ({ page }) => {
	const sentMessages: string[] = []

	await page.route("**/run_sse", async (route, request) => {
		const body = JSON.parse(request.postData() ?? "{}") as { new_message?: { parts?: Array<{ text?: string }> } }
		sentMessages.push(body.new_message?.parts?.[0]?.text ?? "")
		route.fulfill({
			status: 200,
			contentType: "text/event-stream",
			body:
				sentMessages.length === 1
					? sseBody(`Here are 2 restaurants:\n<a2ui-json>${SEARCH_A2UI}</a2ui-json>`)
					: sseBody(`Available times at La Dolce Vita:\n<a2ui-json>${SLOTS_A2UI}</a2ui-json>`),
		})
	})

	await page.goto("/")
	await page.getByPlaceholder("Type your message…").fill("Italian restaurants in Sydney for 2")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByRole("button", { name: "Book La Dolce Vita" })).toBeVisible({ timeout: 10_000 })

	// Clicking the Book button should auto-send the button text as a chat message
	await page.getByRole("button", { name: "Book La Dolce Vita" }).click()
	// The slot response arrives — confirms the second run_sse call was made
	await expect(page.getByText("Available times at La Dolce Vita:")).toBeVisible({ timeout: 5_000 })
	expect(sentMessages[1]).toBe("Book La Dolce Vita")
})

test("slot selection shows available times", async ({ page }) => {
	await page.route("**/run_sse", async (route, request) => {
		const body = JSON.parse(request.postData() ?? "{}") as { new_message?: { parts?: Array<{ text?: string }> } }
		const text = body.new_message?.parts?.[0]?.text ?? ""
		const isSearch = /italian|restaurant|find/i.test(text)

		route.fulfill({
			status: 200,
			contentType: "text/event-stream",
			body: isSearch
				? sseBody(`Here are 2 restaurants:\n<a2ui-json>${SEARCH_A2UI}</a2ui-json>`)
				: sseBody(`Available times at La Dolce Vita:\n<a2ui-json>${SLOTS_A2UI}</a2ui-json>`),
		})
	})

	await page.goto("/")
	const input = page.getByPlaceholder("Type your message…")

	await input.fill("Italian restaurants in Sydney for 2")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByRole("heading", { name: "La Dolce Vita" })).toBeVisible({ timeout: 10_000 })

	await input.fill("Book La Dolce Vita on Saturday for 2")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByText("La Dolce Vita — Available Times")).toBeVisible({ timeout: 10_000 })
	await expect(page.getByRole("button", { name: "7:00 PM" })).toBeVisible()
})

test("booking confirmation renders all details", async ({ page }) => {
	await page.route("**/run_sse", async (route, request) => {
		const body = JSON.parse(request.postData() ?? "{}") as { new_message?: { parts?: Array<{ text?: string }> } }
		const text = body.new_message?.parts?.[0]?.text ?? ""

		let responseText: string
		if (/italian|find|search/i.test(text)) {
			responseText = `Here are 2 restaurants:\n<a2ui-json>${SEARCH_A2UI}</a2ui-json>`
		} else if (/book|saturday|slot/i.test(text)) {
			responseText = `Available times:\n<a2ui-json>${SLOTS_A2UI}</a2ui-json>`
		} else if (/7:00 pm/i.test(text)) {
			responseText = "Great pick! What's your name and email for the reservation?"
		} else {
			responseText = `<a2ui-json>${CONFIRM_A2UI}</a2ui-json>`
		}

		route.fulfill({ status: 200, contentType: "text/event-stream", body: sseBody(responseText) })
	})

	await page.goto("/")
	const input = page.getByPlaceholder("Type your message…")

	await input.fill("Italian restaurants in Sydney for 2")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByRole("heading", { name: "La Dolce Vita" })).toBeVisible({ timeout: 10_000 })

	await input.fill("Book La Dolce Vita on Saturday")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByText("La Dolce Vita — Available Times")).toBeVisible({ timeout: 10_000 })

	// Click the 7:00 PM slot button — it auto-sends "7:00 PM"
	await page.getByRole("button", { name: "7:00 PM" }).click()
	// Then provide guest details
	await input.fill("John Smith, john@example.com")
	await page.getByRole("button", { name: "Send" }).click()

	await expect(page.getByText("Booking Confirmed!")).toBeVisible({ timeout: 10_000 })
	await expect(page.getByText("RES-A1B2C3")).toBeVisible()
	await expect(page.getByText("Saturday 21 June", { exact: true })).toBeVisible()
})
