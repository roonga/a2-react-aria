import { defineConfig, devices } from "@playwright/test"

// E2E tests for the demo app (port 9001).
// Requires: cd apps/demo && docker compose up
export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:6001",
		viewport: { width: 1280, height: 720 },
		headless: !process.env.HEADED,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
})
