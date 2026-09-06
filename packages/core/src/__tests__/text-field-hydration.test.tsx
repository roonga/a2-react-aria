import type React from "react"
import { act } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TextField } from "../components/text-field/TextField"

// Typing into a server-rendered field before its bundle arrives must survive hydration.
//
// React Aria renders a CONTROLLED input whatever it is handed: `useTextField` always puts
// `value` into `inputProps`, seeded from `defaultValue || ""`. So on a server-rendered page
// the commit that attaches React writes that initial state onto the DOM, and anything typed
// into the input while the bundle was still downloading is gone. On a `required` field the
// consequence is worse than a lost keystroke: the browser's own constraint validation then
// refuses the submit, with no submit event, no request and nothing on screen to explain it.
//
// The window is real rather than theoretical. Measured downstream on an idle machine, React
// attached 76ms to 404ms after the document commit and wiped the typed value in 12 of 20
// trials; a loaded machine widens it.
//
// These tests reproduce the sequence exactly: render on the server, put the markup in the
// document, type into it, and only then hydrate.

/** Server-render `element` into a detached container, the way a document arrives. */
function serverRender(element: React.ReactElement): HTMLDivElement {
	const container = document.createElement("div")
	container.innerHTML = renderToString(element)
	document.body.appendChild(container)
	return container
}

/** The one input of a server-rendered field. */
function inputOf(container: HTMLElement): HTMLInputElement {
	const input = container.querySelector("input")
	if (input === null) throw new Error("the server render produced no input")
	return input
}

/** Attach React to `container`, as the bundle does when it finally lands. */
async function hydrate(container: HTMLElement, element: React.ReactElement): Promise<void> {
	await act(async () => {
		hydrateRoot(container, element)
	})
}

afterEach(() => {
	document.body.innerHTML = ""
	vi.restoreAllMocks()
})

describe("TextField hydration", () => {
	it("keeps a value typed into the server-rendered input before React attached", async () => {
		const field = <TextField label="Six-digit code" name="code" isRequired />
		const container = serverRender(field)
		const input = inputOf(container)
		expect(input.value).toBe("")

		// The operator types the code while the bundle is still downloading.
		input.value = "814648"

		await hydrate(container, field)

		expect(inputOf(container).value).toBe("814648")
	})

	it("leaves an untouched field exactly as the props describe it", async () => {
		const field = <TextField label="Six-digit code" name="code" />
		const container = serverRender(field)

		await hydrate(container, field)

		expect(inputOf(container).value).toBe("")
	})

	it("adopts a cleared field rather than restoring its defaultValue", async () => {
		const field = <TextField label="Nickname" name="nickname" defaultValue="Ada" />
		const container = serverRender(field)
		const input = inputOf(container)
		expect(input.value).toBe("Ada")

		// Selected the default and deleted it, before React attached.
		input.value = ""

		await hydrate(container, field)

		expect(inputOf(container).value).toBe("")
	})

	it("keeps a defaultValue that nobody touched", async () => {
		const field = <TextField label="Nickname" name="nickname" defaultValue="Ada" />
		const container = serverRender(field)

		await hydrate(container, field)

		expect(inputOf(container).value).toBe("Ada")
	})

	it("leaves a CONTROLLED field to its owner, whatever the DOM holds", async () => {
		// A controlled value is the consumer's statement about what the field shows, so the
		// DOM never overrides it: adopting the typed text here would silently desynchronise
		// the input from the state its owner believes it is rendering.
		const field = <TextField label="Nickname" name="nickname" value="Ada" />
		const container = serverRender(field)
		inputOf(container).value = "typed anyway"

		await hydrate(container, field)

		expect(inputOf(container).value).toBe("Ada")
	})

	it("hydrates without a React mismatch warning", async () => {
		const errors = vi.spyOn(console, "error").mockImplementation(() => {})
		const field = <TextField label="Six-digit code" name="code" isRequired />
		const container = serverRender(field)
		inputOf(container).value = "814648"

		await hydrate(container, field)

		const mismatches = errors.mock.calls.filter((call) => /hydrat|mismatch/i.test(String(call[0])))
		expect(mismatches).toEqual([])
	})

	it("does not read the DOM on an ordinary client mount", async () => {
		// A client-only mount has no server markup to adopt, and a field that reached into
		// the document there could pick up an unrelated node with the same generated id, so
		// the seed is gated on the hydrating render rather than on "is there a document".
		const container = document.createElement("div")
		container.innerHTML = '<input id="planted" value="not mine" />'
		document.body.appendChild(container)

		const mount = document.createElement("div")
		document.body.appendChild(mount)
		await act(async () => {
			createRoot(mount).render(<TextField label="Nickname" name="nickname" />)
		})

		expect(inputOf(mount).value).toBe("")
	})
})
