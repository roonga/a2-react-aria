import { expect, test } from "@playwright/test"

// Requires: cd apps/demo && docker compose up
// Then: pnpm test:e2e

test.describe("Intent extraction — natural language to confirmation", () => {
	async function sendMessage(page: import("@playwright/test").Page, text: string) {
		const input = page.locator('input[name="chat-message"]')
		await input.fill(text)
		await input.press("Enter")
	}

	test.beforeEach(async ({ page }) => {
		await page.goto("/")
		await page.waitForSelector("text=I can help you find", { timeout: 15_000 })
	})

	test("shows confirmation card when location and date are both present", async ({ page }) => {
		await sendMessage(page, "Italian in Sydney for 2 tomorrow")

		await page.waitForSelector("text=Got it! Here's what I heard:", { timeout: 15_000 })

		await expect(page.getByText("Sydney", { exact: true })).toBeVisible()
		await expect(page.getByText("Italian", { exact: true })).toBeVisible()
		await expect(page.getByText("2 guests")).toBeVisible()
		await expect(page.getByRole("button", { name: "Search Restaurants" })).toBeVisible()
		await expect(page.getByRole("button", { name: "Edit Details" })).toBeVisible()
	})

	test("Search Restaurants button skips form and shows results", async ({ page }) => {
		await sendMessage(page, "Italian in Sydney for 2 tomorrow")
		await page.waitForSelector("text=Got it! Here's what I heard:", { timeout: 15_000 })

		await page.getByRole("button", { name: "Search Restaurants" }).click()

		await page.waitForSelector("text=restaurants found", { timeout: 15_000 })
		await expect(page.getByRole("button", { name: /Book La Dolce Vita/i })).toBeVisible()
	})

	test("Edit Details button returns the pre-filled search form", async ({ page }) => {
		await sendMessage(page, "Italian in Sydney for 2 tomorrow")
		await page.waitForSelector("text=Got it! Here's what I heard:", { timeout: 15_000 })

		await page.getByRole("button", { name: "Edit Details" }).click()

		await page.waitForSelector("text=Find Your Table", { timeout: 15_000 })
		await expect(page.getByRole("textbox", { name: "Location" })).toHaveValue("Sydney")
	})

	test("message without location shows pre-filled form instead of confirmation", async ({ page }) => {
		// No "in <location>" — location is missing, show form pre-filled with what we have
		await sendMessage(page, "Italian for 2 tomorrow")

		await page.waitForSelector("text=Find Your Table", { timeout: 15_000 })
		await expect(page.locator("text=Got it! Here's what I heard:")).not.toBeVisible()
	})

	test("generic greeting shows the empty search form", async ({ page }) => {
		await sendMessage(page, "Hello")

		await page.waitForSelector("text=Find Your Table", { timeout: 15_000 })
		await expect(page.locator("text=Got it! Here's what I heard:")).not.toBeVisible()
	})
})
