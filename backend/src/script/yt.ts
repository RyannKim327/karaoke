import { Innertube } from "youtubei.js"

export async function search(song: string) {
	const yt = await Innertube.create()
	const result = await yt.search(`${song} karaoke`)
	return result.videos[0].title
}

export async function play(ytID: string) {
	const yt = await Innertube.create()
	const info = await yt.getInfo(ytID)

	const formats = info.streaming_data?.formats || []

	const format = formats.find((f) => {
		f.mime_type?.includes("video/mp4")
	})
	return format?.url
}
