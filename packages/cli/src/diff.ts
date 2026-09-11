import { green, red } from "./ui.js"

// Line-level diff via longest-common-subsequence. Returns a unified-style
// string with - / + prefixes, or an empty string when the inputs are identical.
export function diffLines(a: string, b: string): string {
	const aLines = a.split("\n")
	const bLines = b.split("\n")
	const n = aLines.length
	const m = bLines.length

	// LCS length table.
	const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			lcs[i][j] = aLines[i] === bLines[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
		}
	}

	const out: string[] = []
	// Recorded as the walk emits, never recovered from the rendered lines afterwards: a
	// context line is prose, and prose contains "- " (a spaced hyphen) and "+ " often
	// enough that scanning the output reports a file as changed when nothing moved.
	let changed = false
	let i = 0
	let j = 0
	while (i < n && j < m) {
		if (aLines[i] === bLines[j]) {
			out.push(`  ${aLines[i]}`)
			i++
			j++
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
			out.push(red(`- ${aLines[i]}`))
			changed = true
			i++
		} else {
			out.push(green(`+ ${bLines[j]}`))
			changed = true
			j++
		}
	}
	while (i < n) {
		out.push(red(`- ${aLines[i++]}`))
		changed = true
	}
	while (j < m) {
		out.push(green(`+ ${bLines[j++]}`))
		changed = true
	}

	return changed ? out.join("\n") : ""
}
