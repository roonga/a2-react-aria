export const getFeedbackSurveyStyles = () => ({
	container: "flex flex-col gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface)",
	title: "text-base font-semibold text-(--color-text)",
	description: "text-sm text-(--color-text-muted) -mt-2",
	starsRow: "flex gap-0.5 border-0 m-0 p-0",
	starButton: (active: boolean) =>
		[
			"p-0.5 rounded transition-all",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-1",
			active ? "text-(--color-star) scale-110" : "text-(--color-text-muted) hover:text-(--color-star) hover:scale-110",
		].join(" "),
	textarea: [
		"w-full rounded-lg border border-(--color-border) bg-(--color-background)",
		"text-sm text-(--color-text) placeholder:text-(--color-text-muted)",
		"px-3 py-2 resize-none",
		"focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary)",
	].join(" "),
	submit: (enabled: boolean) =>
		enabled
			? [
					"inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
					"text-(--color-primary-foreground) bg-(--color-primary) hover:bg-(--color-primary-hover)",
					"active:bg-(--color-primary-active) transition-colors cursor-pointer",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)",
				].join(" ")
			: [
					"inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
					"text-(--color-text-muted) bg-(--color-background-muted)",
					"cursor-not-allowed opacity-60",
				].join(" "),
	thanksWrap: "flex flex-col items-center gap-2 py-4 text-center",
	thanksText: "text-base font-semibold text-(--color-text)",
	thanksSub: "text-sm text-(--color-text-muted)",
})
