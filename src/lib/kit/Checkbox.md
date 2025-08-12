# Checkbox Component

A modern, reusable checkbox component with label and proper accessibility.

## Usage

```svelte
<script>
	import Checkbox from '$lib/kit/Checkbox.svelte';

	let checked = false;

	function handleChange() {
		console.log('Checkbox state:', checked);
	}
</script>

<Checkbox
	id="my-checkbox"
	name="my-checkbox"
	{checked}
	label="Remember me"
	on:change={handleChange}
/>
```

## Props

| Prop        | Type       | Default     | Description                     |
| ----------- | ---------- | ----------- | ------------------------------- |
| `id`        | `string`   | `undefined` | Checkbox ID (required)          |
| `name`      | `string`   | `undefined` | Checkbox name (required)        |
| `checked`   | `boolean`  | `false`     | Whether the checkbox is checked |
| `label`     | `string`   | `''`        | Label text                      |
| `className` | `string`   | `''`        | Additional CSS classes          |
| `onChange`  | `Function` | `() => {}`  | Change event handler            |

## Features

- Modern custom checkbox design with smooth transitions
- Properly binds the checked state
- Accessible label association
- Hover and focus states with visual feedback
- Uses consistent styling with other kit components
- Supports additional CSS classes via `className` prop
- Smooth animations for state changes
