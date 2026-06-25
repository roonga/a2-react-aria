import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	retries: 0,
	reporter: "list",
	use: {
		baseURL: "http://localhost:4321",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "pnpm build && pnpm preview --port 4321",
		url: "http://localhost:4321/a2-react-aria/",
		reuseExistingServer: true,
		timeout: 120_000,
	},
})
