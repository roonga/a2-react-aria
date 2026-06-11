import type { Preview } from "@storybook/react"
import { withTheme } from "./decorators"

const preview: Preview = {
	decorators: [withTheme],
	globals: {
		theme: "light",
	},
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
