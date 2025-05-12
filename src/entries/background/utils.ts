export function isUrl(text: string | undefined): boolean {
	if (!text) {
		return false;
	}

	const urlRegex =
		/^(https?:\/\/)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.%]+)?$/i;

	return urlRegex.test(text);
}

export function prependScheme(url: string): string {
	if (!url.startsWith("http")) {
		return "https://" + url;
	} else {
		return url;
	}
}
