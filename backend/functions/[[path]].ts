import { app } from "../src/app.js"

const channels = new Map<string, Set<WebSocket>>()

export const onRequest: PagesFunction = async (context) => {
	const url = new URL(context.request.url)

	// Handle WebSockets
	if (url.pathname.startsWith("/ws")) {
		const upgradeHeader = context.request.headers.get("Upgrade")
		if (upgradeHeader !== "websocket") {
			return new Response("Expected Upgrade: websocket", { status: 426 })
		}

		const [client, server] = new WebSocketPair()
		const channel = url.pathname.replace(/^\/ws\/?/, "") || "default"

		server.accept()

		if (!channels.has(channel)) {
			channels.set(channel, new Set())
		}
		const clients = channels.get(channel)!
		clients.add(server)

		server.addEventListener("message", (event) => {
			const data = event.data
			clients.forEach((c) => {
				if (c !== server) {
					c.send(data)
				}
			})
		})

		server.addEventListener("close", () => {
			clients.delete(server)
			if (clients.size === 0) {
				channels.delete(channel)
			}
		})

		return new Response(null, {
			status: 101,
			webSocket: client,
		})
	}

	// Hono handle
	return app.fetch(context.request, context.env, context)
}
