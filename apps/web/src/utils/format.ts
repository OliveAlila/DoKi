export function formatActionString(action: string | undefined | null): string {
	if (!action) return "";
	return action.replace(/_/g, " ");
}
