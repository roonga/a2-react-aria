import Chat from "@/components/Chat"

export default function Home() {
  return (
    <main className="flex min-h-screen items-start justify-center p-6 pt-16">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Restaurant Booking
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Powered by <span className="font-medium text-blue-600">@a2ui/core</span> + Google ADK
        </p>
        <Chat />
      </div>
    </main>
  )
}
