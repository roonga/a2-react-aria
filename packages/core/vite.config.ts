import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["lcov", "text"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/__tests__/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
		},
	},
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "A2UICore",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [
				"react",
				"react/jsx-runtime",
				"react/jsx-dev-runtime",
				"react-dom",
				"react-aria-components",
				"zod",
				"@internationalized/date",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
	},
})
