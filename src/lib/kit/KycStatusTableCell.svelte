<script lang="ts">
	import KycStatusIndicator from './KycStatusIndicator.svelte';
	import type { KycStatus } from '@prisma/client';

	// Props received from DataTable
	export let value: any;
	export let row: any;
	export let column: any;

	// Extract status from row data
	$: status = row.status as KycStatus | undefined;
</script>

<KycStatusIndicator {status} size="sm" />
