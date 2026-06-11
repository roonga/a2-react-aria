import type { Decorator } from "@storybook/react"
import { useEffect } from "react"
import { type Theme, themes } from "./theme"

const useTheme = (theme: Theme) => {
	useEffect(() => {
		const root = document.documentElement
		const colors = themes[theme].colors

		Object.entries(colors).forEach(([key, value]) => {
			root.style.setProperty(`--color-${key}`, value)
		})

		if (theme === "dark") {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}
	}, [theme])
}

export const withTheme: Decorator = (Story, context) => {
	const theme = (context.globals.theme || "light") as Theme
	useTheme(theme)

	return (
		<div style={{ backgroundColor: `var(--color-background)`, color: `var(--color-text)`, minHeight: "100vh" }}>
			<Story />
		</div>
	)
}
