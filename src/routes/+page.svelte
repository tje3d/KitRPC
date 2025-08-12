<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/flow/auth.flow';

	$: if (!$isLoggedIn && browser) {
		goto('/login');
	} else if ($isLoggedIn && browser) {
		goto('/panel');
	}
</script>
