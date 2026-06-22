import Chat from "@/components/Chat"

export default function Home() {
	return (
		<main className="flex min-h-screen items-start justify-center p-6 pt-16">
			<div className="w-full max-w-3xl">
				<h1 className="mb-2 text-center font-bold text-2xl text-[var(--color-text)]">Restaurant Booking</h1>
				<p className="mb-6 text-center text-[var(--color-textMuted)] text-sm">
					Powered by <span className="font-medium text-[var(--color-primary)]">@a2ra/core</span> + Google ADK
				</p>
				<Chat />
			</div>
		</main>
	)
}
