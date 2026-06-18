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
	let i = 0
	let j = 0
	while (i < n && j < m) {
		if (aLines[i] === bLines[j]) {
			out.push(`  ${aLines[i]}`)
			i++
			j++
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
			out.push(red(`- ${aLines[i]}`))
			i++
		} else {
			out.push(green(`+ ${bLines[j]}`))
			j++
		}
	}
	while (i < n) out.push(red(`- ${aLines[i++]}`))
	while (j < m) out.push(green(`+ ${bLines[j++]}`))

	const changed = out.some((l) => l.includes("- ") || l.includes("+ "))
	return changed ? out.join("\n") : ""
}
