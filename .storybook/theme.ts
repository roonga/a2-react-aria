export const themes = {
	light: {
		colors: {
			primary: "#2563eb",
			primaryHover: "#1d4ed8",
			primaryActive: "#1e40af",
			secondary: "#64748b",
			secondaryHover: "#475569",
			secondaryActive: "#334155",
			danger: "#dc2626",
			dangerHover: "#b91c1c",
			dangerActive: "#991b1b",
			ghost: "transparent",
			ghostHover: "#f1f5f9",
			ghostActive: "#e2e8f0",
			text: "#1f2937",
			textMuted: "#6b7280",
			border: "#e5e7eb",
			background: "#ffffff",
			backgroundMuted: "#f9fafb",
		},
	},
	dark: {
		colors: {
			primary: "#3b82f6",
			primaryHover: "#2563eb",
			primaryActive: "#1d4ed8",
			secondary: "#94a3b8",
			secondaryHover: "#cbd5e1",
			secondaryActive: "#e2e8f0",
			danger: "#ef4444",
			dangerHover: "#dc2626",
			dangerActive: "#b91c1c",
			ghost: "transparent",
			ghostHover: "#1f2937",
			ghostActive: "#374151",
			text: "#f3f4f6",
			textMuted: "#9ca3af",
			border: "#374151",
			background: "#111827",
			backgroundMuted: "#1f2937",
		},
	},
}

export type Theme = keyof typeof themes
export type ThemeColors = (typeof themes)["light"]["colors"]
