import type { Decorator, Preview } from "@storybook/react"
import "./tailwind.css"

const withDarkClass: Decorator = (Story, context) => {
	// Storybook 10: globals.backgrounds is the option key string or { value: key }
	const data = context.globals.backgrounds
	const name = typeof data === "string" ? data : data?.value
	document.documentElement.classList.toggle("dark", name === "dark")
	return <Story />
}

const preview: Preview = {
	decorators: [withDarkClass],
	parameters: {
		options: {
			storySort: {
				order: ["Components", "Core"],
			},
		},
		backgrounds: {
			options: {
				light: { name: "Light", value: "#ffffff" },
				dark: { name: "Dark", value: "#111827" },
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview
