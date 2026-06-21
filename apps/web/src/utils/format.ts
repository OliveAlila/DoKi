export function formatActionString(action: string | undefined | null): string {
	if (!action) return "";
	return action.replace(/_/g, " ");
}

export function toPascalCaseWithSpace(str: string | undefined | null): string {
	if (!str) return "";
	return str
		.replace(/_/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}
