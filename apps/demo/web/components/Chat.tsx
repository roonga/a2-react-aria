"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"

const A2UIBlock = dynamic(
	() =>
		import("./A2UIBlock").catch((err: unknown) => {
			console.error("[Chat] A2UIBlock import failed:", err)
			const Fallback = () => <p className="text-xs text-red-500">A2UI load error: {String(err)}</p>
			Fallback.displayName = "A2UIBlockFallback"
			return { default: Fallback }
		}),
	{
		ssr: false,
		loading: () => <p className="text-xs text-gray-400 mt-1">Loading components…</p>,
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

const INITIAL_NODES: unknown[] = [
	{
		type: "Card",
		props: { padding: "lg", shadow: "sm", radius: "lg", border: true },
		children: [
			{ type: "Text", props: { as: "h2", size: "xl", weight: "bold" }, children: "Find Your Table" },
			{
				type: "Text",
				props: { as: "p", size: "sm", color: "muted" },
				children: "Powered by a2UI + Google ADK",
			},
			{
				type: "Grid",
				props: { columns: 2, gap: "md" },
				children: [
					{
						type: "TextField",
						props: { label: "Location", placeholder: "e.g. Sydney CBD", isRequired: true },
					},
					{
						type: "Select",
						props: {
							label: "Cuisine",
							items: [
								{ label: "Any cuisine", value: "any" },
								{ label: "Italian", value: "Italian" },
								{ label: "Japanese", value: "Japanese" },
								{ label: "Thai", value: "Thai" },
								{ label: "Modern Australian", value: "Modern Australian" },
							],
							defaultValue: "any",
						},
					},
					{
						type: "NumberField",
						props: { label: "Guests", minValue: 1, maxValue: 20, defaultValue: 2, isRequired: true },
					},
					{
						type: "DatePicker",
						props: { label: "Date", isRequired: true },
					},
				],
			},
			{
				type: "Flex",
				props: { justify: "end", gap: "sm" },
				children: [{ type: "Button", props: { variant: "primary" }, children: "Find Restaurants" }],
			},
		],
	},
]

const INITIAL_MESSAGE: Message = { role: "assistant", content: "", a2uiJson: INITIAL_NODES }

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
			className="mb-2 rounded-md border border-purple-200 bg-purple-50 text-xs"
		>
			<summary className="cursor-pointer select-none px-3 py-1.5 font-medium text-purple-600 list-none flex items-center gap-1.5">
				<span className="text-purple-400">{open ? "▾" : "▸"}</span>
				Thinking
			</summary>
			<p className="px-3 pb-2 pt-1 whitespace-pre-wrap text-purple-700 italic leading-relaxed">{text.trim()}</p>
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
		<div className="bg-white rounded-lg shadow-2xl overflow-hidden">
			<div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-gray-50">
				{messages.map((msg, idx) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: chat messages have no stable IDs
					<div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`max-w-[85%] rounded-lg px-4 py-3 ${
								msg.role === "user"
									? "bg-blue-600 text-white"
									: msg.content.startsWith("Error:")
										? "bg-red-50 text-red-800 border border-red-200 shadow-sm"
										: "bg-white text-gray-900 shadow-md"
							}`}
						>
							{msg.thought && <ThinkingBlock text={msg.thought} />}
							{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
							{msg.a2uiJson && <A2UIBlock nodes={msg.a2uiJson} onAction={handleAction} />}
						</div>
					</div>
				))}

				{(streamingThought || streamingText) && (
					<div className="flex justify-start">
						<div className="max-w-[85%] space-y-1">
							{streamingThought && (
								<div className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-600 flex items-center gap-2">
									<span className="flex gap-0.5">
										<span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
									</span>
									<span className="font-medium">Thinking…</span>
								</div>
							)}
							{streamingText.trim() && (
								<div className="rounded-lg px-4 py-3 bg-white text-gray-900 shadow-md">
									<p className="whitespace-pre-wrap">
										{streamingText}
										<span className="inline-block w-2 h-5 bg-gray-700 ml-1 animate-pulse" />
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			<div className="border-t border-gray-200 p-4 bg-white">
				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Or type a message…"
						disabled={isLoading}
						className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
					<button
						type="button"
						onClick={() => void sendMessage()}
						disabled={isLoading || !input.trim()}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
					>
						{isLoading ? "Sending…" : "Send"}
					</button>
				</div>
			</div>
		</div>
	)
}
