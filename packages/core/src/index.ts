export type { ButtonNode } from "./components/button"
export { Button, ButtonSchema } from "./components/button"
export type { CheckboxGroupNode, CheckboxNode } from "./components/checkbox"
export { Checkbox, CheckboxGroup, CheckboxGroupSchema, CheckboxSchema } from "./components/checkbox"
export type { DialogNode } from "./components/dialog"
export { Dialog, DialogSchema } from "./components/dialog"
export type { FormNode } from "./components/form"
export { Form, FormSchema } from "./components/form"
export type { MenuItemEntry, MenuNode } from "./components/menu"
export { Menu, MenuSchema } from "./components/menu"
export type { PopoverNode } from "./components/popover"
export { Popover, PopoverSchema } from "./components/popover"
export type { RadioGroupNode, RadioNode } from "./components/radio"
export { Radio, RadioGroup, RadioGroupSchema, RadioSchema } from "./components/radio"
export type { SelectItem, SelectNode } from "./components/select"
export { Select, SelectSchema } from "./components/select"
export type { SwitchNode } from "./components/switch"
export { Switch, SwitchSchema } from "./components/switch"
export type { TextFieldNode } from "./components/text-field"
export { TextField, TextFieldSchema } from "./components/text-field"
export type { TooltipNode } from "./components/tooltip"
export { Tooltip, TooltipSchema } from "./components/tooltip"
// ↑ Component schemas are exported for consumers to validate a2UI JSON before
// passing it to A2Renderer. They are not used internally — see schema/node.ts.
export { createRegistry, getRegistry, registerComponent } from "./registry/registry"
export { A2ErrorBoundary } from "./renderer/A2ErrorBoundary"
export { A2Renderer } from "./renderer/A2Renderer"
export type { A2NodeInput } from "./schema"
export { A2NodeSchema, parseNode, safeParseNode } from "./schema"
export type {
	A2Node,
	A2RendererProps,
	ComponentEntry,
	ComponentRegistry,
} from "./types"

export const VERSION = "0.1.0"
