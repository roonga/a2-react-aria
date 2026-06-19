import type { ComponentType } from "react"
import { Breadcrumb } from "../components/breadcrumb"
import { Button } from "../components/button"
import { Card } from "../components/card"
import { Checkbox, CheckboxGroup } from "../components/checkbox"
import { DatePicker, DateRangePicker } from "../components/date-picker"
import { Dialog } from "../components/dialog"
import { Form } from "../components/form"
import { Flex, Grid } from "../components/layout"
import { Menu } from "../components/menu"
import { NumberField } from "../components/number-field"
import { Popover } from "../components/popover"
import { Radio, RadioGroup } from "../components/radio"
import { Select } from "../components/select"
import { Switch } from "../components/switch"
import { Table } from "../components/table"
import { Tabs } from "../components/tabs"
import { Text } from "../components/text"
import { TextField } from "../components/text-field"
import { Tooltip } from "../components/tooltip"
import { createRegistry, registerComponent } from "./registry"

export const defaultRegistry = createRegistry({
	Breadcrumb: { component: Breadcrumb },
	Button: { component: Button },
	Card: { component: Card },
	Checkbox: { component: Checkbox },
	CheckboxGroup: { component: CheckboxGroup },
	DatePicker: { component: DatePicker },
	DateRangePicker: { component: DateRangePicker },
	Dialog: { component: Dialog },
	Flex: { component: Flex },
	Form: { component: Form },
	Grid: { component: Grid },
	Menu: { component: Menu },
	NumberField: { component: NumberField },
	Popover: { component: Popover },
	Radio: { component: Radio as unknown as ComponentType<Record<string, unknown>> },
	RadioGroup: { component: RadioGroup },
	Select: { component: Select },
	Switch: { component: Switch },
	Table: { component: Table },
	Tabs: { component: Tabs },
	Text: { component: Text },
	TextField: { component: TextField },
	Tooltip: { component: Tooltip },
})

export function registerAllComponents(): void {
	for (const [type, entry] of defaultRegistry) {
		registerComponent(type, entry)
	}
}
