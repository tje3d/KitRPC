<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type Session = RouterOutputs['sessions']['getSessions'][number];

	// Props
	export let onSuccess: ((data: Session[]) => void) | undefined = undefined;
	export let onDeleteSuccess: ((data: { success: boolean }) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined;
	export let onDeleteError: ((error: string) => void) | undefined;

	// Request for fetching all sessions
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).sessions.getSessions.query();
		})
	);

	const sessions = responseSuccess.pipe(
		map((r) =>
			r?.map((session) => ({
				...session,
				createdAt: new Date(session.createdAt),
				expiresAt: new Date(session.expiresAt),
				updatedAt: new Date(session.updatedAt)
			}))
		),
		shareIt()
	);

	const currentSession = sessions.pipe(
		map((r) => r?.find((i) => i.isCurrent)),
		shareIt()
	);

	// Request for deleting a session
	const {
		clearError: clearDeleteError,
		errorMessage: deleteErrorMessage,
		loading: deleteLoading,
		trigger: deleteTrigger,
		responseSuccess: deleteResponseSuccess
	} = useTrpcRequest(
		createTrpcRequestFn((id: string) => {
			return trpc(page).sessions.deleteSession.mutate({ id });
		})
	);

	// Actions
	export function getSessions() {
		trigger.next(undefined);
	}

	export function deleteSession(id: string) {
		deleteTrigger.next(id);
	}

	subscribe(responseSuccess, (r) => {
		if (!r) return;

		onSuccess?.(r);
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});

	subscribe(deleteResponseSuccess, (result) => {
		if (!result) return;
		onDeleteSuccess?.(result);
	});

	subscribe(deleteErrorMessage, (message) => {
		if (!message) return;
		onDeleteError?.(message);
	});
</script>

<slot
	sessions={$sessions}
	loading={$loading}
	errorMessage={$errorMessage}
	deleteLoading={$deleteLoading}
	deleteErrorMessage={$deleteErrorMessage}
	{clearError}
	{clearDeleteError}
	{getSessions}
	{deleteSession}
	currentSession={$currentSession}
/>
