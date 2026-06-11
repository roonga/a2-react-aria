import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { A2ErrorBoundary } from "../renderer/A2ErrorBoundary"

function Boom(): never {
	throw new Error("test error")
}

describe("A2ErrorBoundary", () => {
	it("renders children normally", () => {
		render(
			<A2ErrorBoundary>
				<span>ok</span>
			</A2ErrorBoundary>,
		)
		expect(screen.getByText("ok")).toBeDefined()
	})

	it("renders fallback when child throws", () => {
		render(
			<A2ErrorBoundary fallback={<span>error fallback</span>}>
				<Boom />
			</A2ErrorBoundary>,
		)
		expect(screen.getByText("error fallback")).toBeDefined()
	})

	it("renders null when child throws and no fallback is provided", () => {
		const { container } = render(
			<A2ErrorBoundary>
				<Boom />
			</A2ErrorBoundary>,
		)
		expect(container.firstChild).toBeNull()
	})
})
