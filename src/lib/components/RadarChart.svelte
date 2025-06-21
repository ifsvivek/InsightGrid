<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let { config, title = 'Radar Chart', className = '' } = $props();
	let canvasElement;
	let chartInstance;

	onMount(() => {
		if (canvasElement && config) {
			// Ensure the chart type is set to 'radar'
			const radarConfig = {
				...config,
				type: 'radar'
			};

			chartInstance = new Chart(canvasElement, radarConfig);
		}
	});

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
		}
	});

	$effect(() => {
		if (chartInstance && config) {
			chartInstance.data = config.data;
			chartInstance.options = config.options;
			chartInstance.update();
		}
	});
</script>

<div class={`chart-container ${className}`}>
	<canvas bind:this={canvasElement} aria-label={title}></canvas>
</div>

<style>
	.chart-container {
		position: relative;
		height: 400px;
		width: 100%;
	}
</style>
