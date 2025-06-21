<script>
	import { onMount } from 'svelte';

	let { config, title = 'Pictogram Chart', className = '' } = $props();
	let containerElement;

	$effect(() => {
		if (containerElement && config?.data) {
			// The component will re-render automatically when config changes
		}
	});

	function getIconForCategory(category) {
		// Simple icon mapping - in a real app, you might use icon libraries
		const iconMap = {
			'people': '👤',
			'users': '👤', 
			'person': '👤',
			'population': '👤',
			'cars': '🚗',
			'vehicles': '🚗',
			'houses': '🏠',
			'homes': '🏠',
			'buildings': '🏢',
			'money': '💰',
			'dollar': '💰',
			'sales': '💰',
			'revenue': '💰',
			'books': '📚',
			'education': '📚',
			'students': '👨‍🎓',
			'graduates': '👨‍🎓',
			'default': '■'
		};

		const lowerCategory = category.toLowerCase();
		for (const [key, icon] of Object.entries(iconMap)) {
			if (lowerCategory.includes(key)) {
				return icon;
			}
		}
		return iconMap.default;
	}
</script>

<div class={`pictogram-container ${className}`} bind:this={containerElement}>
	{#if config?.options?.plugins?.title?.text}
		<h3 class="chart-title">{config.options.plugins.title.text}</h3>
	{/if}
	
	{#if config?.data}
		<div class="pictogram-grid">
			{#each config.data as item}
				<div class="pictogram-item">
					<div class="pictogram-label">{item.label}</div>
					<div class="pictogram-icons">
						{#each Array(item.fullIcons) as _, i}
							<span 
								class="icon full-icon" 
								style="color: {item.color}"
								title="{item.label}: {item.value} (Full icon #{i + 1})"
							>
								{getIconForCategory(item.label)}
							</span>
						{/each}
						{#if item.partialIcon > 0}
							<span 
								class="icon partial-icon" 
								style="color: {item.color}; opacity: {item.partialIcon}"
								title="{item.label}: {item.value} (Partial icon: {(item.partialIcon * 100).toFixed(0)}%)"
							>
								{getIconForCategory(item.label)}
							</span>
						{/if}
					</div>
					<div class="pictogram-value">
						{item.value} 
						<span class="icon-count">({item.iconCount} icons)</span>
					</div>
				</div>
			{/each}
		</div>
		
		{#if config?.iconValue}
			<div class="legend">
				<span class="legend-icon">{getIconForCategory('default')}</span>
				= {config.iconValue} unit{config.iconValue !== 1 ? 's' : ''}
			</div>
		{/if}
	{:else}
		<div class="no-data">No data available for pictogram chart</div>
	{/if}
</div>

<style>
	.pictogram-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 300px;
		padding: 20px;
	}

	.chart-title {
		margin: 0 0 2rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
		color: #333;
	}

	.pictogram-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 800px;
	}

	.pictogram-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background: #fafafa;
	}

	.pictogram-label {
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 1rem;
		color: #333;
		text-align: center;
	}

	.pictogram-icons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
		margin-bottom: 1rem;
		max-width: 100%;
	}

	.icon {
		font-size: 1.5rem;
		transition: transform 0.2s ease;
		cursor: pointer;
	}

	.icon:hover {
		transform: scale(1.2);
	}

	.full-icon {
		opacity: 1;
	}

	.partial-icon {
		position: relative;
	}

	.pictogram-value {
		font-size: 0.9rem;
		color: #666;
		text-align: center;
	}

	.icon-count {
		font-size: 0.8rem;
		color: #999;
	}

	.legend {
		margin-top: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #666;
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: #f9f9f9;
	}

	.legend-icon {
		font-size: 1.2rem;
	}

	.no-data {
		color: #999;
		font-style: italic;
		padding: 2rem;
		text-align: center;
	}

	@media (max-width: 600px) {
		.pictogram-grid {
			grid-template-columns: 1fr;
		}
		
		.icon {
			font-size: 1.2rem;
		}
	}
</style>
