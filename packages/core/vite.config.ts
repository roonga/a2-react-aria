import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
	},
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "A2UICore",
			fileName: "index",
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: ["react", "react-dom", "react-aria-components", "zod"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
	},
})
