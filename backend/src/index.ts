import http from "http"
import { play, search } from "./script/yt"
import { WebSocketServer } from "ws"

const server = http.createServer(async (req, res) => {
	const func: Record<string, any> = {
		"/": async (req, res) => {
			const search_ = await search("hello")
			res.end(search_)
			return
		},
		"/play": async (req, res) => {
			res.end("Play")
			return
		}
	}

	const url = req.url?.split("?")[0] ?? ""
	func[url]
	// const hand = Object.keys(func).includes(url) ? func[url] : func["/404"]
	// await hand(req, res)
})

const wss = new WebSocketServer({ port: 8080 })
const channels = new Map<string, Set<WebSocket>>()


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
					JSON.stringify({
						path,
						message: event.toString()
					})
				);
			}
		});
	})
	ws.on("close", () => {
		console.log("Client disconnected");
	});

	// ws.send("Welcome to WebSocket server!");
})

server.listen(3000, () => {
	console.log("Listening")
})
