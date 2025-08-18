import { base } from '$app/paths';

/**
 * Generic file upload function using XMLHttpRequest
 * @param formData - The FormData object containing the file to upload
 * @param endpoint - The API endpoint to upload to
 * @param withCredentials - Whether to include credentials (default: false)
 * @returns Promise resolving to the parsed response data
 */
export async function uploadFileWithXhr<T>(
	formData: FormData,
	endpoint: string,
	withCredentials: boolean = false
): Promise<T> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open('POST', base + endpoint, true);

		// Set headers
		xhr.setRequestHeader('x-sveltekit-invalidated', '0');
		if (withCredentials) {
			xhr.withCredentials = true;
		}

		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const response = JSON.parse(xhr.responseText);
					resolve(response.result.data);
				} catch (e) {
					reject(new Error('پردازش پاسخ ناموفق بود'));
				}
			} else {
				try {
					const errorResponse = JSON.parse(xhr.responseText);
					reject(new Error(errorResponse.error?.message || 'Upload failed'));
				} catch (e) {
					reject(new Error('Upload failed'));
				}
			}
		};

		xhr.onerror = function () {
			reject(new Error('Network error'));
		};

		xhr.send(formData);
	});
}
