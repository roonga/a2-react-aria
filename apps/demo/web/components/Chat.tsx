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
			const Fallback = () => <p className="text-(--color-danger) text-xs">A2UI load error: {String(err)}</p>
			Fallback.displayName = "A2UIBlockFallback"
			return { default: Fallback }
		}),
	{
		ssr: false,
		loading: () => <p className="mt-1 text-(--color-textMuted) text-xs">Loading components…</p>,
	},
)

function bubbleClass(role: string, content: string): string {
	if (role === "user") return "bg-(--color-primary) text-white"
	if (content.startsWith("Error:"))
		return "border border-(--color-danger) bg-(--color-backgroundMuted) text-(--color-danger) shadow-sm"
	return "bg-(--color-surface) text-(--color-text) shadow-md"
}

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
		<div className="overflow-hidden rounded-lg bg-(--color-surface) shadow-2xl">
			<div ref={messagesContainerRef} className="h-150 space-y-4 overflow-y-auto bg-(--color-backgroundMuted) p-6">
				{messages.map((msg) => (
					<div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
						<div className={`max-w-[85%] rounded-lg px-4 py-3 ${bubbleClass(msg.role, msg.content)}`}>
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
								<div className="flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-backgroundMuted) px-3 py-2 text-(--color-textMuted) text-xs">
									<span className="flex gap-0.5">
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--color-textMuted) [animation-delay:0ms]" />
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--color-textMuted) [animation-delay:150ms]" />
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--color-textMuted) [animation-delay:300ms]" />
									</span>
									<span className="font-medium">Thinking…</span>
								</div>
							)}
							{visibleStreamingText.trim() && (
								<div className="rounded-lg bg-(--color-surface) px-4 py-3 text-(--color-text) shadow-md">
									<p className="whitespace-pre-wrap">
										{visibleStreamingText}
										<span className="ml-1 inline-block h-5 w-2 animate-pulse bg-(--color-text)" />
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="border-(--color-border) border-t bg-(--color-surface) p-4">
				<div className="mb-3 flex flex-wrap gap-2">
					<FeedbackDemoButton onAdd={appendMessages} />
					<button
						type="button"
						onClick={() => void sendMessage("Book a table for 2 in Sydney tonight, Indian cuisine")}
						disabled={isLoading}
						className="rounded-full border border-(--color-border) px-3 py-1.5 text-(--color-textMuted) text-xs transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40"
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
						className="flex-1 rounded-lg border border-(--color-border) px-4 py-3 text-(--color-text) placeholder:text-(--color-textMuted) focus:border-transparent focus:outline-none focus:ring-(--color-primary) focus:ring-2 disabled:cursor-not-allowed disabled:bg-(--color-backgroundMuted)"
					/>
					<button
						type="button"
						onClick={() => void sendMessage()}
						disabled={isLoading || !input.trim()}
						className="rounded-lg bg-(--color-primary) px-6 py-3 font-medium text-white transition-colors hover:bg-(--color-primaryHover) focus:outline-none focus:ring-(--color-primary) focus:ring-2 disabled:cursor-not-allowed disabled:bg-(--color-backgroundMuted) disabled:text-(--color-textMuted)"
					>
						{isLoading ? "Sending…" : "Send"}
					</button>
				</div>
			</div>
		</div>
	)
}
