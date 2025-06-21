<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let { config, title = 'Histogram', className = '' } = $props();
	let canvasElement;
	let chartInstance;

	onMount(() => {
		if (canvasElement && config) {
			// Histogram is rendered as a bar chart with specific styling
			const histogramConfig = {
				...config,
				type: 'bar',
				options: {
					...config.options,
					scales: {
						...config.options?.scales,
						x: {
							...config.options?.scales?.x,
							categoryPercentage: 1.0,
							barPercentage: 1.0
						}
					}
				}
			};

			chartInstance = new Chart(canvasElement, histogramConfig);
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
