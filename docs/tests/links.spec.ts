import { expect, test } from "@playwright/test"

const BASE = "/a2-react-aria"

test("no broken internal links", async ({ page }) => {
	const visited = new Set<string>()
	const broken: string[] = []
	const queue = [`${BASE}/`]

	while (queue.length > 0) {
		const path = queue.shift()
		if (!path || visited.has(path)) continue
		visited.add(path)

		const response = await page.goto(path)
		const status = response?.status() ?? 0

		if (status === 404) {
			broken.push(path)
			continue
		}

		// $$eval runs in the browser's sandboxed page context to read href attributes — not JS eval()
		const links = await page.$$eval(
			"main a[href], nav a[href]",
			(anchors, base) => [
				...new Set(
					anchors
						.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? "")
						.filter((h) => h.startsWith(base) && !h.includes("#"))
						.map((h) => (h.endsWith("/") ? h : `${h}/`)),
				),
			],
			BASE,
		)

		for (const link of links) {
			if (!visited.has(link) && !queue.includes(link)) {
				queue.push(link)
			}
		}
	}

	expect(broken, `Broken links found:\n${broken.join("\n")}`).toHaveLength(0)
})
