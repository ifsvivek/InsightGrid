<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let { config, title = 'Mixed Chart', className = '' } = $props();
	let canvasElement;
	let chartInstance;

	onMount(() => {
		if (canvasElement && config) {
			// For mixed charts, we need to handle the datasets with different types
			const mixedConfig = {
				...config,
				type: 'bar', // Base type, datasets will override
				data: {
					...config.data,
					datasets: config.data.datasets.map(dataset => ({
						...dataset,
						type: dataset.type || 'bar' // Ensure each dataset has a type
					}))
				}
			};

			chartInstance = new Chart(canvasElement, mixedConfig);
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
