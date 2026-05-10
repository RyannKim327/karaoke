import { ServerResponse } from "http";
import { Innertube, Platform, Types } from "youtubei.js/web"

export async function search(song: string) {
	const yt = await Innertube.create()
	song = song.replace(/karaoke/gi, "")
	const result = await yt.search(`${song.trim()} karaoke`)
	return result.videos.filter((v) => {
		return v.type.toLowerCase().includes("video") && v.title.text.toLowerCase().includes("karaoke");
	});
}


export async function play(ytID: string, res: ServerResponse) {
	const yt = await Innertube.create();

	const stream = await yt.download(ytID, {
		type: 'video+audio',
		quality: 'best',
		format: 'mp4',
	});

	res.statusCode = 200;
	res.setHeader('Content-Type', 'video/mp4');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Cache-Control', 'no-cache');

	for await (const chunk of stream) {
		res.write(chunk);
	}
	res.end();
}
