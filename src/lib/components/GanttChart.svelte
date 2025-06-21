<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Gantt Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.tasks) {
			createGanttChart();
		}
	});

	function createGanttChart() {
		const { tasks, categories, timeline } = config;
		const width = 800;
		const height = Math.max(300, tasks.length * 40 + 100);
		const margin = { top: 50, right: 50, bottom: 50, left: 200 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Time scale
		const xScale = d3.scaleTime()
			.domain([timeline.start, timeline.end])
			.range([0, innerWidth]);

		// Task scale
		const yScale = d3.scaleBand()
			.domain(tasks.map(d => d.task))
			.range([0, innerHeight])
			.padding(0.1);

		// Color scale
		const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
			.domain(categories);

		// Add time axis
		const xAxis = d3.axisTop(xScale)
			.tickFormat(d3.timeFormat('%b %d'));

		g.append('g')
			.attr('class', 'x-axis')
			.call(xAxis);

		// Add task axis
		const yAxis = d3.axisLeft(yScale);

		g.append('g')
			.attr('class', 'y-axis')
			.call(yAxis);

		// Add grid lines
		g.selectAll('.grid-line')
			.data(xScale.ticks(10))
			.enter().append('line')
			.attr('class', 'grid-line')
			.attr('x1', d => xScale(d))
			.attr('x2', d => xScale(d))
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.style('stroke', '#e0e0e0')
			.style('stroke-width', 1);

		// Create task bars
		g.selectAll('.task-bar')
			.data(tasks)
			.enter().append('rect')
			.attr('class', 'task-bar')
			.attr('x', d => xScale(d.start))
			.attr('y', d => yScale(d.task))
			.attr('width', d => xScale(d.end) - xScale(d.start))
			.attr('height', yScale.bandwidth())
			.style('fill', d => d.color || colorScale(d.category))
			.style('stroke', '#fff')
			.style('stroke-width', 1)
			.style('opacity', 0.8)
			.on('mouseover', function(event, d) {
				d3.select(this).style('opacity', 1);

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

				const duration = Math.ceil((d.end - d.start) / (1000 * 60 * 60 * 24));

				tooltip.html(`
					<strong>${d.task}</strong><br/>
					Category: ${d.category}<br/>
					Start: ${d.start.toLocaleDateString()}<br/>
					End: ${d.end.toLocaleDateString()}<br/>
					Duration: ${duration} days
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.8);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Add progress indicators (if available)
		tasks.forEach(task => {
			if (task.progress !== undefined) {
				const progressWidth = (xScale(task.end) - xScale(task.start)) * (task.progress / 100);
				
				g.append('rect')
					.attr('x', xScale(task.start))
					.attr('y', yScale(task.task) + yScale.bandwidth() * 0.7)
					.attr('width', progressWidth)
					.attr('height', yScale.bandwidth() * 0.2)
					.style('fill', '#4CAF50')
					.style('opacity', 0.9);
			}
		});

		// Add today's date line
		const today = new Date();
		if (today >= timeline.start && today <= timeline.end) {
			g.append('line')
				.attr('x1', xScale(today))
				.attr('x2', xScale(today))
				.attr('y1', 0)
				.attr('y2', innerHeight)
				.style('stroke', '#ff4444')
				.style('stroke-width', 2)
				.style('stroke-dasharray', '5,5');

			g.append('text')
				.attr('x', xScale(today))
				.attr('y', -10)
				.style('text-anchor', 'middle')
				.style('font-size', '10px')
				.style('fill', '#ff4444')
				.style('font-weight', 'bold')
				.text('Today');
		}

		// Add category legend
		const legend = g.append('g')
			.attr('class', 'legend')
			.attr('transform', `translate(${innerWidth + 20}, 20)`);

		categories.forEach((category, index) => {
			const legendItem = legend.append('g')
				.attr('transform', `translate(0, ${index * 20})`);

			legendItem.append('rect')
				.attr('width', 15)
				.attr('height', 15)
				.style('fill', colorScale(category));

			legendItem.append('text')
				.attr('x', 20)
				.attr('y', 7.5)
				.attr('dy', '0.35em')
				.style('font-size', '12px')
				.text(category);
		});

		// Add milestones (if available)
		tasks.filter(task => task.milestone).forEach(task => {
			g.append('polygon')
				.attr('points', () => {
					const x = xScale(task.start);
					const y = yScale(task.task) + yScale.bandwidth() / 2;
					const size = 8;
					return `${x},${y-size} ${x+size},${y} ${x},${y+size} ${x-size},${y}`;
				})
				.style('fill', '#FFD700')
				.style('stroke', '#FFA500')
				.style('stroke-width', 2);
		});
	}

	$effect(() => {
		if (svgElement && config?.tasks) {
			createGanttChart();
		}
	});
</script>

<div class={`gantt-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<div class="gantt-scroll">
		<svg bind:this={svgElement}></svg>
	</div>
</div>

<style>
	.gantt-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 400px;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	.gantt-scroll {
		width: 100%;
		overflow-x: auto;
		overflow-y: auto;
		max-height: 500px;
	}

	svg {
		min-width: 800px;
		display: block;
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

	:global(.x-axis text, .y-axis text) {
		font-size: 11px;
		fill: #333;
	}

	:global(.x-axis .domain, .y-axis .domain) {
		stroke: #333;
	}
</style>
