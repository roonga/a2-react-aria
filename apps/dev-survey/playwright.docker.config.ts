import { defineConfig, devices } from "@playwright/test"

/**
 * Docker integration config — runs against the live docker compose stack.
 * Start the stack first: docker compose up --build (from apps/dev-survey/)
 * Then run: pnpm test:e2e:docker
 */
export default defineConfig({
	testDir: "./tests",
	timeout: 60_000,
	fullyParallel: false,
	retries: 1,
	reporter: "list",
	use: {
		baseURL: "http://localhost:3001",
		trace: "retain-on-failure",
		actionTimeout: 10_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// No webServer — the Docker compose stack must be running
})
