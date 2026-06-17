import { expect, test } from "@playwright/test"

// Storybook iframe URL for the NumberField GuestCount story
const STORY_URL =
	"/iframe.html?id=components-numberfield--guest-count&viewMode=story&globals=backgrounds:light"

test.describe("NumberField — visual", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(STORY_URL)
		// Wait for the component to mount and the input group to appear
		await page.waitForSelector('[role="group"]')
	})

	test("stepper buttons are contained within the input group border", async ({ page }) => {
		const group = page.locator('[role="group"]')
		const incrementBtn = page.getByRole("button", { name: /increase/i })
		const decrementBtn = page.getByRole("button", { name: /decrease/i })

		const groupBox = await group.boundingBox()
		const incBox = await incrementBtn.boundingBox()
		const decBox = await decrementBtn.boundingBox()

		expect(groupBox).not.toBeNull()
		expect(incBox).not.toBeNull()
		expect(decBox).not.toBeNull()

		if (!groupBox || !incBox || !decBox) return

		// Tolerance of 1px for sub-pixel rendering
		const tol = 1

		// + button must be entirely inside the group's right edge
		expect(incBox.x + incBox.width).toBeLessThanOrEqual(groupBox.x + groupBox.width + tol)
		// + button top and bottom must be within the group
		expect(incBox.y).toBeGreaterThanOrEqual(groupBox.y - tol)
		expect(incBox.y + incBox.height).toBeLessThanOrEqual(groupBox.y + groupBox.height + tol)

		// − button must be entirely inside the group's left edge
		expect(decBox.x).toBeGreaterThanOrEqual(groupBox.x - tol)
		// − button top and bottom must be within the group
		expect(decBox.y).toBeGreaterThanOrEqual(groupBox.y - tol)
		expect(decBox.y + decBox.height).toBeLessThanOrEqual(groupBox.y + groupBox.height + tol)
	})

	test("input group screenshot matches baseline", async ({ page }) => {
		const group = page.locator('[role="group"]')
		// Wait for fonts and styles to settle
		await page.waitForTimeout(200)
		await expect(group).toHaveScreenshot("number-field-input-group.png", {
			// Allow 1% pixel difference for anti-aliasing across platforms
			maxDiffPixelRatio: 0.01,
		})
	})
})
