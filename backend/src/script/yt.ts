import { ServerResponse } from "http";
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
		return v.type.toLowerCase().includes("video") &&
			((v.title.text.toLowerCase().includes("karaoke") && !v.title.text.toLowerCase().includes("#karaoke")) ||
				v.title.text.toLowerCase().includes("minus one") ||
				v.title.text.toLowerCase().includes("instrumental"))
	});
}


export async function play(ytID: string, res: ServerResponse) {
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

	res.setHeader("Content-Type", "video/mp4");
	res.setHeader("Accept-Ranges", "bytes");

	Readable.fromWeb(dl as any).pipe(res);
}


