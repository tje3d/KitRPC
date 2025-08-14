# Checkbox Component

A modern, reusable checkbox component with label, indeterminate state support, and proper accessibility.

## Usage

```svelte
<script>
	import Checkbox from '$lib/kit/Checkbox.svelte';

	let checked = false;
	let indeterminate = false;

	function handleChange(checked) {
		console.log('Checkbox state:', checked);
	}
</script>

<Checkbox
	id="my-checkbox"
	name="my-checkbox"
	{checked}
	{indeterminate}
	label="Remember me"
	on:change={handleChange}
/>
```

## Props

| Prop            | Type       | Default     | Description                                   |
| --------------- | ---------- | ----------- | --------------------------------------------- |
| `id`            | `string`   | `undefined` | Checkbox ID (required)                        |
| `name`          | `string`   | `undefined` | Checkbox name (required)                      |
| `checked`       | `boolean`  | `false`     | Whether the checkbox is checked               |
| `indeterminate` | `boolean`  | `false`     | Whether the checkbox is indeterminate         |
| `label`         | `string`   | `''`        | Label text                                    |
| `className`     | `string`   | `''`        | Additional CSS classes                        |
| `disabled`      | `boolean`  | `false`     | Whether the checkbox is disabled              |
| `error`         | `boolean`  | `false`     | Whether the checkbox is in error state        |
| `onChange`      | `Function` | `() => {}`  | Change event handler (receives checked state) |

## Features

- Modern custom checkbox design with smooth transitions
- Properly binds the checked state
- Indeterminate state support for better UX in data tables
- Accessible label association
- Hover and focus states with visual feedback
- Disabled and error states
- Uses consistent styling with other kit components
- Supports additional CSS classes via `className` prop
- Smooth animations for state changes
