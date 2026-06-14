import { defineConfig, devices } from "@playwright/test"

/**
 * Docker integration config — runs against the live docker compose stack.
 * Start the stack first: docker compose up --build (from apps/demo/)
 * Then run: npx playwright test --config playwright.docker.config.ts
 */
export default defineConfig({
	testDir: "./tests",
	testMatch: "**/full-flow.spec.ts",
	timeout: 300_000, // 5 min — real LLM inference on CPU is slow
	fullyParallel: false,
	retries: 1,
	reporter: "list",
	use: {
		baseURL: "http://localhost:6001",
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
