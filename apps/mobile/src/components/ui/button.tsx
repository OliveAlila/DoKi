import * as React from 'react';
import { Pressable } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

// className is registered via nativewind-setup.ts (cssInterop called globally in App.tsx)
export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const variantClasses = {
    default: 'bg-primary active:opacity-80',
    outline: 'border border-border bg-transparent active:bg-muted/20',
    secondary: 'bg-secondary active:opacity-80',
    destructive: 'bg-destructive active:opacity-80',
    ghost: 'bg-transparent active:bg-muted/20',
  };

  const textClasses = {
    default: 'text-primary-foreground font-semibold',
    outline: 'text-foreground font-semibold',
    secondary: 'text-secondary-foreground font-semibold',
    destructive: 'text-destructive-foreground font-semibold',
    ghost: 'text-foreground font-semibold',
  };

  const sizeClasses = {
    default: 'h-12 px-6 rounded-lg justify-center items-center',
    sm: 'h-10 px-4 rounded-md justify-center items-center',
    lg: 'h-14 px-8 rounded-xl justify-center items-center',
    icon: 'h-12 w-12 rounded-lg justify-center items-center',
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={props.disabled ? { disabled: true } : undefined}
      className={cn(
        'flex flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        props.disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={textClasses[variant]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
});
Button.displayName = 'Button';
