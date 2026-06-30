import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Developer Survey — a2UI Demo",
	description: "Dynamic developer survey powered by @a2ra/core",
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-(--color-background) text-(--color-text)">{children}</body>
		</html>
	)
}
