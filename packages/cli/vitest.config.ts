import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["lcov", "text"],
			include: ["src/**/*.ts"],
			exclude: ["src/__tests__/**", "**/*.test.ts", "**/*.spec.ts", "src/index.ts", "src/types.ts"],
		},
	},
})
