export const getFeedbackSurveyStyles = () => ({
	container: "flex flex-col gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]",
	title: "text-base font-semibold text-[var(--color-text)]",
	description: "text-sm text-[var(--color-textMuted)] -mt-2",
	starsRow: "flex gap-0.5 border-0 m-0 p-0",
	starButton: (active: boolean) =>
		[
			"p-0.5 rounded transition-all",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1",
			active
				? "text-[var(--color-star)] scale-110"
				: "text-[var(--color-textMuted)] hover:text-[var(--color-star)] hover:scale-110",
		].join(" "),
	textarea: [
		"w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]",
		"text-sm text-[var(--color-text)] placeholder:text-[var(--color-textMuted)]",
		"px-3 py-2 resize-none",
		"focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]",
	].join(" "),
	submit: (enabled: boolean) =>
		enabled
			? [
					"inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
					"text-[var(--color-primaryForeground)] bg-[var(--color-primary)] hover:bg-[var(--color-primaryHover)]",
					"active:bg-[var(--color-primaryActive)] transition-colors cursor-pointer",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
				].join(" ")
			: [
					"inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
					"text-[var(--color-textMuted)] bg-[var(--color-backgroundMuted)]",
					"cursor-not-allowed opacity-60",
				].join(" "),
	thanksWrap: "flex flex-col items-center gap-2 py-4 text-center",
	thanksText: "text-base font-semibold text-[var(--color-text)]",
	thanksSub: "text-sm text-[var(--color-textMuted)]",
})
