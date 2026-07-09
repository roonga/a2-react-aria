import type { Message } from "../hooks/useChat"

const FEEDBACK_DEMO_MESSAGES: Message[] = [
	{ id: "feedback-user", role: "user", content: "Leave feedback" },
	{
		id: "feedback-assistant",
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
	readonly onAdd: (msgs: Message[]) => void
}

export function FeedbackDemoButton({ onAdd }: FeedbackDemoButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onAdd(FEEDBACK_DEMO_MESSAGES)}
			className="rounded-full border border-(--color-border) px-3 py-1.5 text-(--color-text-muted) text-xs transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
		>
			⭐ Leave feedback
		</button>
	)
}
