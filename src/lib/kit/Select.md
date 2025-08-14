# Select Component

A modern, reusable select component with search, filtering, and multi-select capabilities.

## Usage

```svelte
<script>
	import Select from '$lib/kit/Select.svelte';

	let value = '';
	let multipleValue = [];

	const options = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' }
	];

	function handleChange(newValue) {
		console.log('Selected value:', newValue);
	}
</script>

<!-- Single select -->
<Select
	id="my-select"
	name="my-select"
	{value}
	{options}
	placeholder="Select an option"
	on:change={handleChange}
/>

<!-- Multi select -->
<Select
	id="my-multi-select"
	name="my-multi-select"
	value={multipleValue}
	{options}
	placeholder="Select options"
	multiple
	on:change={handleChange}
/>
```

## Props

| Prop           | Type                         | Default              | Description                                       |
| -------------- | ---------------------------- | -------------------- | ------------------------------------------------- |
| `id`           | `string`                     | `undefined`          | Select ID (required)                              |
| `name`         | `string`                     | `undefined`          | Select name (required)                            |
| `value`        | `string` or `string[]`       | `''`                 | Selected value(s)                                 |
| `options`      | `Array<{value, label}>`      | `[]`                 | Options for the select                            |
| `placeholder`  | `string`                     | `'Select an option'` | Placeholder text                                  |
| `multiple`     | `boolean`                    | `false`              | Whether multiple selection is allowed             |
| `disabled`     | `boolean`                    | `false`              | Whether the select is disabled                    |
| `error`        | `boolean`                    | `false`              | Whether the select is in error state              |
| `errorMessage` | `string`                     | `''`                 | Error message to display                          |
| `label`        | `string`                     | `''`                 | Label for the select                              |
| `className`    | `string`                     | `''`                 | Additional CSS classes                            |
| `variant`      | `'primary'` or `'secondary'` | `'primary'`          | Select variant                                    |
| `onChange`     | `Function`                   | `() => {}`           | Change event handler (receives selected value(s)) |

## Features

- Modern custom select design with smooth transitions
- Support for both single and multiple selection
- Search functionality for filtering options
- Customizable variants for different styling needs
- Proper error state handling with error messages
- Label support for better accessibility
- Integration with FormGroup for consistent form styling
- Uses consistent styling with other kit components
- Supports additional CSS classes via `className` prop
- Smooth animations for state changes
- Responsive design that works on all screen sizes
