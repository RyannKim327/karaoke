import { WebSocketServer } from "ws"
import server from "./script/server"
import { IncomingMessage, ServerResponse } from "http"
import { play, search } from "./script/yt"

const wss = new WebSocketServer({ port: 8080 })
const channels = new Map<string, Set<WebSocket>>()

type serverContent = (req: IncomingMessage, res: ServerResponse) => void
type serverProps = Record<string, serverContent>

const endpoints: serverProps = {
	"/": (req, res) => {
		res.end(JSON.stringify({
			"response": "Server currently running"
		}))
	},
	"/search": async (req, res) => {
		const host = req.headers.host ?? ""
		const url = new URL(req.url ?? "", `http://${host}`);
		const params = url?.searchParams

		if (!params.get("q")) {
			return res.end(JSON.stringify({
				"error": "Please search a song"
			}))
		}

		const lists = await search(params.get("q"))

		res.end(JSON.stringify(lists))
	},
	"/play": async (req, res) => {
		const host = req.headers.host ?? ""
		const url = new URL(req.url ?? "", `http://${host}`);
		const params = url?.searchParams
		const id = params.get("id")

		if (!id) {
			return res.end(JSON.stringify({
				"error": "Please enter the video ID"
			}))
		}

		const song = await play(id)
		res.end(JSON.stringify(song))

	},
	"/404": (req, res) => {
		res.end(JSON.stringify({
			"error": "Endpoint not found"
		}))
	}
}

const service = server(endpoints)

wss.on("connection", (ws, req) => {
	const path = req.url?.slice(1) || "default";

	if (!channels.has(path)) {
		channels.set(path, new Set());
	}

	// add client to endpoint room
	channels.get(path)?.add(ws);

	ws.on("message", (event: MessageEvent) => {
		channels.get(path)?.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(
					event.toString()
				);
			}
		});
	})
	ws.on("close", () => {
		console.log("Client disconnected");
	});

	// ws.send("Welcome to WebSocket server!");
})

service.listen(3000, () => {
	console.log("Listening")
})
