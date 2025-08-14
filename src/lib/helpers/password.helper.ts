/**
 * Calculate password strength with detailed information
 * @param password - The password to evaluate
 * @returns Object containing score (0-5), label, and color
 */
export function calculatePasswordStrength(password: string): {
	score: number;
	label: string;
	color: string;
} {
	let score = 0;

	// Check minimum length (6 characters)
	if (password.length >= 6) score++;

	// Check for lowercase letters
	if (/[a-z]/.test(password)) score++;

	// Check for uppercase letters
	if (/[A-Z]/.test(password)) score++;

	// Check for numbers
	if (/\d/.test(password)) score++;

	// Check for special characters
	if (/[^a-zA-Z\d]/.test(password)) score++;

	// Define labels and colors for each strength level
	const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
	const colors = [
		'bg-red-500', // Very Weak
		'bg-orange-500', // Weak
		'bg-yellow-500', // Fair
		'bg-blue-500', // Good
		'bg-green-500', // Strong
		'bg-teal-500' // Very Strong
	];

	return {
		score,
		label: labels[score] || 'Very Weak',
		color: colors[score] || 'bg-red-500'
	};
}
