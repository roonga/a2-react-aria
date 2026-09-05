import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Checkbox } from "../components/checkbox/Checkbox"
import { CheckboxGroup } from "../components/checkbox/CheckboxGroup"
import { A2Renderer, createRegistry } from "../index"
import { defaultRegistry } from "../registry/defaultRegistry"

// How a required control says "required", in the two places it has to say it.
//
// The marker is decoration: it is drawn in the label so a sighted person sees the
// obligation before any error fires, and it is hidden from assistive technology because a
// screen reader should announce the required STATE, not read out a literal asterisk after
// the question. A control that renders the marker without `aria-hidden` puts " *" on the
// end of its accessible name.
//
// The state is the machine-readable half, and a control that has one without the other is
// half-built either way.

const registry = createRegistry(Object.fromEntries(defaultRegistry))

/** Node types whose schema accepts a plain labelled, required control. */
function labelledRequiredTypes(): string[] {
	const types: string[] = []
	for (const [type, entry] of defaultRegistry) {
		const parsed = entry.schema.safeParse({
			type,
			props: { label: `${type} question`, isRequired: true, name: "field" },
		})
		if (parsed.success) types.push(type)
	}
	return types.sort()
}

/** The bare `*` markers a control rendered, whatever wraps them. */
function markersIn(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>("span")).filter((span) => span.textContent?.trim() === "*")
}

describe("required affordances", () => {
	const types = labelledRequiredTypes()

	it("derives its cases from the registry, and reaches several controls", () => {
		// A hard-coded list would silently stop covering a control added later, which is the
		// way the NumberField gap survived: it was the one control nobody re-checked.
		expect(types.length).toBeGreaterThan(3)
	})

	it.each(types)("%s hides its required marker from assistive technology", (type) => {
		const { container } = render(
			<A2Renderer
				node={{ type, props: { label: `${type} question`, isRequired: true, name: "field" } }}
				registry={registry}
			/>,
		)
		for (const marker of markersIn(container)) {
			expect(
				marker.getAttribute("aria-hidden"),
				`${type} renders a required marker that a screen reader will read out`,
			).toBe("true")
		}
	})

	it("conveys a required CheckboxGroup's state, not only its marker", async () => {
		// React Aria puts no `aria-required` on the group element, and it cannot: ARIA does
		// not allow the attribute on `role="group"`, so writing it there would be an invalid
		// attribute rather than an announcement. The state lives on the items instead, for
		// exactly as long as nothing is selected, which is React Aria's own encoding of
		// "at least one".
		const { container } = render(
			<CheckboxGroup label="Which conditions apply?" name="conditions" isRequired>
				<Checkbox value="diabetes" label="Diabetes" />
				<Checkbox value="asthma" label="Asthma" />
			</CheckboxGroup>,
		)

		const required = () => container.querySelectorAll("[required], [aria-required='true']")
		expect(required().length, "an empty required group conveys nothing").toBeGreaterThan(0)

		await userEvent.click(screen.getByRole("checkbox", { name: "Diabetes" }))
		expect(required().length, "a satisfied group is no longer required").toBe(0)
	})
})
