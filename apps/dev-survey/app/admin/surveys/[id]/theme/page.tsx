"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { type CSSProperties, useEffect, useState } from "react"
import { adminApi } from "@/hooks/useAdminData"

type Base = "light" | "dark"
type Font =
	| "system"
	| "inter"
	| "roboto"
	| "poppins"
	| "montserrat"
	| "dm-sans"
	| "nunito"
	| "atkinson"
	| "lexend"
	| "open-sans"
	| "source-sans"
	| "lato"
	| "lora"
	| "jetbrains-mono"
type Radius = "none" | "sm" | "md" | "lg" | "full"

interface ThemeConfig {
	accent: string
	base: Base
	font: Font
	radius: Radius
}

const FONT_FAMILIES: Record<Font, string> = {
	system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	inter: "var(--font-inter)",
	roboto: "var(--font-roboto)",
	poppins: "var(--font-poppins)",
	montserrat: "var(--font-montserrat)",
	"dm-sans": "var(--font-dm-sans)",
	nunito: "var(--font-nunito)",
	atkinson: "var(--font-atkinson)",
	lexend: "var(--font-lexend)",
	"open-sans": "var(--font-open-sans)",
	"source-sans": "var(--font-source-sans)",
	lato: "var(--font-lato)",
	lora: "var(--font-lora)",
	"jetbrains-mono": "var(--font-jetbrains-mono)",
}

const FONT_GROUPS: Array<{ group: string; fonts: Font[] }> = [
	{ group: "Platform default", fonts: ["system"] },
	{ group: "Popular", fonts: ["inter", "roboto", "poppins", "montserrat", "dm-sans", "nunito"] },
	{ group: "Accessibility-focused", fonts: ["atkinson", "lexend", "open-sans", "source-sans", "lato"] },
	{ group: "Serif", fonts: ["lora"] },
	{ group: "Monospace", fonts: ["jetbrains-mono"] },
]

const FONT_LABELS: Record<Font, string> = {
	system: "System (OS default)",
	inter: "Inter",
	roboto: "Roboto",
	poppins: "Poppins",
	montserrat: "Montserrat",
	"dm-sans": "DM Sans",
	nunito: "Nunito",
	atkinson: "Atkinson Hyperlegible",
	lexend: "Lexend",
	"open-sans": "Open Sans",
	"source-sans": "Source Sans 3",
	lato: "Lato",
	lora: "Lora",
	"jetbrains-mono": "JetBrains Mono",
}

const FONT_DESCRIPTIONS: Record<Font, string> = {
	system:
		"Uses the operating system's native font: SF Pro on Apple devices, Roboto on Android, Segoe UI on Windows. Feels native on every platform.",
	inter: "Optimised for screens. High x-height and wide spacing make it highly legible at small sizes.",
	roboto: "Google's flagship font. Geometric with open curves — the most widely deployed font on the web.",
	poppins: "Circular geometric sans. Modern and clean, popular for contemporary product and form UI.",
	montserrat: "Urban geometry inspired by old Buenos Aires signage. Strong presence, suits structured surveys.",
	"dm-sans": "Low-contrast geometric sans designed for small sizes. Neutral and clean with good legibility.",
	nunito: "Balanced rounded terminals give it a friendly, approachable character. Welcoming for survey respondents.",
	atkinson:
		"Designed by the Braille Institute for low-vision readers. Each character is distinctly shaped to minimise confusion.",
	lexend: "Research-backed to reduce visual stress and improve reading speed for a wide range of readers.",
	"open-sans":
		"Humanist letterforms with generous spacing. One of the most widely tested fonts for on-screen readability.",
	"source-sans": "Adobe's open-source workhorse. Clean and neutral with excellent legibility across weights.",
	lato: "Warm humanist sans-serif. Semi-rounded details give it a friendly, approachable feel.",
	lora: "Contemporary serif with calligraphic roots. Designed for comfortable on-screen body reading — not a display font.",
	"jetbrains-mono": "Equal-width characters with ligatures. Ideal for technical or developer-focused surveys.",
}

const RADII: Record<Radius, string> = {
	none: "0px",
	sm: "4px",
	md: "8px",
	lg: "12px",
	full: "9999px",
}

const RADIUS_LABELS: Record<Radius, string> = {
	none: "None",
	sm: "Subtle",
	md: "Default",
	lg: "Rounded",
	full: "Pill",
}

const PRESETS: Array<{ name: string } & ThemeConfig> = [
	{ name: "Default", accent: "#2563eb", base: "light", font: "inter", radius: "md" },
	{ name: "Accessible", accent: "#0369a1", base: "light", font: "atkinson", radius: "md" },
	{ name: "Ocean", accent: "#0891b2", base: "light", font: "lexend", radius: "lg" },
	{ name: "Forest", accent: "#16a34a", base: "light", font: "open-sans", radius: "md" },
	{ name: "Sunset", accent: "#ea580c", base: "light", font: "lato", radius: "sm" },
	{ name: "Rose", accent: "#e11d48", base: "light", font: "lora", radius: "full" },
	{ name: "Midnight", accent: "#818cf8", base: "dark", font: "source-sans", radius: "md" },
	{ name: "Terminal", accent: "#22c55e", base: "dark", font: "jetbrains-mono", radius: "none" },
]

const DEFAULT_CONFIG: ThemeConfig = { accent: "#2563eb", base: "light", font: "inter", radius: "md" }

function hexLuminance(hex: string): number {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0
	const r = parseInt(hex.slice(1, 3), 16) / 255
	const g = parseInt(hex.slice(3, 5), 16) / 255
	const b = parseInt(hex.slice(5, 7), 16) / 255
	const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function deriveTokens(cfg: ThemeConfig): Record<string, string> {
	const light = cfg.base === "light"
	const accentFg = hexLuminance(cfg.accent) > 0.179 ? "#000000" : "#ffffff"
	const radiusPx = Math.min(parseFloat(RADII[cfg.radius]), 16)
	return {
		"--color-primary": cfg.accent,
		"--color-primaryForeground": accentFg,
		"--color-background": light ? "#ffffff" : "#0f172a",
		"--color-surface": light ? "#f8fafc" : "#1e293b",
		"--color-text": light ? "#0f172a" : "#f8fafc",
		"--color-textMuted": light ? "#64748b" : "#94a3b8",
		"--color-border": light ? "#e2e8f0" : "#334155",
		"--color-backgroundMuted": light ? "#f1f5f9" : "#1e293b",
		"--font-family": FONT_FAMILIES[cfg.font],
		"--radius": RADII[cfg.radius],
		"--radius-card": `${radiusPx}px`,
		_accent: cfg.accent,
		_base: cfg.base,
		_font: cfg.font,
		_radius: cfg.radius,
	}
}

function configFromTheme(theme: Record<string, string>): ThemeConfig {
	const validBases: Base[] = ["light", "dark"]
	return {
		accent: theme._accent || theme["--color-primary"] || DEFAULT_CONFIG.accent,
		base: validBases.includes(theme._base as Base) ? (theme._base as Base) : DEFAULT_CONFIG.base,
		font: theme._font in FONT_FAMILIES ? (theme._font as Font) : DEFAULT_CONFIG.font,
		radius: theme._radius in RADII ? (theme._radius as Radius) : DEFAULT_CONFIG.radius,
	}
}

export default function ThemePage() {
	const { id } = useParams<{ id: string }>()
	const [surveyTitle, setSurveyTitle] = useState("")
	const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)
	const [saveSuccess, setSaveSuccess] = useState(false)
	const [previewStep, setPreviewStep] = useState(0)
	const PREVIEW_STEPS = 3

	useEffect(() => {
		adminApi
			.getSurvey(id)
			.then((s) => {
				setSurveyTitle(s.title)
				if (s.theme && Object.keys(s.theme).length > 0) {
					setConfig(configFromTheme(s.theme))
				}
			})
			.finally(() => setLoading(false))
	}, [id])

	async function save() {
		setSaving(true)
		setSaveError(null)
		setSaveSuccess(false)
		try {
			await adminApi.updateSurvey(id, { theme: deriveTokens(config) })
			setSaveSuccess(true)
		} catch (e: unknown) {
			setSaveError(e instanceof Error ? e.message : "Failed to save theme")
		} finally {
			setSaving(false)
		}
	}

	function reset() {
		setConfig(DEFAULT_CONFIG)
		setSaveSuccess(false)
		setSaveError(null)
	}

	const activePreset = PRESETS.find(
		(p) => p.accent === config.accent && p.base === config.base && p.font === config.font && p.radius === config.radius,
	)?.name

	if (loading) return <p className="text-(--color-textMuted) text-sm">Loading…</p>

	const previewVars = Object.fromEntries(
		Object.entries(deriveTokens(config)).filter(([k]) => k.startsWith("--")),
	) as CSSProperties

	return (
		<div>
			<div className="mb-1 flex items-center gap-2 text-(--color-textMuted) text-sm">
				<Link href="/admin" className="hover:text-(--color-text)">
					Surveys
				</Link>
				<span>/</span>
				<Link href={`/admin/surveys/${id}`} className="hover:text-(--color-text)">
					{surveyTitle}
				</Link>
				<span>/</span>
				<span className="text-(--color-text)">Theme</span>
			</div>

			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-(--color-text) text-2xl">Theme</h1>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={reset}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Reset
					</button>
					<button
						type="button"
						onClick={save}
						disabled={saving}
						className="rounded-md bg-(--color-primary) px-3 py-1.5 font-medium text-(--color-primaryForeground) text-sm disabled:opacity-50"
					>
						{saving ? "Saving…" : "Save Theme"}
					</button>
					<Link
						href={`/admin/surveys/${id}`}
						className="rounded-md border border-(--color-border) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)"
					>
						Back to editor
					</Link>
				</div>
			</div>

			{saveSuccess && (
				<div className="mb-4 rounded-md border border-(--color-border) bg-(--color-backgroundMuted) px-4 py-2 text-(--color-text) text-sm">
					Theme saved.
				</div>
			)}
			{saveError && (
				<div className="mb-4 rounded-md border border-(--color-danger) bg-(--color-backgroundMuted) px-4 py-2 text-(--color-danger) text-sm">
					{saveError}
				</div>
			)}

			{/* Presets */}
			<div className="mb-6">
				<p className="mb-3 text-(--color-textMuted) text-sm">Presets</p>
				<div className="flex flex-wrap gap-2">
					{PRESETS.map((preset) => (
						<button
							key={preset.name}
							type="button"
							onClick={() => {
								setConfig((c) => ({ ...c, accent: preset.accent, font: preset.font, radius: preset.radius }))
								setSaveSuccess(false)
							}}
							className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
								activePreset === preset.name
									? "border-(--color-primary) bg-(--color-backgroundMuted) font-medium text-(--color-text)"
									: "border-(--color-border) text-(--color-text) hover:bg-(--color-backgroundMuted)"
							}`}
						>
							<span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: preset.accent }} />
							{preset.name}
						</button>
					))}
				</div>
			</div>

			{/* Controls + preview */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_3fr]">
				{/* Left: controls */}
				<div className="space-y-6 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
					{/* Brand color */}
					<div>
						<p className="mb-2 block font-medium text-(--color-text) text-sm">Brand color</p>
						<div className="flex items-center gap-3">
							<input
								type="color"
								aria-label="Brand colour picker"
								value={/^#[0-9a-fA-F]{6}$/.test(config.accent) ? config.accent : "#000000"}
								onChange={(e) => {
									setConfig((c) => ({ ...c, accent: e.target.value }))
									setSaveSuccess(false)
								}}
								className="h-9 w-9 shrink-0 cursor-pointer rounded border border-(--color-border) p-0.5"
							/>
							<input
								type="text"
								value={config.accent}
								onChange={(e) => {
									setConfig((c) => ({ ...c, accent: e.target.value }))
									setSaveSuccess(false)
								}}
								className="w-28 rounded-md border border-(--color-border) bg-(--color-background) px-3 py-1.5 font-mono text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
							/>
						</div>
					</div>

					{/* Appearance toggle */}
					<div>
						<p className="mb-2 block font-medium text-(--color-text) text-sm">Appearance</p>
						<button
							type="button"
							role="switch"
							aria-checked={config.base === "dark"}
							onClick={() => {
								setConfig((c) => ({ ...c, base: c.base === "light" ? "dark" : "light" }))
								setSaveSuccess(false)
							}}
							className="flex w-full items-center justify-between rounded-md border border-(--color-border) px-3 py-2 text-sm hover:bg-(--color-backgroundMuted)"
						>
							<span className="text-(--color-text)">{config.base === "light" ? "Light" : "Dark"}</span>
							<span
								className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
									config.base === "dark" ? "bg-(--color-primary)" : "bg-(--color-border)"
								}`}
							>
								<span
									className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
										config.base === "dark" ? "translate-x-4" : "translate-x-1"
									}`}
								/>
							</span>
						</button>
					</div>

					{/* Font */}
					<div>
						<label htmlFor="theme-font" className="mb-2 block font-medium text-(--color-text) text-sm">
							Font
						</label>
						<select
							id="theme-font"
							value={config.font}
							onChange={(e) => {
								setConfig((c) => ({ ...c, font: e.target.value as Font }))
								setSaveSuccess(false)
							}}
							style={{ fontFamily: FONT_FAMILIES[config.font] }}
							className="w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
						>
							{FONT_GROUPS.map(({ group, fonts }) => (
								<optgroup key={group} label={group}>
									{fonts.map((font) => (
										<option key={font} value={font}>
											{FONT_LABELS[font]}
										</option>
									))}
								</optgroup>
							))}
						</select>
						{config.font === "system" ? (
							<p className="mt-1.5 rounded-md border border-(--color-border) bg-(--color-backgroundMuted) px-3 py-2 text-(--color-textMuted) text-xs leading-relaxed">
								Uses the OS native font: SF Pro on Apple, Roboto on Android, Segoe UI on Windows. The preview reflects
								your browser — respondents will see their platform default.
							</p>
						) : (
							<p className="mt-1.5 text-(--color-textMuted) text-xs leading-relaxed">
								{FONT_DESCRIPTIONS[config.font]}
							</p>
						)}
					</div>

					{/* Corners */}
					<div>
						<p className="mb-2 block font-medium text-(--color-text) text-sm">Corners</p>
						<div className="flex flex-col divide-y divide-(--color-border) overflow-hidden rounded-md border border-(--color-border)">
							{(Object.entries(RADIUS_LABELS) as [Radius, string][]).map(([key, label]) => {
								const svgRadius: Record<Radius, string> = {
									none: "0",
									sm: "2",
									md: "5",
									lg: "9",
									full: "18",
								}
								const active = config.radius === key
								return (
									<button
										key={key}
										type="button"
										onClick={() => {
											setConfig((c) => ({ ...c, radius: key }))
											setSaveSuccess(false)
										}}
										className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
											active
												? "bg-(--color-backgroundMuted) font-medium text-(--color-text)"
												: "text-(--color-text) hover:bg-(--color-backgroundMuted)"
										}`}
									>
										<svg width="18" height="18" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0">
											<rect
												x="2"
												y="2"
												width="32"
												height="32"
												rx={svgRadius[key]}
												fill="currentColor"
												opacity={active ? 0.25 : 0.12}
												stroke="currentColor"
												strokeWidth="3"
											/>
										</svg>
										<span className="flex-1 text-left">{label}</span>
										{active && (
											<svg
												width="14"
												height="14"
												viewBox="0 0 14 14"
												aria-hidden="true"
												className="shrink-0 text-(--color-primary)"
											>
												<path
													d="M2 7l3.5 3.5L12 3"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													fill="none"
												/>
											</svg>
										)}
									</button>
								)
							})}
						</div>
					</div>
				</div>

				{/* Right: live preview */}
				<div
					style={{ ...previewVars, fontFamily: "var(--font-family, inherit)" }}
					className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-background)"
				>
					<div className="border-b border-(--color-border) px-4 py-2">
						<span className="text-(--color-textMuted) text-xs">Preview</span>
					</div>
					<div className="flex flex-col gap-4 p-4">
						{/* Progress bar */}
						<div className="flex items-center gap-3">
							<div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-backgroundMuted)">
								<div
									className="h-full rounded-full bg-(--color-primary) transition-all duration-300"
									style={{ width: `${((previewStep + 1) / PREVIEW_STEPS) * 100}%` }}
								/>
							</div>
							<span className="shrink-0 text-(--color-textMuted) text-xs">
								{previewStep + 1} / {PREVIEW_STEPS}
							</span>
						</div>

						{/* Step 0: radio question */}
						{previewStep === 0 && (
							<div
								style={{ borderRadius: "var(--radius-card)" }}
								className="border border-(--color-border) bg-(--color-surface) p-4"
							>
								<p className="mb-1 font-semibold text-(--color-text)">What is your primary role?</p>
								<p className="mb-4 text-(--color-textMuted) text-sm">Select the option that best describes you.</p>
								<div className="flex flex-col gap-2">
									{["Frontend developer", "Backend developer", "Full-stack developer"].map((opt, i) => (
										<div
											key={opt}
											style={{ borderRadius: "var(--radius)" }}
											className={`flex items-center gap-3 border px-3 py-2 text-sm ${
												i === 0
													? "border-(--color-primary) bg-(--color-backgroundMuted) font-medium text-(--color-text)"
													: "border-(--color-border) text-(--color-text)"
											}`}
										>
											<div
												className={`h-4 w-4 shrink-0 rounded-full border-2 ${
													i === 0 ? "border-(--color-primary)" : "border-(--color-border)"
												}`}
											>
												{i === 0 && <div className="m-0.5 h-2 w-2 rounded-full bg-(--color-primary)" />}
											</div>
											{opt}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Step 1: open text question */}
						{previewStep === 1 && (
							<div
								style={{ borderRadius: "var(--radius-card)" }}
								className="border border-(--color-border) bg-(--color-surface) p-4"
							>
								<p className="mb-1 font-semibold text-(--color-text)">How would you describe your experience?</p>
								<p className="mb-4 text-(--color-textMuted) text-sm">Tell us in your own words.</p>
								<textarea
									readOnly
									placeholder="Your answer…"
									rows={4}
									style={{ borderRadius: "var(--radius)" }}
									className="w-full resize-none border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-text) text-sm placeholder:text-(--color-textMuted) focus:outline-none"
								/>
							</div>
						)}

						{/* Step 2: checkbox question */}
						{previewStep === 2 && (
							<div
								style={{ borderRadius: "var(--radius-card)" }}
								className="border border-(--color-border) bg-(--color-surface) p-4"
							>
								<p className="mb-1 font-semibold text-(--color-text)">Which tools do you use regularly?</p>
								<p className="mb-4 text-(--color-textMuted) text-sm">Select all that apply.</p>
								<div className="flex flex-col gap-2">
									{["TypeScript", "React", "Node.js", "Docker"].map((opt, i) => {
										const checked = i < 2
										return (
											<div
												key={opt}
												style={{ borderRadius: "var(--radius)" }}
												className={`flex items-center gap-3 border px-3 py-2 text-sm ${
													checked
														? "border-(--color-primary) bg-(--color-backgroundMuted) font-medium text-(--color-text)"
														: "border-(--color-border) text-(--color-text)"
												}`}
											>
												<div
													style={{ borderRadius: "calc(var(--radius) * 0.5)" }}
													className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 ${
														checked ? "border-(--color-primary) bg-(--color-primary)" : "border-(--color-border)"
													}`}
												>
													{checked && (
														<svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
															<path
																d="M1.5 4.5l2 2 4-4"
																stroke="white"
																strokeWidth="1.5"
																strokeLinecap="round"
																strokeLinejoin="round"
																fill="none"
															/>
														</svg>
													)}
												</div>
												{opt}
											</div>
										)
									})}
								</div>
							</div>
						)}

						{/* Navigation */}
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPreviewStep((s) => Math.max(s - 1, 0))}
								disabled={previewStep === 0}
								style={{ borderRadius: "var(--radius)" }}
								className="border border-(--color-border) px-4 py-2 text-(--color-text) text-sm disabled:opacity-40"
							>
								← Back
							</button>
							<button
								type="button"
								onClick={() => setPreviewStep((s) => Math.min(s + 1, PREVIEW_STEPS - 1))}
								disabled={previewStep === PREVIEW_STEPS - 1}
								style={{ borderRadius: "var(--radius)" }}
								className="flex-1 bg-(--color-primary) px-4 py-2 font-medium text-(--color-primaryForeground) text-sm disabled:opacity-40"
							>
								{previewStep === PREVIEW_STEPS - 1 ? "Submit" : "Next →"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
