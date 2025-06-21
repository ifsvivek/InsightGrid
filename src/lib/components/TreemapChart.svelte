<script>
	import { onMount } from 'svelte';

	let { config, title = 'Treemap', className = '' } = $props();
	let containerElement;

	onMount(() => {
		if (containerElement && config) {
			createTreemap();
		}
	});

	function createTreemap() {
		if (!config?.data?.datasets?.[0]?.data) return;

		const data = config.data.datasets[0].data;
		const container = containerElement;
		
		// Clear container
		container.innerHTML = '';

		// Simple treemap layout using CSS Grid and Flexbox
		const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
		
		if (totalValue === 0 || data.length === 0) return;
		
		data.forEach((item, index) => {
			const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
			
			const rectElement = document.createElement('div');
			rectElement.className = 'treemap-rect';
			
			// Safely get background color
			let backgroundColor = '#69b3a2'; // Default color
			if (item.color) {
				backgroundColor = item.color;
			} else if (config.data.datasets?.[0]?.backgroundColor) {
				const bgColor = config.data.datasets[0].backgroundColor;
				if (typeof bgColor === 'function') {
					try {
						// Create a mock context for the backgroundColor function
						const mockContext = {
							dataset: config.data.datasets[0],
							dataIndex: index,
							parsed: item
						};
						backgroundColor = bgColor(mockContext) || backgroundColor;
					} catch (error) {
						console.warn('Error getting backgroundColor from function:', error);
						// Use index-based color as fallback
						const colors = ['#69b3a2', '#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
						backgroundColor = colors[index % colors.length];
					}
				} else if (typeof bgColor === 'string') {
					backgroundColor = bgColor;
				} else if (Array.isArray(bgColor) && bgColor[index]) {
					backgroundColor = bgColor[index];
				}
			} else {
				// Use index-based color as fallback
				const colors = ['#69b3a2', '#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
				backgroundColor = colors[index % colors.length];
			}
			
			rectElement.style.backgroundColor = backgroundColor;
			rectElement.style.width = `${Math.sqrt(percentage) * 10}%`;
			rectElement.style.height = `${Math.sqrt(percentage) * 8}%`;
			rectElement.style.minWidth = '60px';
			rectElement.style.minHeight = '40px';
			rectElement.style.maxWidth = '300px';
			rectElement.style.maxHeight = '200px';
			rectElement.style.margin = '2px';
			rectElement.style.padding = '8px';
			rectElement.style.border = '1px solid rgba(0,0,0,0.2)';
			rectElement.style.borderRadius = '4px';
			rectElement.style.display = 'flex';
			rectElement.style.flexDirection = 'column';
			rectElement.style.justifyContent = 'center';
			rectElement.style.alignItems = 'center';
			rectElement.style.textAlign = 'center';
			rectElement.style.cursor = 'pointer';
			rectElement.style.transition = 'all 0.3s ease';
			rectElement.style.overflow = 'hidden';

			// Add label
			const label = document.createElement('div');
			label.className = 'treemap-label';
			label.style.color = '#fff';
			label.style.fontWeight = 'bold';
			label.style.fontSize = Math.max(10, Math.min(16, Math.sqrt(percentage))) + 'px';
			label.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
			label.style.wordBreak = 'break-word';
			label.textContent = item.label || '';

			// Add value
			const value = document.createElement('div');
			value.className = 'treemap-value';
			value.style.color = '#fff';
			value.style.fontSize = Math.max(8, Math.min(12, Math.sqrt(percentage) * 0.8)) + 'px';
			value.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
			value.style.marginTop = '2px';
			value.textContent = item.value?.toLocaleString() || '';

			rectElement.appendChild(label);
			rectElement.appendChild(value);

			// Add hover effects
			rectElement.addEventListener('mouseenter', () => {
				rectElement.style.transform = 'scale(1.05)';
				rectElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
				rectElement.style.zIndex = '10';
			});
			
			rectElement.addEventListener('mouseleave', () => {
				rectElement.style.transform = 'scale(1)';
				rectElement.style.boxShadow = 'none';
				rectElement.style.zIndex = '1';
			});

			// Add tooltip
			rectElement.title = `${item.label}: ${item.value}`;
			
			container.appendChild(rectElement);
		});
	}

	$effect(() => {
		if (config && containerElement) {
			createTreemap();
		}
	});
</script>

<div class={`treemap-container ${className}`}>
	<div bind:this={containerElement} class="treemap"></div>
</div>

<style>
	.treemap-container {
		position: relative;
		height: 400px;
		width: 100%;
		overflow: hidden;
	}

	.treemap {
		height: 100%;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		align-items: flex-start;
		padding: 10px;
		box-sizing: border-box;
	}

	:global(.treemap-rect) {
		position: relative;
	}

	:global(.treemap-label) {
		user-select: none;
	}

	:global(.treemap-value) {
		user-select: none;
	}
</style>
