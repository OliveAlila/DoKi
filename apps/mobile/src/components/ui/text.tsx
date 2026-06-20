import * as React from "react";
import { Text as RNText } from "react-native";
import { cn } from "@/lib/utils";

// className is registered via nativewind-setup.ts (cssInterop called globally in App.tsx)
export const Text = React.forwardRef<
	React.ElementRef<typeof RNText>,
	React.ComponentPropsWithoutRef<typeof RNText> & {
		variant?:
			| "default"
			| "h1"
			| "h2"
			| "h3"
			| "h4"
			| "lead"
			| "large"
			| "small"
			| "muted";
		className?: string;
	}
>(({ className, variant = "default", ...props }, ref) => {
	const variantClasses = {
		default: "text-base text-foreground",
		h1: "text-3xl font-extrabold tracking-tight text-foreground",
		h2: "text-2xl font-semibold tracking-tight text-foreground",
		h3: "text-xl font-semibold tracking-tight text-foreground",
		h4: "text-lg font-semibold tracking-tight text-foreground",
		lead: "text-xl text-muted-foreground",
		large: "text-lg font-semibold text-foreground",
		small: "text-sm font-medium leading-none text-foreground",
		muted: "text-sm text-muted-foreground",
	};

	return (
		<RNText
			ref={ref}
			className={cn(variantClasses[variant], className)}
			{...props}
		/>
	);
});
Text.displayName = "Text";
