<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let { config, title = 'Area Chart', className = '' } = $props();
	let canvasElement;
	let chartInstance;

	onMount(() => {
		if (canvasElement && config) {
			// Ensure the chart type is set to 'line' for area charts
			const areaConfig = {
				...config,
				type: 'line',
				data: {
					...config.data,
					datasets: config.data.datasets.map(dataset => ({
						...dataset,
						fill: true,
						tension: 0.4
					}))
				}
			};

			chartInstance = new Chart(canvasElement, areaConfig);
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
