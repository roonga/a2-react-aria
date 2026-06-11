import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightTypeDoc from "starlight-typedoc"

export default defineConfig({
	integrations: [
		starlight({
			title: "a2UI",
			description: "Accessible React Aria components for AI-generated UIs",
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/your-org/a2-react-aria" }],
			editLink: {
				baseUrl: "https://github.com/your-org/a2-react-aria/edit/main/docs/",
			},
			sidebar: [
				{ label: "Getting Started", autogenerate: { directory: "guides" } },
				{ label: "Components", autogenerate: { directory: "components" } },
				{ label: "API Reference", autogenerate: { directory: "api" } },
			],
			plugins: [
				starlightTypeDoc({
					entryPoints: ["../packages/core/src/index.ts"],
					tsconfig: "../packages/core/tsconfig.json",
					output: "api",
				}),
			],
		}),
	],
	site: "https://your-org.github.io",
	base: "/a2-react-aria",
})
