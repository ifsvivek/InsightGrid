<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	export let template;
	export let data;

	let canvas;
	let chart;

	onMount(() => {
		if (canvas && template && data) {
			createChart();
		}
	});

	function createChart() {
		try {
			const processedData = processPieData(template, data);

			const config = {
				type: 'pie',
				data: processedData,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: template.title,
							font: { size: 16, weight: 'bold' }
						},
						legend: {
							display: true,
							position: 'right'
						}
					}
				}
			};

			chart = new Chart(canvas, config);
		} catch (error) {
			console.error('Error creating pie chart:', error);
		}
	}

	function processPieData(template, fullData) {
		const { xAxis, yAxis, aggregation, colorScheme } = template;

		// Group and aggregate data
		const grouped = {};
		fullData.forEach((row) => {
			const xValue = row[xAxis];
			const yValue = parseFloat(row[yAxis]) || 0;

			if (xValue) {
				if (!grouped[xValue]) {
					grouped[xValue] = [];
				}
				grouped[xValue].push(yValue);
			}
		});

		// Aggregate values
		const labels = Object.keys(grouped);
		const values = labels.map((label) => {
			const values = grouped[label];
			switch (aggregation) {
				case 'sum':
					return values.reduce((a, b) => a + b, 0);
				case 'avg':
					return values.reduce((a, b) => a + b, 0) / values.length;
				case 'count':
					return values.length;
				default:
					return values[0];
			}
		});

		return {
			labels,
			datasets: [
				{
					data: values,
					backgroundColor: getColors(colorScheme, labels.length),
					borderWidth: 2
				}
			]
		};
	}

	function getColors(scheme, count) {
		const colorSchemes = {
			blue: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#312E81'],
			green: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
			red: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
			purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
			rainbow: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
		};

		const colors = colorSchemes[scheme] || colorSchemes.blue;
		return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
	}
</script>

<div class="h-80 w-full">
	<canvas bind:this={canvas}></canvas>
</div>
