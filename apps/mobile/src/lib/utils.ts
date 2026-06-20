import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes and merges conflicting utilities.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
