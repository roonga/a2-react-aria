import type { ComponentType } from "react"
import { Accordion, AccordionItem, AccordionItemSchema, AccordionSchema } from "../components/accordion"
import { Alert, AlertSchema } from "../components/alert"
import { Breadcrumb, BreadcrumbSchema } from "../components/breadcrumb"
import { Button, ButtonSchema } from "../components/button"
import { Card, CardSchema } from "../components/card"
import { Checkbox, CheckboxGroup, CheckboxGroupSchema, CheckboxSchema } from "../components/checkbox"
import { DatePicker, DatePickerSchema, DateRangePicker, DateRangePickerSchema } from "../components/date-picker"
import { Dialog, DialogSchema } from "../components/dialog"
import { Form, FormSchema } from "../components/form"
import { Flex, FlexSchema, Grid, GridSchema } from "../components/layout"
import { Menu, MenuSchema } from "../components/menu"
import { NumberField, NumberFieldSchema } from "../components/number-field"
import { Popover, PopoverSchema } from "../components/popover"
import { Radio, RadioGroup, RadioGroupSchema, RadioSchema } from "../components/radio"
import { Select, SelectSchema } from "../components/select"
import { Switch, SwitchSchema } from "../components/switch"
import { Table, TableSchema } from "../components/table"
import { Tabs, TabsSchema } from "../components/tabs"
import { Tag, TagGroup, TagGroupSchema, TagSchema } from "../components/tag"
import { Text, TextSchema } from "../components/text"
import { TextField, TextFieldSchema } from "../components/text-field"
import { Tooltip, TooltipSchema } from "../components/tooltip"
import { createStrictRegistry, registerComponent } from "./registry"

export const defaultRegistry = createStrictRegistry({
	Accordion: { component: Accordion, schema: AccordionSchema },
	AccordionItem: { component: AccordionItem, schema: AccordionItemSchema },
	Alert: { component: Alert, schema: AlertSchema },
	Breadcrumb: { component: Breadcrumb, schema: BreadcrumbSchema },
	Button: { component: Button, schema: ButtonSchema },
	Card: { component: Card, schema: CardSchema },
	Checkbox: { component: Checkbox, schema: CheckboxSchema },
	CheckboxGroup: { component: CheckboxGroup, schema: CheckboxGroupSchema },
	DatePicker: { component: DatePicker, schema: DatePickerSchema },
	DateRangePicker: { component: DateRangePicker, schema: DateRangePickerSchema },
	Dialog: { component: Dialog, schema: DialogSchema },
	Flex: { component: Flex, schema: FlexSchema },
	Form: { component: Form, schema: FormSchema },
	Grid: { component: Grid, schema: GridSchema },
	Menu: { component: Menu, schema: MenuSchema },
	NumberField: { component: NumberField, schema: NumberFieldSchema },
	Popover: { component: Popover, schema: PopoverSchema },
	Radio: { component: Radio as unknown as ComponentType<Record<string, unknown>>, schema: RadioSchema },
	RadioGroup: { component: RadioGroup, schema: RadioGroupSchema },
	Select: { component: Select, schema: SelectSchema },
	Switch: { component: Switch, schema: SwitchSchema },
	Table: { component: Table, schema: TableSchema },
	Tabs: { component: Tabs, schema: TabsSchema },
	Tag: { component: Tag, schema: TagSchema },
	TagGroup: { component: TagGroup, schema: TagGroupSchema },
	Text: { component: Text, schema: TextSchema },
	TextField: { component: TextField, schema: TextFieldSchema },
	Tooltip: { component: Tooltip, schema: TooltipSchema },
})

export function registerAllComponents(): void {
	for (const [type, entry] of defaultRegistry) {
		registerComponent(type, entry)
	}
}
