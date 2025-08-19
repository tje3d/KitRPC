import { debounceTime, Subject } from 'rxjs';
import { subscribe } from './svelte-rxjs.helper';
import { SvelteSubject } from './rxjs.helper';

export interface FilterOption {
	value: string;
	label: string;
	icon?: string;
	colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface FilterGroup {
	label: string;
	options: FilterOption[];
	selected: Record<string, boolean>;
	multiSelect: boolean;
}

export interface InputField {
	id: string;
	name: string;
	type: string;
	placeholder: string;
	value: string;
	colSpan?: number;
}

export interface FilterState {
	filterGroups: FilterGroup[];
	inputFields: InputField[];
	startDate: string;
	endDate: string;
	currentPage: number;
}

export interface FilterConfig<T = any> {
	filterGroups: FilterGroup[];
	inputFields?: InputField[];
	onApply: (filters: T, page: number) => void;
	buildFilters: (state: FilterState) => T;
	debounceMs?: number;
}

export class FilterManager<T = any> {
	private filterTimeout = new Subject<void>();
	private state: FilterState;
	private config: FilterConfig<T>;
	public stateStore: SvelteSubject<FilterState>;

	constructor(config: FilterConfig<T>) {
		this.config = config;
		this.state = {
			filterGroups: config.filterGroups,
			inputFields: config.inputFields || [],
			startDate: '',
			endDate: '',
			currentPage: 1
		};

		// Create reactive store
		this.stateStore = new SvelteSubject(this.state);

		// Setup debounced filter application
		subscribe(this.filterTimeout.pipe(debounceTime(config.debounceMs || 100)), () => {
			this.applyFilters();
		});
	}

	getState(): FilterState {
		return { ...this.state };
	}

	setCurrentPage(page: number): void {
		this.state.currentPage = page;
		this.stateStore.set({ ...this.state });
	}

	private applyFilters(): void {
		this.state.currentPage = 1;
		this.stateStore.set({ ...this.state });
		const filters = this.config.buildFilters(this.state);
		this.config.onApply(filters, this.state.currentPage);
	}

	handleFilterChange(event: CustomEvent): void {
		const {
			filterGroups,
			inputFields,
			startDate,
			endDate
		} = event.detail;

		this.state.filterGroups = filterGroups;
		this.state.inputFields = inputFields || [];
		this.state.startDate = startDate;
		this.state.endDate = endDate;

		this.stateStore.set({ ...this.state });
		this.filterTimeout.next();
	}

	handleFilterReset(): void {
		this.state.filterGroups = this.state.filterGroups.map((group) => ({
			...group,
			selected: {}
		}));
		this.state.inputFields = this.state.inputFields.map((field) => ({
			...field,
			value: ''
		}));
		this.state.startDate = '';
		this.state.endDate = '';
		this.state.currentPage = 1;

		this.stateStore.set({ ...this.state });
		const filters = this.config.buildFilters(this.state);
		this.config.onApply(filters, this.state.currentPage);
	}

	handleFilterApply(): void {
		this.applyFilters();
	}

	handlePageChange(page: number): void {
		this.state.currentPage = page;
		this.stateStore.set({ ...this.state });
		const filters = this.config.buildFilters(this.state);
		this.config.onApply(filters, this.state.currentPage);
	}
}

// Utility functions for common filter operations
export function getSelectedValue(filterGroups: FilterGroup[], groupLabel: string): string | undefined {
	const group = filterGroups.find((g) => g.label === groupLabel);
	if (!group) return undefined;
	return Object.keys(group.selected).find((key) => group.selected[key]);
}

export function getInputValue(inputFields: InputField[], fieldId: string): string {
	const field = inputFields.find((f) => f.id === fieldId);
	return field?.value || '';
}

export function createDateFilter(dateString: string, isEndDate = false): Date | undefined {
	if (!dateString) return undefined;
	const date = new Date(dateString);
	if (isEndDate) {
		date.setHours(23, 59, 59, 999);
	} else {
		date.setHours(0, 0, 0, 0);
	}
	return date;
}