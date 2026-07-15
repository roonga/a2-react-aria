import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "../components/button"
import { ButtonSchema } from "../components/button/button.schema"
import { A2Renderer, createRegistry } from "../index"

const registryWithSchema = createRegistry({
	Button: { component: Button, schema: ButtonSchema },
})

const registryNoSchema = createRegistry(
	{
		Button: { component: Button },
	},
	{ strict: false },
)

describe("A2Renderer schema validation", () => {
	it("renders normally when props satisfy the schema", () => {
		render(
			<A2Renderer
				node={{ type: "Button", props: { variant: "primary" }, children: "Click me" }}
				registry={registryWithSchema}
				fallback={<span>error</span>}
			/>,
		)
		expect(screen.getByRole("button", { name: "Click me" })).toBeDefined()
	})

	it("renders fallback when props contain an unknown key rejected by .strict()", () => {
		render(
			<A2Renderer
				node={{ type: "Button", props: { disabled: true } as Record<string, unknown> }}
				registry={registryWithSchema}
				fallback={<span>schema error</span>}
			/>,
		)
		expect(screen.getByText("schema error")).toBeDefined()
	})

	it("renders fallback when children type is rejected by the schema", () => {
		render(
			<A2Renderer
				// @ts-expect-error — intentionally passing array children where schema expects string
				node={{ type: "Button", children: [{ type: "Button" }] }}
				registry={registryWithSchema}
				fallback={<span>children error</span>}
			/>,
		)
		expect(screen.getByText("children error")).toBeDefined()
	})

	it("passes unknown props through without error when no schema is registered", () => {
		render(
			<A2Renderer
				node={{ type: "Button", props: { disabled: true } as Record<string, unknown>, children: "No schema" }}
				registry={registryNoSchema}
				fallback={<span>error</span>}
			/>,
		)
		expect(screen.getByRole("button", { name: "No schema" })).toBeDefined()
	})
})
