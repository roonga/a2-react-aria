const A2UI_RE = /<a2ui-json>([\s\S]*?)<\/a2ui-json>/
const A2UI_OPEN_RE = /<a2ui-json>[\s\S]*$/

/**
 * Parses the A2UI agent response format.
 * Extracts the JSON node array from a `<a2ui-json>…</a2ui-json>` tag and
 * returns the surrounding text as `plainText`. Returns `a2uiJson: null` if
 * no tag is present or the JSON is malformed.
 */
export function extractA2ui(text: string): { plainText: string; a2uiJson: unknown[] | null } {
	const match = A2UI_RE.exec(text)
	if (!match) return { plainText: text.trim(), a2uiJson: null }
	try {
		const json = JSON.parse(match[1]) as unknown
		if (!Array.isArray(json)) return { plainText: text.trim(), a2uiJson: null }
		const before = text.slice(0, match.index).trim()
		const after = text.slice(match.index + match[0].length).trim()
		return { plainText: [before, after].filter(Boolean).join("\n").trim(), a2uiJson: json }
	} catch {
		return { plainText: text.trim(), a2uiJson: null }
	}
}

/**
 * Strips an in-progress `<a2ui-json>` tag (and everything after it) from
 * streaming text so the partial JSON block is not shown in the chat bubble
 * while the LLM is still writing it.
 */
export function stripStreamingA2ui(text: string): string {
	return text.replace(A2UI_OPEN_RE, "")
}
