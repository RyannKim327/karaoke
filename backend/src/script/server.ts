import http, { IncomingMessage, ServerResponse } from "http"

type serverContent = (req: IncomingMessage, res: ServerResponse) => void
type serverProps = Record<string, serverContent>

export default function server(endpoints: serverProps) {
	const server = http.createServer(async (req, res) => {
		const url = req.url?.split("?")[0] ?? ""

		const hand = Object.keys(endpoints).includes(url) ? endpoints[url] : endpoints["/404"]
		await hand(req, res)

	})
	return server
}
