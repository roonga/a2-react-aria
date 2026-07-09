import Link from "next/link"
import type { ReactNode } from "react"
import AppearanceToggle from "./AppearanceToggle"

export default function AdminLayout({ children }: { readonly children: ReactNode }) {
	return (
		<div className="min-h-screen bg-(--color-background)">
			<header className="border-(--color-border) border-b bg-(--color-surface)">
				<div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
					<Link href="/admin" className="font-semibold text-(--color-text) text-sm hover:text-(--color-primary)">
						Survey Manager
					</Link>
					<span className="text-(--color-border)">|</span>
					<Link href="/" className="text-(--color-text-muted) text-sm hover:text-(--color-text)">
						View Survey
					</Link>
					<div className="ml-auto">
						<AppearanceToggle />
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
		</div>
	)
}
