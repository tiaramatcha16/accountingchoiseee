import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT';

type HoverBorderGradientProps = React.PropsWithChildren<
    React.HTMLAttributes<HTMLElement> & {
        as?: React.ElementType;
        containerClassName?: string;
        duration?: number;
        clockwise?: boolean;
        disabled?: boolean;
        type?: 'button' | 'submit' | 'reset';
    }
>;

const directions: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];

const movingMap: Record<Direction, string> = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, #d4af37 0%, transparent 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, #168354 0%, transparent 100%)',
    BOTTOM: 'radial-gradient(20.7% 50% at 50% 100%, #d4af37 0%, transparent 100%)',
    RIGHT: 'radial-gradient(16.2% 41.2% at 100% 50%, #168354 0%, transparent 100%)',
};

const highlight = 'radial-gradient(75% 181.16% at 50% 50%, #168354 0%, transparent 100%)';

export function HoverBorderGradient({
    as: Tag = 'button',
    children,
    className,
    containerClassName,
    duration = 1,
    clockwise = true,
    onMouseEnter,
    onMouseLeave,
    ...props
}: HoverBorderGradientProps) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState<Direction>('TOP');

    useEffect(() => {
        if (hovered) {
            return;
        }

        const interval = window.setInterval(() => {
            setDirection((current) => {
                const currentIndex = directions.indexOf(current);
                const nextIndex = clockwise
                    ? (currentIndex - 1 + directions.length) % directions.length
                    : (currentIndex + 1) % directions.length;

                return directions[nextIndex];
            });
        }, duration * 1000);

        return () => window.clearInterval(interval);
    }, [clockwise, duration, hovered]);

    return (
        <Tag
            {...props}
            className={cn(
                'relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full border border-transparent p-px transition-colors duration-500',
                containerClassName,
            )}
            onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
                setHovered(true);
                onMouseEnter?.(event);
            }}
            onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
                setHovered(false);
                onMouseLeave?.(event);
            }}
        >
            <div className={cn('relative z-10 flex items-center justify-center gap-2 rounded-[inherit] px-4 py-2', className)}>
                {children}
            </div>
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
                initial={{ background: movingMap[direction] }}
                animate={{ background: hovered ? [movingMap[direction], highlight] : movingMap[direction] }}
                transition={{ ease: 'linear', duration }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-[1] rounded-[inherit] bg-auth-panel" />
        </Tag>
    );
}
