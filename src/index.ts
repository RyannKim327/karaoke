import { serve } from "@hono/node-server"
import { WebSocketServer, WebSocket } from "ws"
import { app } from "./app.js"

const port = Number(process.env.PORT) || 3000

const server = serve({
	fetch: app.fetch,
	port
}, (info) => {
	console.log(`Listening on http://localhost:${info.port}`)
})

// Attach WS to the same server port if possible, or a separate one
const wss = new WebSocketServer({ port: 8080 })

const channels = new Map<string, Set<WebSocket & { isAlive: boolean }>>()

wss.on("connection", (ws: WebSocket & { isAlive: boolean }, req) => {
	const channel = req.url?.replace(/^\/ws\/?/, "") || "default"

	if (!channels.has(channel)) {
		channels.set(channel, new Set())
	}
	channels.get(channel)!.add(ws)

	ws.on("message", (data) => {
		channels.get(channel)?.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data.toString())
			}
		})
	})

	ws.on("close", () => {
		channels.get(channel)?.delete(ws)
		console.log(`Client disconnected from channel: ${channel}`)
	})
})
