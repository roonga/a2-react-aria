import type { Message } from "../hooks/useChat"

const FEEDBACK_DEMO_MESSAGES: Message[] = [
	{ role: "user", content: "Leave feedback" },
	{
		role: "assistant",
		content: "Thanks for dining with us! We'd love to hear how it went.",
		a2uiJson: [
			{
				type: "FeedbackSurvey",
				props: { title: "How was your experience?", description: "Rate your restaurant visit" },
			},
		],
	},
]

interface FeedbackDemoButtonProps {
	onAdd: (msgs: Message[]) => void
}

export function FeedbackDemoButton({ onAdd }: FeedbackDemoButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onAdd(FEEDBACK_DEMO_MESSAGES)}
			className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
		>
			⭐ Leave feedback
		</button>
	)
}
