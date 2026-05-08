<script lang="ts">
	export let params: { id: string };
</script>

<div class="h-full w-full">
	{params.id ?? "not found"}
</div>
