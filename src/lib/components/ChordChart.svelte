<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Chord Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.labels && config?.matrix) {
			createChordChart();
		}
	});

	function createChordChart() {
		const { labels, matrix, colors } = config;
		const width = 400;
		const height = 400;
		const outerRadius = Math.min(width, height) * 0.5 - 40;
		const innerRadius = outerRadius - 20;

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`);

		// Create chord layout
		const chord = d3.chord()
			.padAngle(0.05)
			.sortSubgroups(d3.descending);

		const chords = chord(matrix);

		// Create arc generator for groups
		const arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);

		// Create ribbon generator for chords
		const ribbon = d3.ribbon()
			.radius(innerRadius);

		// Color scale
		const color = d3.scaleOrdinal()
			.domain(d3.range(labels.length))
			.range(colors || d3.schemeCategory10);

		// Add groups (arcs)
		const group = g.append('g')
			.selectAll('g')
			.data(chords.groups)
			.enter().append('g');

		group.append('path')
			.style('fill', d => color(d.index))
			.style('stroke', d => d3.rgb(color(d.index)).darker())
			.attr('d', arc)
			.on('mouseover', function(event, d) {
				d3.select(this).style('opacity', 1);
				
				// Highlight related chords
				g.selectAll('.chord')
					.style('opacity', chord => 
						chord.source.index === d.index || chord.target.index === d.index ? 0.8 : 0.1
					);
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.8);
				g.selectAll('.chord').style('opacity', 0.7);
			});

		// Add labels
		group.append('text')
			.each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
			.attr('dy', '.35em')
			.attr('transform', d => `
				rotate(${(d.angle * 180 / Math.PI - 90)})
				translate(${outerRadius + 10})
				${d.angle > Math.PI ? 'rotate(180)' : ''}
			`)
			.style('text-anchor', d => d.angle > Math.PI ? 'end' : null)
			.style('font-size', '10px')
			.text(d => labels[d.index]);

		// Add chords (ribbons)
		g.append('g')
			.selectAll('path')
			.data(chords)
			.enter().append('path')
			.attr('class', 'chord')
			.attr('d', ribbon)
			.style('fill', d => color(d.source.index))
			.style('opacity', 0.7)
			.style('stroke', d => d3.rgb(color(d.source.index)).darker())
			.style('stroke-width', 1)
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

				tooltip.html(`
					<strong>${labels[d.source.index]} → ${labels[d.target.index]}</strong><br/>
					Value: ${d.source.value}
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.7);
				d3.selectAll('.chart-tooltip').remove();
			});
	}

	$effect(() => {
		if (svgElement && config?.labels && config?.matrix) {
			createChordChart();
		}
	});
</script>

<div class={`chord-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.chord-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 400px;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	svg {
		max-width: 100%;
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
</style>
