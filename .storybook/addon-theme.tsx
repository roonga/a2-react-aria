import { addons, types, useGlobals } from "@storybook/core/addons"
import { useCallback } from "react"

const ThemeSwitcher = () => {
	const [globals, updateGlobals] = useGlobals()
	const theme = globals.theme || "light"

	const handleThemeChange = useCallback(
		(newTheme: string) => {
			updateGlobals({ theme: newTheme })
		},
		[updateGlobals],
	)

	return (
		<select
			value={theme}
			onChange={(e) => handleThemeChange(e.target.value)}
			style={{
				padding: "6px 12px",
				borderRadius: "4px",
				border: "1px solid #ddd",
				background: "#fff",
				cursor: "pointer",
				fontSize: "13px",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	)
}

addons.register("a2ui/theme", () => {
	addons.add("a2ui/theme-tool", {
		type: types.TOOL,
		title: "Theme",
		render: ThemeSwitcher,
	})
})
