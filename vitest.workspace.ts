import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
	// Unit tests in packages/core (runs in packages/core context via turbo: pnpm test)
	"packages/core/vite.config.ts",
	// Storybook component tests in real browser
	"vitest.storybook.config.ts",
])
