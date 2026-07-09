"use client"

import { useEffect, useState } from "react"

export default function AppearanceToggle() {
	const [dark, setDark] = useState(false)

	useEffect(() => {
		const stored = localStorage.getItem("admin-appearance")
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
		const isDark = stored ? stored === "dark" : prefersDark
		setDark(isDark)
		document.documentElement.classList.toggle("dark", isDark)
	}, [])

	function toggle() {
		const next = !dark
		setDark(next)
		document.documentElement.classList.toggle("dark", next)
		localStorage.setItem("admin-appearance", next ? "dark" : "light")
	}

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
			className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-(--color-background-muted) hover:text-(--color-text)"
		>
			{dark ? (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
				</svg>
			) : (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			)}
		</button>
	)
}
