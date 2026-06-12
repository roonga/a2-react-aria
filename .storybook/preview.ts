import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview } from "@storybook/react"
import "./tailwind.css"

const preview: Preview = {
	decorators: [
		withThemeByClassName({
			themes: { light: "", dark: "dark" },
			defaultTheme: "light",
		}),
	],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview
