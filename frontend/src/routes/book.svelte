<script lang="ts">
	interface SongInfo {
		title: string
		url: string
	}

	export let params: {id: string}
	
	const socket = new WebSocket(`ws://localhost:8080/${params.id}`);

	socket.onopen = (event: Event) => {
		console.log("Initiated");
		socket.send(
			JSON.stringify({
				play: true,
			}),
		);
	};

	function send() {
	socket.send(JSON.stringify({
			title: "title",
			url: "test",
		}))
	
	}

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

</script>

<div>
	{params.id}
	<button onclick={send}>Send</button>
</div>
