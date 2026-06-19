import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
	integrations: [
		starlight({
			title: "a2UI",
			description: "Accessible React Aria components for AI-generated UIs",
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/roonga/a2-react-aria" }],
			editLink: {
				baseUrl: "https://github.com/roonga/a2-react-aria/edit/main/docs/",
			},
			sidebar: [
				{ label: "Guides", autogenerate: { directory: "guides" } },
				{ label: "Components", autogenerate: { directory: "components" } },
				{
					label: "Component Explorer ↗",
					link: "/a2-react-aria/storybook/",
					attrs: { target: "_blank", rel: "noopener noreferrer" },
				},
			],
		}),
	],
	site: "https://roonga.github.io",
	base: "/a2-react-aria",
})
