<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
</script>

<div class="h-dvh w-dvw">
  <Router {routes} useHash={true} />
</div>
