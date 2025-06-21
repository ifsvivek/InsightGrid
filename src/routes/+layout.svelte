<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>InsightGrid - AI-Powered CSV Dashboard Generator</title>
	<meta
		name="description"
		content="Turn your CSVs into beautiful dashboards with AI-powered agents"
	/>
</svelte:head>

{@render children()}
