import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests/visual",
	snapshotDir: "./tests/visual/__snapshots__",
	reporter: [["list"]],
	use: {
		baseURL: "http://localhost:6006",
		// Stable viewport for consistent screenshots
		viewport: { width: 1280, height: 720 },
		// Headless for CI; set HEADED=1 locally to watch
		headless: !process.env.HEADED,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// Do NOT auto-start Storybook — run `pnpm storybook` separately
	webServer: {
		command: "pnpm storybook",
		url: "http://localhost:6006",
		reuseExistingServer: true,
		timeout: 60_000,
	},
})
