import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'btn-primary flex items-center justify-center disabled:opacity-70',
                    variant === 'secondary' && 'bg-secondary text-black hover:bg-gray-300',
                    variant === 'ghost' && 'bg-transparent text-text hover:bg-gray-100',
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
