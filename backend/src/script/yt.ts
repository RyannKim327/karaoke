import { writeFileSync } from "fs";
import { ClientType, Innertube, Platform, Types } from "youtubei.js/web"

export async function search(song: string) {
	const yt = await Innertube.create()
	const result = await yt.search(`${song} karaoke`)
	return result.videos.filter((v) => {
		return v.type.toLowerCase().includes("video") && v.title.text.toLowerCase().includes("karaoke");
	});
}

export async function play(ytID: string) {
	Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
		const properties = [];
		if (env.n) {
			properties.push(`n: exportedVars.nFunction("${env.n}")`)
		}
		if (env.sig) {
			properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
		}
		const code = `${data.output}\nreturn { ${properties.join(', ')} }`;
		return new Function(code)();
	}

	const yt = await Innertube.create({
		client_type: 'ANDROID'
	});

	const info = await yt.getInfo(ytID);

	const format = await info.chooseFormat({
		quality: 'best',
		type: 'video+audio'
	});

	if (!format?.url) {
		throw new Error('No stream URL found');
	}

	return format.url;
}
