import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Restaurant Booking — a2UI Demo",
	description: "ADK agent demo using @a2ra/core components",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-[var(--color-background)] text-[var(--color-text)] min-h-screen">{children}</body>
		</html>
	)
}
