/**
 * Full-flow E2E test against the live Docker compose stack.
 * No mocks — hits the real ADK agent and LM Studio inference.
 *
 * Prerequisites:
 *   docker compose up --build   (from apps/demo/)
 *   LM Studio serving google/gemma-4-12b-qat on :1234
 *
 * Run: npx playwright test --config playwright.docker.config.ts
 */
import { expect, test } from "@playwright/test"

const LLM_TIMEOUT = 60_000 // generous — LM Studio CPU inference can be slow

test("complete restaurant booking: search → book → slot → confirm", async ({ page }) => {
	// ── 1. Load the app ────────────────────────────────────────────────────────
	await page.goto("/")
	await expect(page.getByText("Welcome!")).toBeVisible()
	const input = page.getByPlaceholder("Type your message…")
	const sendBtn = page.getByRole("button", { name: "Send" })

	// ── 2. Search for Italian restaurants ─────────────────────────────────────
	// Explicit cuisine + location + date so the LLM has all params for the tool call
	await input.fill("Italian restaurants for 2 in Sydney on Saturday")
	await sendBtn.click()

	// before_model_callback intercepts search_restaurants → returns A2UI cards
	await expect(page.getByRole("heading", { name: "La Dolce Vita" })).toBeVisible({
		timeout: LLM_TIMEOUT,
	})
	await expect(page.getByRole("button", { name: "Book La Dolce Vita" })).toBeVisible()
	await expect(page.getByRole("heading", { name: "Osteria Roma" })).toBeVisible()

	// ── 3. Click Book → slot card ─────────────────────────────────────────────
	// Button auto-sends "Book La Dolce Vita"; LLM calls get_available_slots
	await page.getByRole("button", { name: "Book La Dolce Vita" }).click()

	// before_model_callback intercepts get_available_slots → returns slot buttons
	await expect(page.getByText("La Dolce Vita — Available Times")).toBeVisible({
		timeout: LLM_TIMEOUT,
	})
	await expect(page.getByRole("button", { name: "7:00 PM" })).toBeVisible()

	// ── 4. Select time slot ────────────────────────────────────────────────────
	// Button auto-sends "7:00 PM"; LLM sees it lacks name+email so asks for details
	await page.getByRole("button", { name: "7:00 PM" }).click()

	// Wait for loading to complete (input re-enabled after LLM responds)
	await expect(input).toBeEnabled({ timeout: LLM_TIMEOUT })

	// ── 5. Provide guest details → confirmation card ──────────────────────────
	await input.fill("John Smith, john@example.com")
	await expect(sendBtn).toBeEnabled()
	await sendBtn.click()

	// before_model_callback intercepts confirm_booking → returns confirmation card
	const confirmHeading = page.getByRole("heading", { name: "Booking Confirmed!" })
	await expect(confirmHeading).toBeVisible({ timeout: LLM_TIMEOUT })

	// Scope detail assertions to the Card containing the heading — avoids strict-mode
	// violations from "La Dolce Vita" / "7:00 PM" appearing in earlier messages too
	const confirmCard = page.locator("div").filter({ has: confirmHeading }).last()
	await expect(confirmCard).toContainText("La Dolce Vita")
	await expect(confirmCard).toContainText("7:00 PM")
})
