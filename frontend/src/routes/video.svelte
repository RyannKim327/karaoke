<script lang="ts">
	import { onMount } from "svelte";

	interface SongInfo {
		title: string;
		url: string;
	}

	export let params: { id: string };
	let socket;
	let sources: SongInfo[] = [];
	let source = "";

	onMount(() => {
		socket = new WebSocket(`ws://localhost:8080/${params.id}`);

		socket.onopen = (event: Event) => {
			console.log("Initiated");
			socket.send(
				JSON.stringify({
					play: true,
				}),
			);
		};

		socket.onmessage = (event: MessageEvent) => {
			console.log(event.data);
			const data: SongInfo = JSON.parse(event.data);
			sources.push({
				title: data.title,
				url: data.url,
			});
		};

		socket.onerror = (error: Event) => {
			console.error(error);
		};

		socket.onclose = (evnet: CloseEvent) => {
			socket.send(
				JSON.stringify({
					play: false,
				}),
			);
		};
	});
</script>

<div class="h-full w-full">
	<ul>
		{#each sources as msg}
			<li>{msg.title}</li>
		{/each}
	</ul>
	<!--video class="w-full h-full aspect-video" src={source}></video --->
</div>
