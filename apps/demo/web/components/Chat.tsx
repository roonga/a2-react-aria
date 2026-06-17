"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"

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

interface Message {
	role: "user" | "assistant"
	content: string
	thought?: string
	a2uiJson?: unknown[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9080"
const APP_NAME = "restaurant_agent"
const USER_ID = "user_1"

const A2UI_RE = /<a2ui-json>([\s\S]*?)<\/a2ui-json>/

const genReqId = () => Math.random().toString(36).slice(2, 10)

const INITIAL_MESSAGE: Message = {
	role: "assistant",
	content: "Hi! I can help you find and book a restaurant in Australia. What are you looking for?",
}

function extractA2ui(text: string): { plainText: string; a2uiJson: unknown[] | null } {
	const match = A2UI_RE.exec(text)
	if (!match) return { plainText: text.trim(), a2uiJson: null }
	try {
		const json = JSON.parse(match[1]) as unknown[]
		const before = text.slice(0, match.index).trim()
		const after = text.slice(match.index + match[0].length).trim()
		return { plainText: [before, after].filter(Boolean).join("\n").trim(), a2uiJson: json }
	} catch {
		return { plainText: text.trim(), a2uiJson: null }
	}
}

function ThinkingBlock({ text }: { text: string }) {
	const [open, setOpen] = useState(false)
	return (
		<details
			open={open}
			onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
			className="mb-2 rounded-md border border-[var(--color-border)] bg-[var(--color-backgroundMuted)] text-xs"
		>
			<summary className="cursor-pointer select-none px-3 py-1.5 font-medium text-[var(--color-textMuted)] list-none flex items-center gap-1.5">
				<span>{open ? "▾" : "▸"}</span>
				Thinking
			</summary>
			<p className="px-3 pb-2 pt-1 whitespace-pre-wrap text-[var(--color-text)] italic leading-relaxed">
				{text.trim()}
			</p>
		</details>
	)
}

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
	const [input, setInput] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [streamingText, setStreamingText] = useState("")
	const [streamingThought, setStreamingThought] = useState("")
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const sessionId = useRef<string | null>(null)
	const sessionPromise = useRef<Promise<string> | null>(null)
	const isLoadingRef = useRef(false)

	useEffect(() => {
		const rid = genReqId()
		sessionPromise.current = fetch(`${API_BASE}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Request-ID": rid },
			body: "{}",
		})
			.then((r) => r.json())
			.then((data: { id: string }) => {
				sessionId.current = data.id
				console.info(`[Chat] [req:${rid}] session created: ${data.id}`)
				return data.id
			})
			.catch((err) => {
				console.error(`[Chat] [req:${rid}] session create failed:`, err)
				throw err
			})
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scrolls on any chat state change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
	}, [messages, streamingText, streamingThought])

	const sendMessage = async (overrideText?: string) => {
		const userMessage = (overrideText ?? input).trim()
		if (!userMessage || isLoadingRef.current) return

		// Wait for session if not yet ready
		if (!sessionId.current && sessionPromise.current) {
			try {
				await sessionPromise.current
			} catch {
				return
			}
		}
		if (!sessionId.current) return

		isLoadingRef.current = true
		const rid = genReqId()
		setMessages((prev) => [...prev, { role: "user", content: userMessage }])
		setInput("")
		setIsLoading(true)
		setStreamingText("")
		setStreamingThought("")

		try {
			const response = await fetch(`${API_BASE}/run_sse`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-Request-ID": rid },
				body: JSON.stringify({
					app_name: APP_NAME,
					user_id: USER_ID,
					session_id: sessionId.current,
					new_message: { role: "user", parts: [{ text: userMessage }] },
					streaming: true,
				}),
			})

			if (!response.ok) throw new Error(`HTTP ${response.status}`)

			const reader = response.body?.getReader()
			if (!reader) throw new Error("No response body")

			const decoder = new TextDecoder()
			let accumulated = ""
			let accumulatedThought = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				const chunk = decoder.decode(value, { stream: true })
				const lines = chunk.split("\n")

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue
					try {
						const event = JSON.parse(line.slice(6)) as {
							content?: { parts?: Array<{ text?: string; thought?: boolean }> }
							partial?: boolean
							turnComplete?: boolean
							errorMessage?: string
						}

						if (event.content?.parts) {
							if (event.partial === false) {
								let turnText = ""
								let finalThought = ""
								for (const part of event.content.parts) {
									if (!part.text) continue
									if (part.thought) {
										finalThought += part.text
									} else {
										turnText += part.text
									}
								}
								if (turnText !== "") {
									accumulated = turnText
									setStreamingText(accumulated)
								}
								// Replace (not append) — the partial=false event carries the complete
								// thought text, which duplicates the partial=true streaming chunks.
								if (finalThought !== "") {
									accumulatedThought = finalThought
								}
								setStreamingThought(accumulatedThought)
							} else {
								for (const part of event.content.parts) {
									if (!part.text) continue
									if (part.thought) {
										accumulatedThought += part.text
										setStreamingThought(accumulatedThought)
									} else {
										accumulated += part.text
										setStreamingText(accumulated)
									}
								}
							}
						}

						if (event.turnComplete) {
							const { plainText, a2uiJson } = extractA2ui(accumulated)
							const thought = accumulatedThought.trim() || undefined
							accumulated = ""
							accumulatedThought = ""
							setMessages((prev) => [
								...prev,
								{ role: "assistant", content: plainText, thought, a2uiJson: a2uiJson ?? undefined },
							])
							setStreamingText("")
							setStreamingThought("")
						}

						if (event.errorMessage) {
							setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${event.errorMessage}` }])
							setStreamingText("")
							setStreamingThought("")
							accumulated = ""
							accumulatedThought = ""
						}
					} catch {
						// ignore unparseable SSE lines
					}
				}
			}

			if (accumulated) {
				const { plainText, a2uiJson } = extractA2ui(accumulated)
				const thought = accumulatedThought.trim() || undefined
				setMessages((prev) => [
					...prev,
					{ role: "assistant", content: plainText, thought, a2uiJson: a2uiJson ?? undefined },
				])
				setStreamingText("")
				setStreamingThought("")
			}
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				},
			])
		} finally {
			isLoadingRef.current = false
			setIsLoading(false)
			setStreamingText("")
			setStreamingThought("")
		}
	}

	const sendMessageRef = useRef(sendMessage)
	sendMessageRef.current = sendMessage

	const handleAction = useCallback((text: string) => {
		void sendMessageRef.current(text)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			void sendMessage()
		}
	}

	return (
		<div className="bg-[var(--color-surface)] rounded-lg shadow-2xl overflow-hidden">
			<div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-[var(--color-backgroundMuted)]">
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

				{(streamingThought || streamingText.replace(/<a2ui-json>[\s\S]*$/, "").trim()) && (
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
							{streamingText.replace(/<a2ui-json>[\s\S]*$/, "").trim() && (
								<div className="rounded-lg px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text)] shadow-md">
									<p className="whitespace-pre-wrap">
										{streamingText.replace(/<a2ui-json>[\s\S]*$/, "")}
										<span className="inline-block w-2 h-5 bg-[var(--color-text)] ml-1 animate-pulse" />
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			<div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
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
