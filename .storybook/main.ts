import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

const baseUrl = process.env.STORYBOOK_BASE_URL ?? "/"

const config: StorybookConfig = {
	stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-mcp"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	managerHead: (head) => (baseUrl !== "/" ? `${head}<base href="${baseUrl}">` : head),
	viteFinal: async (config) => {
		config.base = baseUrl
		config.plugins = [tailwindcss(), ...(config.plugins ?? [])]
		return config
	},
}

export default config
