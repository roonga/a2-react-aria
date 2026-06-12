import path from "node:path"
import { fileURLToPath } from "node:url"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { defineWorkspace } from "vitest/config"

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineWorkspace([
	// Unit tests in packages/core (runs in packages/core context via turbo: pnpm test)
	"packages/core/vite.config.ts",
	// Storybook component tests in real browser
	{
		plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
		test: {
			name: "storybook",
			browser: {
				enabled: true,
				headless: true,
				provider: playwright({}),
				instances: [{ browser: "chromium" }],
			},
		},
	},
])
