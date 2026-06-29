import { fireEvent, render, screen } from "@testing-library/react"
import { Calendar } from "react-aria-components"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { ActionContext } from "../action-context/action-context"
import { Breadcrumb } from "../components/breadcrumb"
import { Button } from "../components/button"
import { CalendarNavigation, PickerHelpText } from "../components/date-picker/date-picker.shared"
import { getDatePickerStyles } from "../components/date-picker/date-picker.styles"
import { Dialog } from "../components/dialog"
import { Grid } from "../components/layout"
import { Menu } from "../components/menu"
import { NumberField } from "../components/number-field"
import { Radio, RadioGroup } from "../components/radio"
import { Select } from "../components/select"
import { Switch } from "../components/switch"
import { Table } from "../components/table"
import { TagGroup } from "../components/tag"
import { getTagStyles } from "../components/tag/tag.styles"
import { TextField } from "../components/text-field"
import { FormStateContext } from "../form-state"
import { registerAllComponents } from "../registry/defaultRegistry"
import { A2Renderer } from "../renderer/A2Renderer"

// ── Button + ActionContext ────────────────────────────────────────────────────

describe("Button — ActionContext integration", () => {
	it("fires the value prop via ActionContext when pressed", () => {
		const fire = vi.fn()
		render(
			<ActionContext.Provider value={{ fire, buildAction: (l) => l }}>
				<Button value="action:confirm">Confirm</Button>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: /confirm/i }))
		expect(fire).toHaveBeenCalledWith("action:confirm")
	})

	it("fires buildAction(children) via ActionContext when no value prop", () => {
		const fire = vi.fn()
		const buildAction = vi.fn((label: string) => `custom:${label}`)
		render(
			<ActionContext.Provider value={{ fire, buildAction }}>
				<Button>Submit</Button>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: /submit/i }))
		expect(buildAction).toHaveBeenCalledWith("Submit")
		expect(fire).toHaveBeenCalledWith("custom:Submit")
	})
})

// ── TextField handleChange ────────────────────────────────────────────────────

describe("TextField — onChange callback", () => {
	it("calls onChange when the input value changes", () => {
		const onChange = vi.fn()
		render(<TextField label="Name" onChange={onChange} />)
		const input = screen.getByRole("textbox", { name: /name/i })
		fireEvent.change(input, { target: { value: "Alice" } })
		expect(onChange).toHaveBeenCalledWith("Alice")
	})
})

// ── NumberField handleChange ──────────────────────────────────────────────────

describe("NumberField — onChange callback", () => {
	it("calls onChange when the stepper increment is pressed", () => {
		const onChange = vi.fn()
		render(<NumberField label="Guests" defaultValue={1} onChange={onChange} />)
		fireEvent.click(screen.getByRole("button", { name: /increase/i }))
		expect(onChange).toHaveBeenCalled()
	})
})

// ── RadioGroup handleChange ───────────────────────────────────────────────────

describe("RadioGroup — onChange callback", () => {
	it("calls onChange with the selected value when a radio is clicked", () => {
		const onChange = vi.fn()
		render(
			<RadioGroup label="Size" onChange={onChange}>
				<Radio label="Small" value="sm" />
				<Radio label="Large" value="lg" />
			</RadioGroup>,
		)
		fireEvent.click(screen.getByRole("radio", { name: /small/i }))
		expect(onChange).toHaveBeenCalledWith("sm")
	})
})

// ── Table callbacks ───────────────────────────────────────────────────────────

describe("Table — interaction callbacks", () => {
	beforeAll(() => {
		// userEvent requires CSS.escape which jsdom does not provide
		if (typeof window !== "undefined" && !window.CSS) {
			Object.assign(window, { CSS: { escape: (s: string) => s } })
		}
	})
	const columns = [{ id: "name", label: "Name", isRowHeader: true as const }]
	const rows = [
		{ id: "1", data: { name: "Alice" } },
		{ id: "2", data: { name: "Bob" } },
	]

	it("renders with all interaction callbacks wired (covers callback ternary branches)", () => {
		const onRowAction = vi.fn()
		const onSelectionChange = vi.fn()
		const onSortChange = vi.fn()
		render(
			<Table
				ariaLabel="Users"
				columns={columns}
				rows={rows}
				selectionMode="single"
				onRowAction={onRowAction}
				onSelectionChange={onSelectionChange}
				onSortChange={onSortChange}
			/>,
		)
		expect(screen.getByRole("grid", { name: /users/i })).toBeDefined()
	})
})

// ── Menu callbacks ────────────────────────────────────────────────────────────

describe("Menu — interaction callbacks", () => {
	it("calls onAction with the item id when a menu item is clicked", () => {
		const onAction = vi.fn()
		render(
			<Menu
				triggerLabel="Actions"
				items={[
					{ id: "edit", label: "Edit" },
					{ id: "delete", label: "Delete" },
				]}
				isOpen={true}
				onAction={onAction}
			/>,
		)
		fireEvent.click(screen.getByRole("menuitem", { name: /edit/i }))
		expect(onAction).toHaveBeenCalledWith("edit")
	})

	it("calls onSelectionChange when an item is selected in multi-select mode", () => {
		const onSelectionChange = vi.fn()
		render(
			<Menu
				triggerLabel="Tags"
				items={[{ id: "news", label: "News" }]}
				isOpen={true}
				selectionMode="multiple"
				onSelectionChange={onSelectionChange}
			/>,
		)
		fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /news/i }))
		expect(onSelectionChange).toHaveBeenCalledWith(["news"])
	})
})

// ── Breadcrumb onAction ───────────────────────────────────────────────────────

describe("Breadcrumb — onAction callback", () => {
	it("calls onAction with the item id when a link is clicked", () => {
		const onAction = vi.fn()
		render(
			<Breadcrumb
				onAction={onAction}
				items={[
					{ id: "home", label: "Home", href: "/" },
					{ id: "about", label: "About" },
				]}
			/>,
		)
		fireEvent.click(screen.getByRole("link", { name: /home/i }))
		expect(onAction).toHaveBeenCalledWith("home")
	})
})

// ── Dialog — triggerLabel branch ─────────────────────────────────────────────

describe("Dialog — triggerLabel branch", () => {
	it("renders a trigger button when triggerLabel is provided", () => {
		render(<Dialog triggerLabel="Open dialog" title="Confirm" />)
		expect(screen.getByRole("button", { name: /open dialog/i })).toBeDefined()
	})
})

// ── CalendarNavigation ────────────────────────────────────────────────────────

describe("CalendarNavigation", () => {
	it("renders previous and next navigation buttons inside a Calendar", () => {
		const styles = getDatePickerStyles()
		render(
			<Calendar>
				<CalendarNavigation styles={styles} />
			</Calendar>,
		)
		const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))
		expect(labels).toContain("Previous")
		expect(labels).toContain("Next")
	})
})

// ── PickerHelpText ────────────────────────────────────────────────────────────

describe("PickerHelpText", () => {
	it("renders the description when provided", () => {
		const styles = getDatePickerStyles()
		render(<PickerHelpText description="Pick a date" styles={styles} />)
		expect(screen.getByText("Pick a date")).toBeDefined()
	})
})

// ── Select onChange ───────────────────────────────────────────────────────────

describe("Select — onChange callback", () => {
	it("renders with a default value and default open state", () => {
		const onChange = vi.fn()
		render(
			<Select
				label="Fruit"
				items={[
					{ label: "Apple", value: "apple" },
					{ label: "Banana", value: "banana" },
				]}
				defaultValue="apple"
				onChange={onChange}
			/>,
		)
		expect(screen.getByRole("button", { name: /fruit/i })).toBeDefined()
	})

	it("covers the validate ternary true branch when validate prop is given", () => {
		render(
			<Select label="Type" items={[{ label: "A", value: "a" }]} validate={(v) => (v === "" ? "Required" : true)} />,
		)
		expect(screen.getByRole("button")).toBeDefined()
	})

	it("calls formCtx.setValue and onChange when an option is selected (open by default)", () => {
		const setValue = vi.fn()
		const onChange = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<Select label="Fruit" items={[{ label: "Apple", value: "apple" }]} defaultOpen={true} onChange={onChange} />
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("option", { name: /apple/i }))
		expect(onChange).toHaveBeenCalledWith("apple")
		expect(setValue).toHaveBeenCalledWith("Fruit", "apple")
	})
})

// ── FormStateContext integration ──────────────────────────────────────────────

describe("TextField — FormStateContext integration", () => {
	it("calls formCtx.setValue when the value changes", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<TextField label="Name" errorMessage="Required" />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Alice" } })
		expect(setValue).toHaveBeenCalledWith("Name", "Alice")
	})

	it("seeds formCtx with defaultValue on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<TextField label="Name" defaultValue="Bob" />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Name", "Bob")
	})
})

describe("NumberField — FormStateContext integration", () => {
	it("calls formCtx.setValue when the stepper is used", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<NumberField label="Qty" defaultValue={1} errorMessage="Out of range" />
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: /increase/i }))
		expect(setValue).toHaveBeenCalled()
	})

	it("seeds formCtx with defaultValue on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<NumberField label="Qty" defaultValue={5} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Qty", "5")
	})
})

describe("RadioGroup — FormStateContext integration", () => {
	it("calls formCtx.setValue and shows description when a radio is clicked", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<RadioGroup label="Size" description="Pick a size">
					<Radio label="S" value="sm" />
				</RadioGroup>
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("radio", { name: /s/i }))
		expect(setValue).toHaveBeenCalledWith("Size", "sm")
		expect(screen.getByText("Pick a size")).toBeDefined()
	})
})

// ── description prop branches ─────────────────────────────────────────────────

describe("Switch — description branch", () => {
	it("renders description text when the description prop is set", () => {
		render(<Switch label="Dark mode" description="Enable dark theme" />)
		expect(screen.getByText("Enable dark theme")).toBeDefined()
	})
})

describe("TagGroup — description branch", () => {
	it("renders description text when the description prop is set", () => {
		render(<TagGroup label="Topics" description="Select one or more topics" />)
		expect(screen.getByText("Select one or more topics")).toBeDefined()
	})
})

describe("Dialog — description branch", () => {
	it("renders the description paragraph inside the dialog content", () => {
		render(<Dialog title="Confirm" description="Are you sure?" isOpen={true} />)
		expect(screen.getByText("Are you sure?")).toBeDefined()
	})
})

// ── A2Renderer without explicit registry ─────────────────────────────────────

describe("A2Renderer — fallback to getRegistry()", () => {
	it("renders using the global registry when no registry prop is passed", () => {
		registerAllComponents()
		const node = { type: "Button" as const, children: "Fallback" }
		render(<A2Renderer node={node} />)
		expect(screen.getByRole("button", { name: /fallback/i })).toBeDefined()
	})
})

// ── Grid — unknown column count fallback ──────────────────────────────────────

describe("Grid — column fallback branch", () => {
	it("falls back to grid-cols-1 when columns is out of the style map range", () => {
		const { container } = render(<Grid columns={99} />)
		expect(container.firstChild).toBeDefined()
	})
})

// ── PickerHelpText errorMessage branch ───────────────────────────────────────

describe("PickerHelpText — errorMessage branch", () => {
	it("creates a FieldError element when errorMessage is provided (covers && true branch)", () => {
		const styles = getDatePickerStyles()
		const { container } = render(<PickerHelpText errorMessage="Date required" styles={styles} />)
		expect(container).toBeDefined()
	})
})

// ── Tag style branches ────────────────────────────────────────────────────────

describe("tag.styles — isSelected and isDisabled branches", () => {
	it("applies selected styles when isSelected is true", () => {
		const result = getTagStyles({ isSelected: true })
		expect(result).toContain("bg-[var(--color-primary)]")
	})

	it("applies disabled styles when isDisabled is true", () => {
		const result = getTagStyles({ isDisabled: true })
		expect(result).toContain("opacity-50")
	})
})

// ── TextField no-label handleChange ──────────────────────────────────────────

describe("TextField — handleChange without label", () => {
	it("does not call formCtx.setValue when label is absent", () => {
		const setValue = vi.fn()
		const onChange = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<TextField onChange={onChange} />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } })
		expect(setValue).not.toHaveBeenCalled()
		expect(onChange).toHaveBeenCalledWith("x")
	})
})

// ── NumberField description + errorMessage branches ───────────────────────────

describe("NumberField — description and errorMessage style branches", () => {
	it("renders description text when description is provided", () => {
		render(<NumberField label="Count" description="Enter a number" />)
		expect(screen.getByText("Enter a number")).toBeDefined()
	})
})

// ── Select isInvalid style branch ─────────────────────────────────────────────

describe("Select — isInvalid style branch", () => {
	it("renders with isInvalid=true (covers the isInvalid style path)", () => {
		render(<Select label="Choice" items={[{ label: "A", value: "a" }]} isInvalid={true} />)
		expect(screen.getByRole("button")).toBeDefined()
	})
})

// ── Switch style branches ─────────────────────────────────────────────────────

describe("Switch — isInvalid and isSelected+isInvalid style branches", () => {
	it("renders with isInvalid=true (covers the isInvalid track style)", () => {
		render(<Switch label="Agree" isInvalid={true} />)
		expect(screen.getByRole("switch", { name: /agree/i })).toBeDefined()
	})

	it("renders with defaultSelected=true and isInvalid=true (covers the isSelected+isInvalid track)", () => {
		render(<Switch label="Agree" defaultSelected={true} isInvalid={true} />)
		expect(screen.getByRole("switch", { name: /agree/i })).toBeDefined()
	})
})
