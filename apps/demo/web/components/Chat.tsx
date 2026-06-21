"use client"

import { stripStreamingA2ui } from "@a2ra/core"
import dynamic from "next/dynamic"
import { useChat } from "../hooks/useChat"
import { FeedbackDemoButton } from "./FeedbackDemoButton"
import { ThinkingBlock } from "./ThinkingBlock"

const A2UIBlock = dynamic(
	() =>
		import("./A2UIBlock").catch((err: unknown) => {
			console.error("[Chat] A2UIBlock import failed:", err)
			const Fallback = () => <p className="text-xs text-[var(--color-danger)]">A2UI load error: {String(err)}</p>
			Fallback.displayName = "A2UIBlockFallback"
			return { default: Fallback }
		}),
	{
		ssr: false,
		loading: () => <p className="text-xs text-[var(--color-textMuted)] mt-1">Loading components…</p>,
	},
)

export default function Chat() {
	const {
		messages,
		input,
		setInput,
		isLoading,
		streamingText,
		streamingThought,
		messagesContainerRef,
		handleAction,
		appendMessages,
		sendMessage,
		handleKeyDown,
	} = useChat()

	const visibleStreamingText = stripStreamingA2ui(streamingText)

	return (
		<div className="bg-[var(--color-surface)] rounded-lg shadow-2xl overflow-hidden">
			<div
				ref={messagesContainerRef}
				className="h-[600px] overflow-y-auto p-6 space-y-4 bg-[var(--color-backgroundMuted)]"
			>
				{messages.map((msg, idx) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: chat messages have no stable IDs
					<div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`max-w-[85%] rounded-lg px-4 py-3 ${
								msg.role === "user"
									? "bg-[var(--color-primary)] text-white"
									: msg.content.startsWith("Error:")
										? "bg-[var(--color-backgroundMuted)] text-[var(--color-danger)] border border-[var(--color-danger)] shadow-sm"
										: "bg-[var(--color-surface)] text-[var(--color-text)] shadow-md"
							}`}
						>
							{msg.thought && <ThinkingBlock text={msg.thought} />}
							{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
							{msg.a2uiJson && <A2UIBlock nodes={msg.a2uiJson} onAction={handleAction} />}
						</div>
					</div>
				))}

				{(streamingThought || visibleStreamingText.trim()) && (
					<div className="flex justify-start">
						<div className="max-w-[85%] space-y-1">
							{streamingThought && (
								<div className="rounded-md border border-[var(--color-border)] bg-[var(--color-backgroundMuted)] px-3 py-2 text-xs text-[var(--color-textMuted)] flex items-center gap-2">
									<span className="flex gap-0.5">
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-textMuted)] animate-bounce [animation-delay:0ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-textMuted)] animate-bounce [animation-delay:150ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-textMuted)] animate-bounce [animation-delay:300ms]" />
									</span>
									<span className="font-medium">Thinking…</span>
								</div>
							)}
							{visibleStreamingText.trim() && (
								<div className="rounded-lg px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text)] shadow-md">
									<p className="whitespace-pre-wrap">
										{visibleStreamingText}
										<span className="inline-block w-2 h-5 bg-[var(--color-text)] ml-1 animate-pulse" />
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
				<div className="flex gap-2 mb-3 flex-wrap">
					<FeedbackDemoButton onAdd={appendMessages} />
					<button
						type="button"
						onClick={() => void sendMessage("Book a table for 2 in Sydney tonight, Indian cuisine")}
						disabled={isLoading}
						className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						🍽 Indian in Sydney tonight
					</button>
				</div>
				<div className="flex gap-2">
					<input
						type="text"
						name="chat-message"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Or type a message…"
						disabled={isLoading}
						className="flex-1 px-4 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-textMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:bg-[var(--color-backgroundMuted)] disabled:cursor-not-allowed"
					/>
					<button
						type="button"
						onClick={() => void sendMessage()}
						disabled={isLoading || !input.trim()}
						className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primaryHover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-backgroundMuted)] disabled:text-[var(--color-textMuted)] disabled:cursor-not-allowed transition-colors"
					>
						{isLoading ? "Sending…" : "Send"}
					</button>
				</div>
			</div>
		</div>
	)
}
