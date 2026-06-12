import type { Decorator, Preview } from "@storybook/react"
import "./tailwind.css"

const withDarkClass: Decorator = (Story, context) => {
	const bg = context.globals.backgrounds?.value
	if (bg === "dark") {
		document.documentElement.classList.add("dark")
	} else {
		document.documentElement.classList.remove("dark")
	}
	return <Story />
}

const preview: Preview = {
	decorators: [withDarkClass],
	parameters: {
		backgrounds: {
			options: {
				light: { name: "Light", value: "light" },
				dark: { name: "Dark", value: "dark" },
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
