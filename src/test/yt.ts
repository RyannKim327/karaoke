import { YTSearch } from "./../lib/yt.ts";

(async () => {
	const yt = await YTSearch("hello")
	console.log(yt[0].title)
})()
