import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Restaurant Booking — a2UI Demo",
	description: "ADK agent demo using @a2ui/core components",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">{children}</body>
		</html>
	)
}
