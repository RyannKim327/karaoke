import { Innertube } from "youtubei.js"
import { Readable } from "stream";

let ytPromise: Promise<Innertube> | null = null;

async function getYt() {
	if (!ytPromise) {
		ytPromise = Innertube.create();
	}
	return ytPromise;
}

export async function search(song: string) {
	const yt = await getYt();
	song = song.replace(/karaoke/gi, "")
	const result = await yt.search(`${song.trim()} karaoke`)
	return result.videos.filter((v) => {
		if (!v.hasKey("title")) return false;
		const title = (v as any).title.toString().toLowerCase();
		return v.type.toLowerCase().includes("video") &&
			((title.includes("karaoke") && !title.includes("#karaoke")) ||
				title.includes("minus one") ||
				title.includes("instrumental"))
	});
}


export async function play(ytID: string, res: any) {
	const yt = await getYt();
	const info = await yt.getInfo(ytID, { client: "ANDROID" });

	if (!info.streaming_data) {
		throw new Error(`No streaming data for ${ytID}`);
	}

	const dl = await info.download({
		quality: "best",
		type: "video+audio",
		format: "mp4",
	});

	if (res.setHeader) {
		res.setHeader("Content-Type", "video/mp4");
		res.setHeader("Accept-Ranges", "bytes");
	}

	const readable = Readable.fromWeb(dl as any);

	readable.on("error", (err) => {
		console.warn("Stream error (client likely disconnected):", err.message);
		if (res.end) res.end();
	});

	if (res.on) {
		res.on("close", () => {
			// user navigated away, destroy the stream
			readable.destroy();
		});
	}

	if (res.pipe) {
		res.pipe(readable);
	} else {
		// Fallback for manual iteration if needed
		return readable;
	}
}

