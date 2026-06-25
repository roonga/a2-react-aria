import { expect, test } from "@playwright/test"

const DOCS_BASE = "/a2-react-aria"

test("no broken internal links", async ({ page, baseURL }) => {
	const origin = (baseURL ?? "http://localhost:4321").replace(/\/$/, "")
	const prefix = `${origin}${DOCS_BASE}`

	const visited = new Set<string>()
	const broken: string[] = []
	const queue = [`${prefix}/`]

	while (queue.length > 0) {
		const url = queue.shift()
		if (!url || visited.has(url)) continue
		visited.add(url)

		const response = await page.goto(url)
		const status = response?.status() ?? 0

		if (status === 404) {
			broken.push(url)
			continue
		}

		// $$eval runs in the browser's sandboxed page context — not JS eval().
		// .href resolves relative URLs to absolute, catching ../page without trailing slash.
		const links = await page.$$eval(
			"main a[href], nav a[href]",
			(anchors, p) => [
				...new Set(
					anchors.map((a) => (a as HTMLAnchorElement).href).filter((h) => h.startsWith(p) && !h.includes("#")),
				),
			],
			prefix,
		)

		for (const link of links) {
			if (!visited.has(link) && !queue.includes(link)) {
				queue.push(link)
			}
		}
	}

	expect(broken, `Broken links found:\n${broken.join("\n")}`).toHaveLength(0)
})
