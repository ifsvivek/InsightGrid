<script>
	import { onMount } from 'svelte';

	let { config, title = 'Network Diagram', className = '' } = $props();
	let svgElement;

	onMount(() => {
		if (svgElement && config) {
			createNetworkDiagram();
		}
	});

	function createNetworkDiagram() {
		if (!config?.nodes || !config?.links) return;

		const { nodes, links } = config;
		const svg = svgElement;
		const width = 800;
		const height = 400;

		// Clear SVG
		svg.innerHTML = '';
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

		// Simple force-directed layout simulation
		const nodeMap = new Map();
		
		// Initialize node positions
		nodes.forEach((node, i) => {
			const angle = (i / nodes.length) * 2 * Math.PI;
			const radius = Math.min(width, height) / 4;
			
			nodeMap.set(node.id, {
				...node,
				x: width / 2 + Math.cos(angle) * radius,
				y: height / 2 + Math.sin(angle) * radius,
				vx: 0,
				vy: 0
			});
		});

		// Simulate forces (simplified)
		for (let iteration = 0; iteration < 100; iteration++) {
			// Repulsion between nodes
			nodeMap.forEach((node1, id1) => {
				nodeMap.forEach((node2, id2) => {
					if (id1 !== id2) {
						const dx = node1.x - node2.x;
						const dy = node1.y - node2.y;
						const distance = Math.sqrt(dx * dx + dy * dy) || 1;
						const force = 1000 / (distance * distance);
						
						node1.vx += (dx / distance) * force;
						node1.vy += (dy / distance) * force;
					}
				});
			});

			// Attraction along links
			links.forEach(link => {
				const source = nodeMap.get(link.source);
				const target = nodeMap.get(link.target);
				
				if (source && target) {
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.sqrt(dx * dx + dy * dy) || 1;
					const force = distance * 0.01;
					
					source.vx += (dx / distance) * force;
					source.vy += (dy / distance) * force;
					target.vx -= (dx / distance) * force;
					target.vy -= (dy / distance) * force;
				}
			});

			// Apply velocities and damping
			nodeMap.forEach(node => {
				node.vx *= 0.8; // Damping
				node.vy *= 0.8;
				node.x += node.vx;
				node.y += node.vy;
				
				// Keep nodes in bounds
				node.x = Math.max(30, Math.min(width - 30, node.x));
				node.y = Math.max(30, Math.min(height - 30, node.y));
			});
		}

		// Draw links
		const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		linkGroup.setAttribute('class', 'links');
		
		links.forEach(link => {
			const source = nodeMap.get(link.source);
			const target = nodeMap.get(link.target);
			
			if (source && target) {
				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', String(source.x));
				line.setAttribute('y1', String(source.y));
				line.setAttribute('x2', String(target.x));
				line.setAttribute('y2', String(target.y));
				line.setAttribute('stroke', link.color || '#999');
				line.setAttribute('stroke-width', String(Math.max(1, link.value / 10)));
				line.setAttribute('opacity', '0.6');
				
				// Add hover effects
				line.addEventListener('mouseenter', () => {
					line.setAttribute('opacity', '1');
					line.setAttribute('stroke-width', String(Math.max(2, link.value / 5)));
				});
				
				line.addEventListener('mouseleave', () => {
					line.setAttribute('opacity', '0.6');
					line.setAttribute('stroke-width', String(Math.max(1, link.value / 10)));
				});

				// Add tooltip
				const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				title.textContent = `${source.label} → ${target.label}: ${link.value}`;
				line.appendChild(title);
				
				linkGroup.appendChild(line);
			}
		});
		
		svg.appendChild(linkGroup);

		// Draw nodes
		const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		nodeGroup.setAttribute('class', 'nodes');
		
		nodeMap.forEach(node => {
			const radius = Math.max(5, Math.min(20, Math.sqrt(node.value || 1) * 2));
			
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', String(node.x));
			circle.setAttribute('cy', String(node.y));
			circle.setAttribute('r', String(radius));
			circle.setAttribute('fill', node.color || '#69b3a2');
			circle.setAttribute('stroke', '#fff');
			circle.setAttribute('stroke-width', '2');

			// Add hover effects
			circle.addEventListener('mouseenter', () => {
				circle.setAttribute('r', String(radius * 1.2));
				circle.setAttribute('stroke-width', '3');
			});
			
			circle.addEventListener('mouseleave', () => {
				circle.setAttribute('r', String(radius));
				circle.setAttribute('stroke-width', '2');
			});

			// Add node label
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', String(node.x));
			text.setAttribute('y', String(node.y + radius + 15));
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('font-size', '10');
			text.setAttribute('fill', '#333');
			text.textContent = node.label;

			// Add tooltip
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
			title.textContent = `${node.label}: ${node.value}`;
			circle.appendChild(title);
			
			nodeGroup.appendChild(circle);
			nodeGroup.appendChild(text);
		});
		
		svg.appendChild(nodeGroup);
	}

	$effect(() => {
		if (config && svgElement) {
			createNetworkDiagram();
		}
	});
</script>

<div class={`network-container ${className}`}>
	<svg bind:this={svgElement} class="network-svg"></svg>
</div>

<style>
	.network-container {
		position: relative;
		height: 400px;
		width: 100%;
	}

	.network-svg {
		width: 100%;
		height: 100%;
	}
</style>
