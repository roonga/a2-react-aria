import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
	integrations: [
		starlight({
			title: "a2ra",
			logo: {
				dark: "./src/assets/logo-dark.svg",
				light: "./src/assets/logo-light.svg",
				replacesTitle: true,
			},
			description: "Accessible React Aria components for AI-generated UIs",
			customCss: ["./src/styles/custom.css"],
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/roonga/a2-react-aria" }],
			components: {
				ThemeSelect: "./src/components/ThemeToggle.astro",
			},
			expressiveCode: {
				// Always use a dark terminal theme regardless of page theme
				themes: ["github-dark", "github-dark"],
				styleOverrides: {
					borderRadius: "0.4rem",
					codeFontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', ui-monospace, 'Consolas', monospace",
					codeFontSize: "0.85rem",
					codeLineHeight: "1.65",
					frames: {
						frameBoxShadowCssValue: "0 4px 24px rgba(0,0,0,0.35)",
					},
				},
			},
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
