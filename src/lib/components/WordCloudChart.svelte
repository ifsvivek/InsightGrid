<script>
	import { onMount } from 'svelte';

	let { config, title = 'Word Cloud', className = '' } = $props();
	let containerElement;

	onMount(() => {
		if (containerElement && config) {
			createWordCloud();
		}
	});

	function createWordCloud() {
		if (!config?.data?.words) return;

		const words = config.data.words;
		const container = containerElement;
		
		// Clear container
		container.innerHTML = '';

		// Create word cloud using CSS and positioning
		const maxSize = Math.max(...words.map(w => w.size));
		const minSize = Math.min(...words.map(w => w.size));

		words.forEach((word, index) => {
			const wordElement = document.createElement('span');
			wordElement.textContent = word.text;
			wordElement.style.fontSize = `${word.size}px`;
			wordElement.style.color = word.color;
			wordElement.style.fontWeight = 'bold';
			wordElement.style.margin = '5px';
			wordElement.style.display = 'inline-block';
			wordElement.style.cursor = 'pointer';
			wordElement.style.transition = 'all 0.3s ease';
			
			// Add hover effects
			wordElement.addEventListener('mouseenter', () => {
				wordElement.style.opacity = '0.7';
				wordElement.style.transform = 'scale(1.1)';
			});
			
			wordElement.addEventListener('mouseleave', () => {
				wordElement.style.opacity = '1';
				wordElement.style.transform = 'scale(1)';
			});

			// Add click tooltip
			wordElement.title = `${word.text}: ${word.value}`;
			
			container.appendChild(wordElement);
		});
	}

	$effect(() => {
		if (config && containerElement) {
			createWordCloud();
		}
	});
</script>

<div class={`word-cloud-container ${className}`}>
	<div bind:this={containerElement} class="word-cloud"></div>
</div>

<style>
	.word-cloud-container {
		position: relative;
		height: 400px;
		width: 100%;
		overflow: hidden;
	}

	.word-cloud {
		height: 100%;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 20px;
		box-sizing: border-box;
	}
</style>
