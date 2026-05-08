<script lang="ts">
	import { push } from "svelte-spa-router";

	let roomCode = "";

	function makeSession() {
		const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
		let id = "";

		for (let i = 0; i < 8; i++) {
			const c = Math.floor(Math.random() * alphabet.length);
			id += alphabet[c];
		}

		push(`/stream/${id}`);
	}

	function joinSession() {
		if (!roomCode.trim()) return;
		push(`/book/${roomCode.toLowerCase().trim()}`);
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 text-white flex items-center justify-center p-6"
>
	<div
		class="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8"
	>
		<div class="text-center mb-8">
			<div
				class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 mb-4"
			>
				🎤
			</div>

			<h1 class="text-5xl font-black tracking-tight">
				Kara <span class="text-red-400">Kokey</span>
			</h1>

			<p class="text-zinc-400 mt-3 text-sm">
				Create or join a karaoke streaming session instantly
			</p>
		</div>

		<div class="space-y-4">
			<div>
				<label class="text-sm text-zinc-400 mb-2 block"> Session Code </label>

				<input
					type="text"
					bind:value={roomCode}
					placeholder="Enter room code"
					class="w-full rounded-xl bg-zinc-900/70 border border-zinc-700 px-4 py-3 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/30 placeholder:text-zinc-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<button
					class="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 font-semibold transition active:scale-[0.98]"
					on:click={joinSession}
				>
					Join Session
				</button>

				<button
					class="rounded-xl bg-red-500 hover:bg-red-400 py-3 font-semibold shadow-lg shadow-red-500/30 transition active:scale-[0.98]"
					on:click={makeSession}
				>
					Create Room
				</button>
			</div>
		</div>

		<div class="mt-8 text-center text-xs text-zinc-500">
			Sing together. Anywhere. Anytime.
		</div>
	</div>
</div>
