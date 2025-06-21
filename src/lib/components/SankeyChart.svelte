<script>
	import { onMount } from 'svelte';

	let { config, title = 'Sankey Diagram', className = '' } = $props();
	let svgElement;

	onMount(() => {
		if (svgElement && config) {
			createSankeyDiagram();
		}
	});

	function createSankeyDiagram() {
		// Handle different data formats
		let nodes, links;
		
		if (config?.data?.nodes && config?.data?.links) {
			// Standard format with data wrapper
			nodes = config.data.nodes;
			links = config.data.links;
		} else if (config?.nodes && config?.links) {
			// Direct format
			nodes = config.nodes;
			links = config.links;
		} else {
			console.warn('SankeyChart: Invalid data format. Expected nodes and links.');
			return;
		}

		if (!nodes || !links || !Array.isArray(nodes) || !Array.isArray(links)) {
			console.warn('SankeyChart: Nodes and links must be arrays.');
			return;
		}

		const svg = svgElement;
		const width = 800;
		const height = 400;
		const margin = { top: 20, right: 20, bottom: 20, left: 20 };

		// Clear SVG
		svg.innerHTML = '';
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

		// Simple Sankey layout
		const nodeWidth = 15;
		const nodePadding = 10;
		
		// Position nodes
		const nodeMap = new Map();
		nodes.forEach((node, i) => {
			const x = (i % 2) * (width - nodeWidth - margin.left - margin.right) / 2 + margin.left;
			const y = (Math.floor(i / 2)) * (height - margin.top - margin.bottom) / Math.ceil(nodes.length / 2) + margin.top;
			
			nodeMap.set(node.id, {
				...node,
				x: x,
				y: y,
				width: nodeWidth,
				height: 50
			});
		});

		// Draw links
		const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		linkGroup.setAttribute('class', 'links');
		
		links.forEach(link => {
			const source = nodeMap.get(nodes[link.source]?.id || link.source);
			const target = nodeMap.get(nodes[link.target]?.id || link.target);
			
			if (source && target) {
				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				const pathData = `M ${source.x + source.width} ${source.y + source.height/2} 
								 C ${(source.x + target.x)/2} ${source.y + source.height/2}
								   ${(source.x + target.x)/2} ${target.y + target.height/2}
								   ${target.x} ${target.y + target.height/2}`;
				
				path.setAttribute('d', pathData);
				path.setAttribute('stroke', link.color || '#999');
				path.setAttribute('stroke-width', Math.max(2, link.value / 10));
				path.setAttribute('fill', 'none');
				path.setAttribute('opacity', '0.6');
				
				// Add hover effects
				path.addEventListener('mouseenter', () => {
					path.setAttribute('opacity', '0.8');
					path.setAttribute('stroke-width', String(Math.max(4, link.value / 8)));
				});
				
				path.addEventListener('mouseleave', () => {
					path.setAttribute('opacity', '0.6');
					path.setAttribute('stroke-width', String(Math.max(2, link.value / 10)));
				});

				// Add tooltip
				const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				title.textContent = `${source.label} → ${target.label}: ${link.value}`;
				path.appendChild(title);
				
				linkGroup.appendChild(path);
			}
		});
		
		svg.appendChild(linkGroup);

		// Draw nodes
		const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		nodeGroup.setAttribute('class', 'nodes');
		
		nodeMap.forEach(node => {
			const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('x', String(node.x));
			rect.setAttribute('y', String(node.y));
			rect.setAttribute('width', String(node.width));
			rect.setAttribute('height', String(node.height));
			rect.setAttribute('fill', node.color || '#69b3a2');
			rect.setAttribute('stroke', '#333');
			rect.setAttribute('stroke-width', '1');
			rect.setAttribute('rx', '3');

			// Add hover effects
			rect.addEventListener('mouseenter', () => {
				rect.setAttribute('opacity', '0.8');
			});
			
			rect.addEventListener('mouseleave', () => {
				rect.setAttribute('opacity', '1');
			});

			// Add node label
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', String(node.x + node.width + 5));
			text.setAttribute('y', String(node.y + node.height / 2));
			text.setAttribute('dy', '0.35em');
			text.setAttribute('font-size', '12');
			text.setAttribute('fill', '#333');
			text.textContent = node.label;

			// Add tooltip
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
			title.textContent = `${node.label}: ${node.value}`;
			rect.appendChild(title);
			
			nodeGroup.appendChild(rect);
			nodeGroup.appendChild(text);
		});
		
		svg.appendChild(nodeGroup);
	}

	$effect(() => {
		if (config && svgElement) {
			createSankeyDiagram();
		}
	});
</script>

<div class={`sankey-container ${className}`}>
	<svg bind:this={svgElement} class="sankey-svg"></svg>
</div>

<style>
	.sankey-container {
		position: relative;
		height: 400px;
		width: 100%;
	}

	.sankey-svg {
		width: 100%;
		height: 100%;
	}
</style>
