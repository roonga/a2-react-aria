import path from "node:path"
import { fileURLToPath } from "node:url"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// Storybook's VitestManager filters projects by "storybook:<configDir>" (forward slashes).
// The filter is applied before per-project plugins run, so the name must be set statically.
const storybookConfigDir = path.resolve(dirname, ".storybook").split(path.sep).join("/")

export default defineConfig({
	plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
	test: {
		name: `storybook:${storybookConfigDir}`,
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({}),
			instances: [{ browser: "chromium" }],
		},
	},
})
