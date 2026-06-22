import { describe, expect, it } from "vitest"
import { extractA2ui, stripStreamingA2ui } from "../utils/extractA2ui"

describe("extractA2ui", () => {
	it("returns null a2uiJson when no tag is present", () => {
		const result = extractA2ui("Here is a plain message.")
		expect(result.a2uiJson).toBeNull()
		expect(result.plainText).toBe("Here is a plain message.")
	})

	it("extracts a valid JSON node array from the tag", () => {
		const text = `<a2ui-json>[{"type":"Button","children":"OK"}]</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.a2uiJson).toEqual([{ type: "Button", children: "OK" }])
	})

	it("returns empty plainText when the entire response is the tag", () => {
		const text = `<a2ui-json>[{"type":"Card"}]</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.plainText).toBe("")
	})

	it("preserves text before the tag as plainText", () => {
		const text = `Here is your booking.\n<a2ui-json>[{"type":"Card"}]</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.plainText).toBe("Here is your booking.")
		expect(result.a2uiJson).toHaveLength(1)
	})

	it("preserves text after the tag as plainText", () => {
		const text = `<a2ui-json>[{"type":"Card"}]</a2ui-json>\nLet me know if you need help.`
		const result = extractA2ui(text)
		expect(result.plainText).toBe("Let me know if you need help.")
	})

	it("joins text before and after the tag with a newline", () => {
		const text = `Before.\n<a2ui-json>[{"type":"Card"}]</a2ui-json>\nAfter.`
		const result = extractA2ui(text)
		expect(result.plainText).toBe("Before.\nAfter.")
	})

	it("trims leading and trailing whitespace from plainText", () => {
		const text = `   <a2ui-json>[{"type":"Card"}]</a2ui-json>   `
		const result = extractA2ui(text)
		expect(result.plainText).toBe("")
	})

	it("returns null a2uiJson and original text on malformed JSON", () => {
		const text = `<a2ui-json>NOT_JSON</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.a2uiJson).toBeNull()
		expect(result.plainText).toBe(text.trim())
	})

	it("handles an empty JSON array in the tag", () => {
		const text = `<a2ui-json>[]</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.a2uiJson).toEqual([])
	})

	it("handles multi-node arrays", () => {
		const nodes = [{ type: "Card" }, { type: "Button", children: "OK" }]
		const text = `<a2ui-json>${JSON.stringify(nodes)}</a2ui-json>`
		const result = extractA2ui(text)
		expect(result.a2uiJson).toEqual(nodes)
	})
})

describe("stripStreamingA2ui", () => {
	it("returns the text unchanged when no tag is present", () => {
		expect(stripStreamingA2ui("Hello world")).toBe("Hello world")
	})

	it("strips a partial opening tag and everything after it", () => {
		expect(stripStreamingA2ui('Here is your card.\n<a2ui-json>[{"type":')).toBe("Here is your card.\n")
	})

	it("strips a complete tag (open through close) when present", () => {
		const text = `Done!\n<a2ui-json>[{"type":"Card"}]</a2ui-json>`
		expect(stripStreamingA2ui(text)).toBe("Done!\n")
	})

	it("returns an empty string when the text starts with the tag", () => {
		expect(stripStreamingA2ui("<a2ui-json>")).toBe("")
	})
})
