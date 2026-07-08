/**
 * Security tests — OWASP Top 10 coverage for A2UI JSON rendering.
 *
 * A2Renderer is the trust boundary: it receives arbitrary JSON from an agent
 * and renders React components. These tests verify that attacker-controlled
 * input cannot execute scripts, pollute the prototype chain, or bypass the
 * URL sanitizer through encoding tricks.
 *
 * OWASP references are noted on each describe block.
 */
import { render, screen } from "@testing-library/react"
import type React from "react"
import { describe, expect, it } from "vitest"
import { Text } from "../components/text"
import { TextField } from "../components/text-field"
import { A2Renderer, createRegistry } from "../index"
import { safeParseNode } from "../schema"

// Minimal anchor/image wrappers that pass href/src through to the DOM.
// Real components don't expose href/src at all; these let us test sanitizeProps.
const Anchor = ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href}>{children}</a>
const Img = ({ src }: { src?: string }) => <img src={src} alt="" />
const AnchorWithAction = ({ action }: { action?: string }) => (
	<form action={action}>
		<button type="submit">go</button>
	</form>
)
const AnchorWithFormaction = ({ formaction }: { formaction?: string }) => (
	<button type="submit" formAction={formaction}>
		go
	</button>
)
const AnchorWithImageUrl = ({ imageUrl }: { imageUrl?: string }) => <img src={imageUrl} alt="" />
const AnchorWithProfileHref = ({ profileHref }: { profileHref?: string }) => <a href={profileHref}>profile</a>
const AnchorWithThumbnailSrc = ({ thumbnailSrc }: { thumbnailSrc?: string }) => <img src={thumbnailSrc} alt="" />
// Mirrors Breadcrumb's shape: URL props nested inside an array of objects.
const AnchorList = ({ items = [] }: { items?: { href?: string }[] }) => (
	<ul>
		{items.map((it, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: test-only fixture
			<li key={i}>
				<a href={it.href}>link</a>
			</li>
		))}
	</ul>
)

const registry = createRegistry({
	Anchor: { component: Anchor as Parameters<typeof createRegistry>[0][string]["component"] },
	Img: { component: Img as Parameters<typeof createRegistry>[0][string]["component"] },
	AnchorWithAction: { component: AnchorWithAction as Parameters<typeof createRegistry>[0][string]["component"] },
	AnchorWithFormaction: {
		component: AnchorWithFormaction as Parameters<typeof createRegistry>[0][string]["component"],
	},
	AnchorWithImageUrl: { component: AnchorWithImageUrl as Parameters<typeof createRegistry>[0][string]["component"] },
	AnchorWithProfileHref: {
		component: AnchorWithProfileHref as Parameters<typeof createRegistry>[0][string]["component"],
	},
	AnchorWithThumbnailSrc: {
		component: AnchorWithThumbnailSrc as Parameters<typeof createRegistry>[0][string]["component"],
	},
	AnchorList: { component: AnchorList as Parameters<typeof createRegistry>[0][string]["component"] },
	Text: { component: Text },
	TextField: { component: TextField },
})

// ── OWASP A03:2021 — Injection: XSS via HTML in string content ─────────────

describe("A03 XSS — HTML in string content is escaped by React", () => {
	it("renders a <script> tag in children as literal text, not an executable element", () => {
		const { container } = render(
			<A2Renderer node={{ type: "Text", children: "<script>window.__xss=1</script>" }} registry={registry} />,
		)
		expect(container.querySelector("script")).toBeNull()
		expect((window as Record<string, unknown>).__xss).toBeUndefined()
		expect(container.textContent).toContain("<script>")
	})

	it("renders an <img onerror> payload in children as text, not an element", () => {
		const { container } = render(
			<A2Renderer node={{ type: "Text", children: '<img src=x onerror="window.__xss2=1">' }} registry={registry} />,
		)
		expect(container.querySelector("img")).toBeNull()
		expect((window as Record<string, unknown>).__xss2).toBeUndefined()
	})

	it("renders HTML markup in a TextField label as literal text", () => {
		const { container } = render(
			<A2Renderer node={{ type: "TextField", props: { label: "<b>Name</b>" } }} registry={registry} />,
		)
		// No <b> element injected into the DOM; text appears as a literal string
		expect(container.querySelector("b")).toBeNull()
		expect(container.textContent).toContain("<b>Name</b>")
	})

	it("renders HTML in errorMessage as text, not markup", () => {
		const { container } = render(
			<A2Renderer
				node={{
					type: "TextField",
					props: { label: "Email", isInvalid: true, errorMessage: '<svg onload="window.__xss3=1">' },
				}}
				registry={registry}
			/>,
		)
		expect(container.querySelector("svg")).toBeNull()
		expect((window as Record<string, unknown>).__xss3).toBeUndefined()
	})
})

// ── OWASP A03:2021 — Injection: URL scheme sanitization ────────────────────

describe("A03 URL injection — javascript: scheme is blocked regardless of casing/whitespace", () => {
	it("blocks lowercase javascript: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "javascript:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks uppercase JAVASCRIPT: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "JAVASCRIPT:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks mixed-case JavaScript: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "JavaScript:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks javascript: href with leading spaces", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "   javascript:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks javascript: href with leading tab", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "\tjavascript:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks javascript: href with leading newline", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "\njavascript:alert(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})
})

describe("A03 URL injection — vbscript: scheme is blocked", () => {
	it("blocks vbscript: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "vbscript:MsgBox(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks VBSCRIPT: href (uppercase)", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "VBSCRIPT:MsgBox(1)" }, children: "x" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})
})

describe("A03 URL injection — data: scheme is blocked in URL props", () => {
	it("blocks data:text/html src", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Img", props: { src: "data:text/html,<script>alert(1)</script>" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})

	it("blocks data: src with base64-encoded payload", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Img", props: { src: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})

	it("blocks javascript: in a form action prop", () => {
		const { container } = render(
			<A2Renderer node={{ type: "AnchorWithAction", props: { action: "javascript:alert(1)" } }} registry={registry} />,
		)
		expect(container.querySelector("form")?.getAttribute("action")).toBe("about:blank")
	})

	it("blocks javascript: in a formaction prop", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "AnchorWithFormaction", props: { formaction: "javascript:alert(1)" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("button")?.getAttribute("formaction")).toBe("about:blank")
	})

	it("blocks javascript: in a camelCase *Url prop (e.g. imageUrl)", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "AnchorWithImageUrl", props: { imageUrl: "javascript:alert(1)" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})

	it("blocks javascript: in a *Href prop (e.g. profileHref)", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "AnchorWithProfileHref", props: { profileHref: "javascript:alert(1)" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("blocks javascript: in a *Src prop (e.g. thumbnailSrc)", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "AnchorWithThumbnailSrc", props: { thumbnailSrc: "javascript:alert(1)" } }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})
})

describe("A03 URL injection — safe URLs are allowed through unchanged", () => {
	it("allows https: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "https://example.com" }, children: "link" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com")
	})

	it("allows http: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "http://example.com" }, children: "link" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("http://example.com")
	})

	it("allows relative href", () => {
		const { container } = render(
			<A2Renderer node={{ type: "Anchor", props: { href: "/about" }, children: "link" }} registry={registry} />,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("/about")
	})

	it("allows mailto: href", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "mailto:user@example.com" }, children: "email" }}
				registry={registry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("mailto:user@example.com")
	})

	it("does not sanitize non-URL props that happen to contain 'data:'", () => {
		// A prop named 'label' is not a URL prop — data: value must pass through
		const { container } = render(
			<A2Renderer node={{ type: "TextField", props: { label: "data:driven form" } }} registry={registry} />,
		)
		expect(screen.getByText("data:driven form")).toBeDefined()
		expect(container.textContent).toContain("data:driven form")
	})
})

describe("A03 URL injection — nested URL props inside arrays/objects are sanitized", () => {
	it("blocks javascript: in an array-nested href (Breadcrumb items[].href shape)", () => {
		const { container } = render(
			<A2Renderer
				node={{
					type: "AnchorList",
					props: { items: [{ href: "https://ok.example" }, { href: "javascript:alert(1)" }] },
				}}
				registry={registry}
			/>,
		)
		const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"))
		expect(hrefs).toEqual(["https://ok.example", "about:blank"])
	})

	it("blocks data: nested one object deep", () => {
		const Wrapper = ({ meta }: { meta?: { src?: string } }) => <img src={meta?.src} alt="" />
		const reg = createRegistry({
			Wrapper: { component: Wrapper as Parameters<typeof createRegistry>[0][string]["component"] },
		})
		const { container } = render(
			<A2Renderer
				node={{ type: "Wrapper", props: { meta: { src: "data:text/html,<script>alert(1)</script>" } } }}
				registry={reg}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})
})

// ── OWASP A08:2021 — Software and Data Integrity: prototype pollution ───────

describe("A08 Prototype pollution — __proto__ and constructor props are harmless", () => {
	it("does not pollute Object.prototype via __proto__ in props", () => {
		// JSON.parse creates a regular property named __proto__, not a prototype mutation.
		// This test ensures our rendering pipeline doesn't accidentally apply Object.assign
		// or spread in a way that could mutate the prototype chain.
		const sentinel = "__xss_proto_test__"
		expect((Object.prototype as Record<string, unknown>)[sentinel]).toBeUndefined()

		const { container } = render(
			<A2Renderer
				node={{
					type: "Text",
					// biome-ignore lint/suspicious/noExplicitAny: intentional prototype pollution probe
					props: { __proto__: { [sentinel]: true } } as any,
					children: "safe",
				}}
				registry={registry}
			/>,
		)
		// The component renders normally — __proto__ is not a known prop, so it is dropped
		expect(container.textContent).toContain("safe")
		// The prototype was not mutated
		expect((Object.prototype as Record<string, unknown>)[sentinel]).toBeUndefined()
	})

	it("does not pollute Object.prototype via constructor.prototype nesting", () => {
		const sentinel = "__xss_ctor_test__"
		expect((Object.prototype as Record<string, unknown>)[sentinel]).toBeUndefined()

		render(
			<A2Renderer
				node={{
					type: "Text",
					// biome-ignore lint/suspicious/noExplicitAny: intentional constructor pollution probe
					props: { constructor: { prototype: { [sentinel]: true } } } as any,
					children: "safe",
				}}
				registry={registry}
			/>,
		)

		expect((Object.prototype as Record<string, unknown>)[sentinel]).toBeUndefined()
	})
})

// ── OWASP A03:2021 — Injection: dangerous React prop bypass ────────────────

describe("A03 React prop injection — dangerouslySetInnerHTML is not forwarded to DOM", () => {
	it("does not execute HTML passed via dangerouslySetInnerHTML in props", () => {
		const { container } = render(
			<A2Renderer
				node={{
					type: "Text",
					// biome-ignore lint/suspicious/noExplicitAny: intentional security probe
					props: { dangerouslySetInnerHTML: { __html: "<script>window.__dih=1</script>" } } as any,
					children: "visible",
				}}
				registry={registry}
			/>,
		)
		// The component ignores the unknown prop; the script does not execute
		expect(container.querySelector("script")).toBeNull()
		expect((window as Record<string, unknown>).__dih).toBeUndefined()
		// The declared children prop still renders
		expect(container.textContent).toContain("visible")
	})

	it("does not execute code passed as an event handler string in props", () => {
		// Event handler strings are not callable; React only accepts functions for handlers
		render(
			<A2Renderer
				node={{
					type: "Text",
					// biome-ignore lint/suspicious/noExplicitAny: intentional security probe
					props: { onClick: "window.__onclick=1" } as any,
					children: "click me",
				}}
				registry={registry}
			/>,
		)
		// The string prop is not a function, so React/RAC does not invoke it
		expect((window as Record<string, unknown>).__onclick).toBeUndefined()
	})
})

// ── OWASP A05:2021 — Security Misconfiguration: render depth guard ──────────

describe("A05 DoS — render depth limits prevent stack overflow from deeply nested JSON", () => {
	const buildDeep = (depth: number): { type: string; children?: unknown } =>
		depth === 0 ? { type: "Text", children: "leaf" } : { type: "Text", children: buildDeep(depth - 1) }

	it("renders the leaf node at exactly MAX_DEPTH (50 levels — boundary, no throw)", () => {
		// MAX_DEPTH is 50; the check is `depth > 50`, so depth=50 is still valid.
		// buildDeep(50) produces a 51-node chain whose leaf runs at depth=50.
		const { container } = render(
			<A2Renderer
				// biome-ignore lint/suspicious/noExplicitAny: deeply nested test node
				node={buildDeep(50) as any}
				registry={registry}
				fallback={<span data-testid="depth-fallback">too deep</span>}
			/>,
		)
		expect(container.querySelector("[data-testid='depth-fallback']")).toBeNull()
		expect(container.textContent).toContain("leaf")
	})

	it("renders fallback at 51 levels deep (first level that exceeds MAX_DEPTH)", () => {
		// buildDeep(51): the innermost node runs at depth=51, triggering depth > 50
		const { container } = render(
			<A2Renderer
				// biome-ignore lint/suspicious/noExplicitAny: deeply nested test node
				node={buildDeep(51) as any}
				registry={registry}
				fallback={<span data-testid="depth-fallback">too deep</span>}
			/>,
		)
		expect(container.querySelector("[data-testid='depth-fallback']")).not.toBeNull()
	})

	it("renders fallback at 55 levels deep (exceeds MAX_DEPTH)", () => {
		const { container } = render(
			<A2Renderer
				// biome-ignore lint/suspicious/noExplicitAny: deeply nested test node
				node={buildDeep(55) as any}
				registry={registry}
				fallback={<span data-testid="depth-fallback">too deep</span>}
			/>,
		)
		expect(container.querySelector("[data-testid='depth-fallback']")).not.toBeNull()
	})

	it("renders a large sibling array (1000 items) without error", () => {
		const items = Array.from({ length: 1000 }, (_, i) => ({
			type: "Text" as const,
			children: `item-${i}`,
		}))
		const { container } = render(<A2Renderer node={{ type: "Text", children: items }} registry={registry} />)
		// All items should render (not truncated or errored)
		expect(container.textContent).toContain("item-0")
		expect(container.textContent).toContain("item-999")
	})
})

// ── OWASP A03:2021 — Injection: A2NodeSchema input validation ──────────────

describe("A03 Schema input validation — malformed node envelopes are rejected", () => {
	it("rejects a node with empty type string", () => {
		expect(safeParseNode({ type: "" }).success).toBe(false)
	})

	it("rejects a node with numeric type", () => {
		// biome-ignore lint/suspicious/noExplicitAny: intentional invalid input
		expect(safeParseNode({ type: 42 } as any).success).toBe(false)
	})

	it("rejects a node with null type", () => {
		// biome-ignore lint/suspicious/noExplicitAny: intentional invalid input
		expect(safeParseNode({ type: null } as any).success).toBe(false)
	})

	it("rejects a node with no type field", () => {
		expect(safeParseNode({ props: { label: "Email" } }).success).toBe(false)
	})

	it("rejects children that is a number (only string, node, or array is valid)", () => {
		// biome-ignore lint/suspicious/noExplicitAny: intentional invalid input
		expect(safeParseNode({ type: "Text", children: 42 } as any).success).toBe(false)
	})

	it("rejects children that is a function", () => {
		// biome-ignore lint/suspicious/noExplicitAny: intentional invalid input
		expect(safeParseNode({ type: "Text", children: () => "xss" } as any).success).toBe(false)
	})
})
