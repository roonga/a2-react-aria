import { addons, types } from "@storybook/core/addons"
import { Panel } from "./panel"

addons.register("a2ui/json", () => {
	addons.add("a2ui/json/panel", {
		type: types.PANEL,
		title: "a2UI JSON",
		match: ({ viewMode }) => viewMode === "story",
		render: Panel,
	})
})
