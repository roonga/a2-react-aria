import Chat from "@/components/Chat"

export default function Home() {
	return (
		<main className="flex min-h-screen items-start justify-center p-6 pt-16">
			<div className="w-full max-w-3xl">
				<h1 className="text-2xl font-bold text-[var(--color-text)] mb-2 text-center">Restaurant Booking</h1>
				<p className="text-sm text-[var(--color-textMuted)] mb-6 text-center">
					Powered by <span className="font-medium text-[var(--color-primary)]">@a2ui/core</span> + Google ADK
				</p>
				<Chat />
			</div>
		</main>
	)
}
