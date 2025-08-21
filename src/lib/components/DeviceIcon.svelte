<script lang="ts">
	export let deviceType: string | null = null;
	export let className: string = 'h-5 w-5';

	// Reactive statement to get device icon based on device type
	$: deviceIcon = !deviceType
		? 'icon-[heroicons--device-phone-mobile]'
		: deviceType.toLowerCase() === 'mobile'
			? 'icon-[heroicons--device-phone-mobile]'
			: deviceType.toLowerCase() === 'tablet'
				? 'icon-[heroicons--device-tablet]'
				: 'icon-[heroicons--computer-desktop]';
</script>

<span class="{deviceIcon} {className}"></span>
