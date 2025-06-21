<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Parallel Coordinates Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.data && config?.dimensions) {
			createParallelChart();
		}
	});

	function createParallelChart() {
		const { data, dimensions, ranges, colorScheme } = config;
		const width = 800;
		const height = 400;
		const margin = { top: 30, right: 30, bottom: 30, left: 30 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Create scales for each dimension
		const x = d3.scalePoint()
			.domain(dimensions)
			.range([0, innerWidth]);

		const y = {};
		dimensions.forEach(dim => {
			y[dim] = d3.scaleLinear()
				.domain(d3.extent(data, d => d[dim]))
				.range([innerHeight, 0]);
		});

		// Color scale
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		// Line generator
		const line = d3.line()
			.defined(d => !isNaN(d[1]))
			.x(d => d[0])
			.y(d => d[1])
			.curve(d3.curveCardinal);

		// Background lines (for context)
		g.append('g')
			.selectAll('.background-line')
			.data(data)
			.enter().append('path')
			.attr('class', 'background-line')
			.attr('d', d => line(dimensions.map(dim => [x(dim), y[dim](d[dim])])))
			.style('fill', 'none')
			.style('stroke', '#ddd')
			.style('stroke-width', 1)
			.style('opacity', 0.3);

		// Foreground lines (interactive)
		const foreground = g.append('g')
			.selectAll('.foreground-line')
			.data(data)
			.enter().append('path')
			.attr('class', 'foreground-line')
			.attr('d', d => line(dimensions.map(dim => [x(dim), y[dim](d[dim])])))
			.style('fill', 'none')
			.style('stroke', (d, i) => color(i % 10))
			.style('stroke-width', 2)
			.style('opacity', 0.7)
			.on('mouseover', function(event, d) {
				d3.select(this)
					.style('stroke-width', 4)
					.style('opacity', 1);

				// Show tooltip
				const tooltip = d3.select('body').append('div')
					.attr('class', 'chart-tooltip')
					.style('position', 'absolute')
					.style('background', 'rgba(0, 0, 0, 0.8)')
					.style('color', 'white')
					.style('padding', '8px')
					.style('border-radius', '4px')
					.style('font-size', '12px')
					.style('pointer-events', 'none')
					.style('z-index', 1000);

				const tooltipContent = dimensions.map(dim => 
					`<strong>${dim}:</strong> ${d[dim].toFixed(2)}`
				).join('<br/>');

				tooltip.html(`
					<strong>Data Point ${d.index || ''}</strong><br/>
					${tooltipContent}
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this)
					.style('stroke-width', 2)
					.style('opacity', 0.7);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Add axes
		dimensions.forEach(dim => {
			const axis = g.append('g')
				.attr('transform', `translate(${x(dim)},0)`)
				.call(d3.axisLeft(y[dim]));

			// Add axis title
			axis.append('text')
				.attr('y', -10)
				.style('text-anchor', 'middle')
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.style('fill', '#333')
				.text(dim);

			// Add brushing capability
			const brush = d3.brushY()
				.extent([[-10, 0], [10, innerHeight]])
				.on('brush end', function(event) {
					if (event.selection) {
						const [y0, y1] = event.selection.map(y[dim].invert);
						
						// Filter lines based on brush selection
						foreground.style('opacity', d => {
							const value = d[dim];
							return value >= y1 && value <= y0 ? 0.7 : 0.1;
						});
					} else {
						// Reset if no selection
						foreground.style('opacity', 0.7);
					}
				});

			axis.append('g')
				.attr('class', 'brush')
				.call(brush);
		});

		// Add legend
		const legendData = data.slice(0, Math.min(5, data.length));
		const legend = g.append('g')
			.attr('class', 'legend')
			.attr('transform', `translate(${innerWidth + 10}, 20)`);

		legend.selectAll('.legend-item')
			.data(legendData)
			.enter().append('g')
			.attr('class', 'legend-item')
			.attr('transform', (d, i) => `translate(0, ${i * 20})`)
			.each(function(d, i) {
				const item = d3.select(this);
				
				item.append('line')
					.attr('x1', 0)
					.attr('x2', 15)
					.attr('y1', 0)
					.attr('y2', 0)
					.style('stroke', color(i))
					.style('stroke-width', 2);

				item.append('text')
					.attr('x', 20)
					.attr('y', 0)
					.attr('dy', '0.35em')
					.style('font-size', '10px')
					.text(`Item ${i + 1}`);
			});
	}

	$effect(() => {
		if (svgElement && config?.data && config?.dimensions) {
			createParallelChart();
		}
	});
</script>

<div class={`parallel-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.parallel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 450px;
		overflow-x: auto;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	svg {
		min-width: 800px;
		max-height: 100%;
	}

	:global(.chart-tooltip) {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px;
		border-radius: 4px;
		font-size: 12px;
		pointer-events: none;
		z-index: 1000;
	}

	:global(.brush .selection) {
		fill: rgba(0, 0, 255, 0.2);
		stroke: blue;
	}
</style>
