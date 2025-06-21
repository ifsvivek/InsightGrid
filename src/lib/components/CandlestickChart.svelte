<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Candlestick Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.data?.datasets?.[0]?.data) {
			createCandlestickChart();
		}
	});

	function createCandlestickChart() {
		const data = config.data.datasets[0].data;
		const width = 800;
		const height = 400;
		const margin = { top: 20, right: 50, bottom: 50, left: 50 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Parse dates and sort data
		const parsedData = data.map(d => ({
			...d,
			date: new Date(d.x)
		})).sort((a, b) => a.date - b.date);

		// Scales
		const xScale = d3.scaleTime()
			.domain(d3.extent(parsedData, d => d.date))
			.range([0, innerWidth]);

		const yScale = d3.scaleLinear()
			.domain(d3.extent(parsedData.flatMap(d => [d.l, d.h])))
			.range([innerHeight, 0]);

		// Calculate candlestick width
		const candleWidth = Math.max(2, innerWidth / parsedData.length * 0.8);

		// Create candlesticks
		const candlesticks = g.selectAll('.candlestick')
			.data(parsedData)
			.enter().append('g')
			.attr('class', 'candlestick')
			.attr('transform', d => `translate(${xScale(d.date)}, 0)`);

		// High-Low lines (wicks)
		candlesticks.append('line')
			.attr('class', 'wick')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', d => yScale(d.h))
			.attr('y2', d => yScale(d.l))
			.style('stroke', '#333')
			.style('stroke-width', 1);

		// Open-Close rectangles (bodies)
		candlesticks.append('rect')
			.attr('class', 'body')
			.attr('x', -candleWidth / 2)
			.attr('y', d => yScale(Math.max(d.o, d.c)))
			.attr('width', candleWidth)
			.attr('height', d => Math.abs(yScale(d.o) - yScale(d.c)) || 1)
			.style('fill', d => d.c >= d.o ? '#4CAF50' : '#f44336')
			.style('stroke', d => d.c >= d.o ? '#2E7D32' : '#c62828')
			.style('stroke-width', 1);

		// Add hover effects
		candlesticks.on('mouseover', function(event, d) {
			d3.select(this).select('.body').style('opacity', 0.8);
			
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

			const change = d.c - d.o;
			const changePercent = ((change / d.o) * 100).toFixed(2);

			tooltip.html(`
				<strong>${d.date.toLocaleDateString()}</strong><br/>
				Open: ${d.o.toFixed(2)}<br/>
				High: ${d.h.toFixed(2)}<br/>
				Low: ${d.l.toFixed(2)}<br/>
				Close: ${d.c.toFixed(2)}<br/>
				Change: ${change > 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)
			`)
			.style('left', (event.pageX + 10) + 'px')
			.style('top', (event.pageY - 10) + 'px');
		})
		.on('mouseout', function() {
			d3.select(this).select('.body').style('opacity', 1);
			d3.selectAll('.chart-tooltip').remove();
		});

		// Add axes
		const xAxis = d3.axisBottom(xScale)
			.tickFormat(d3.timeFormat('%m/%d'));

		const yAxis = d3.axisLeft(yScale)
			.tickFormat(d3.format('.2f'));

		g.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0, ${innerHeight})`)
			.call(xAxis);

		g.append('g')
			.attr('class', 'y-axis')
			.call(yAxis);

		// Add grid lines
		g.selectAll('.grid-x')
			.data(xScale.ticks(10))
			.enter().append('line')
			.attr('class', 'grid-x')
			.attr('x1', d => xScale(d))
			.attr('x2', d => xScale(d))
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.style('stroke', '#e0e0e0')
			.style('stroke-width', 1);

		g.selectAll('.grid-y')
			.data(yScale.ticks(8))
			.enter().append('line')
			.attr('class', 'grid-y')
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', d => yScale(d))
			.attr('y2', d => yScale(d))
			.style('stroke', '#e0e0e0')
			.style('stroke-width', 1);

		// Add volume bars (if volume data is available)
		if (parsedData.some(d => d.volume !== undefined)) {
			const volumeScale = d3.scaleLinear()
				.domain([0, d3.max(parsedData, d => d.volume || 0)])
				.range([0, innerHeight * 0.2]);

			g.selectAll('.volume-bar')
				.data(parsedData)
				.enter().append('rect')
				.attr('class', 'volume-bar')
				.attr('x', d => xScale(d.date) - candleWidth / 2)
				.attr('y', d => innerHeight - volumeScale(d.volume || 0))
				.attr('width', candleWidth)
				.attr('height', d => volumeScale(d.volume || 0))
				.style('fill', d => d.c >= d.o ? '#4CAF50' : '#f44336')
				.style('opacity', 0.3);
		}

		// Add legend
		const legend = g.append('g')
			.attr('class', 'legend')
			.attr('transform', `translate(${innerWidth - 120}, 20)`);

		legend.append('rect')
			.attr('width', 15)
			.attr('height', 15)
			.style('fill', '#4CAF50');

		legend.append('text')
			.attr('x', 20)
			.attr('y', 12)
			.style('font-size', '12px')
			.text('Bullish (Up)');

		legend.append('rect')
			.attr('y', 20)
			.attr('width', 15)
			.attr('height', 15)
			.style('fill', '#f44336');

		legend.append('text')
			.attr('x', 20)
			.attr('y', 32)
			.style('font-size', '12px')
			.text('Bearish (Down)');
	}

	$effect(() => {
		if (svgElement && config?.data?.datasets?.[0]?.data) {
			createCandlestickChart();
		}
	});
</script>

<div class={`candlestick-container ${className}`} bind:this={containerElement}>
	{#if config?.options?.plugins?.title?.text}
		<h3 class="chart-title">{config.options.plugins.title.text}</h3>
	{/if}
	<div class="chart-scroll">
		<svg bind:this={svgElement}></svg>
	</div>
</div>

<style>
	.candlestick-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 450px;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	.chart-scroll {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
	}

	svg {
		min-width: 800px;
		max-height: 100%;
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
