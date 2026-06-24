/**
 * Full-flow E2E test against the live Docker compose stack.
 * No mocks — hits the real ADK agent; _before_model intercepts all form actions
 * deterministically so no LLM inference is needed.
 *
 * Prerequisites:
 *   docker compose up --build   (from apps/demo/)
 *
 * Run: npx playwright test --config playwright.docker.config.ts
 */
import { expect, test } from "@playwright/test"

const AGENT_TIMEOUT = 30_000 // agent response via _before_model is deterministic (no LLM)

test("complete booking flow: search form → results → slots → guest form → confirmation", async ({ page }) => {
	// ── 1. Load app — send first message; agent returns search form ───────────
	await page.goto("/")
	await page.getByPlaceholder("Or type a message…").fill("find me a table")
	await page.getByRole("button", { name: "Send" }).click()
	await expect(page.getByRole("heading", { name: "Find Your Table" })).toBeVisible({
		timeout: AGENT_TIMEOUT,
	})

	// ── 2. Fill search form ────────────────────────────────────────────────────
	await page.getByLabel("Location").fill("Sydney CBD")

	// RAC Select trigger button shows the current selection ("Any cuisine")
	await page.getByRole("button", { name: /any cuisine/i }).click()
	await page.getByRole("option", { name: "Italian" }).click()

	// RAC DatePicker renders dd/mm/yyyy spinbutton segments; click and type to auto-advance
	await page.getByRole("group", { name: "Date" }).click()
	await page.keyboard.type("15072026")

	// ── 3. Submit → _before_model intercepts "Find Restaurants | …" ───────────
	await page.getByRole("button", { name: "Find Restaurants" }).click()

	await expect(page.getByRole("heading", { name: "La Dolce Vita" })).toBeVisible({
		timeout: AGENT_TIMEOUT,
	})
	await expect(page.getByRole("button", { name: "Book La Dolce Vita" })).toBeVisible()
	await expect(page.getByRole("heading", { name: "Osteria Roma" })).toBeVisible()

	// ── 4. Book → _before_model intercepts "Book La Dolce Vita" ───────────────
	await page.getByRole("button", { name: "Book La Dolce Vita" }).click()

	await expect(page.getByText("La Dolce Vita — Available Times")).toBeVisible({
		timeout: AGENT_TIMEOUT,
	})
	await expect(page.getByRole("radio", { name: "7:00 PM" })).toBeVisible()

	// ── 5. Select time and continue → _before_model intercepts "Continue | …" ─
	// RAC hides the native radio input; dispatch click directly to avoid smooth-scroll pointer interception
	await page.getByRole("radio", { name: "7:00 PM" }).dispatchEvent("click")
	await page.getByRole("button", { name: "Continue" }).click()

	// ── 6. Fill guest form ─────────────────────────────────────────────────────
	await expect(page.getByRole("heading", { name: "Your Details" })).toBeVisible({
		timeout: AGENT_TIMEOUT,
	})
	await page.getByLabel("Name").fill("Jane Doe")
	await page.getByLabel("Email").fill("jane@example.com")

	// ── 7. Confirm → _before_model intercepts "Confirm Booking | …" ───────────
	await page.getByRole("button", { name: "Confirm Booking" }).click()

	const confirmHeading = page.getByRole("heading", { name: /Booking Confirmed/i })
	await expect(confirmHeading).toBeVisible({ timeout: AGENT_TIMEOUT })

	// Scope detail assertions to the confirmation Card — avoids strict-mode
	// violations from earlier messages also containing "La Dolce Vita"
	const confirmCard = page.locator("div").filter({ has: confirmHeading }).last()
	await expect(confirmCard).toContainText("La Dolce Vita")
	await expect(confirmCard).toContainText("7:00 PM")
	await expect(confirmCard).toContainText("Jane Doe")
})
