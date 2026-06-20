import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

// className is registered via nativewind-setup.ts (cssInterop called globally in App.tsx)
export interface ProgressProps
	extends React.ComponentPropsWithoutRef<typeof View> {
	value?: number; // 0 to 100
	className?: string;
}

export const Progress = React.forwardRef<
	React.ElementRef<typeof View>,
	ProgressProps
>(({ className, value = 0, ...props }, ref) => {
	const clampedValue = Math.min(Math.max(value, 0), 100);

	return (
		<View
			ref={ref}
			accessibilityRole="progressbar"
			accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
			className={cn(
				"relative h-3 w-full overflow-hidden rounded-full bg-muted border border-border/10",
				className,
			)}
			{...props}
		>
			<View
				className="h-full bg-accent rounded-full"
				style={{ width: `${clampedValue}%` }}
			/>
		</View>
	);
});
Progress.displayName = "Progress";
