import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

// className is registered via nativewind-setup.ts (cssInterop called globally in App.tsx)
export const Card = React.forwardRef<
	React.ElementRef<typeof View>,
	React.ComponentPropsWithoutRef<typeof View> & { className?: string }
>(({ className, ...props }, ref) => (
	<View
		ref={ref}
		className={cn(
			"rounded-2xl border border-border bg-card p-5 shadow-md",
			className,
		)}
		{...props}
	/>
));
Card.displayName = "Card";
