import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

export default function HoverBorderGradientDemo() {
    return (
        <div className="flex justify-center text-center">
            <HoverBorderGradient containerClassName="rounded-full" className="bg-brand-primary text-white" type="button">
                <span>Hover untuk melihat efek</span>
            </HoverBorderGradient>
        </div>
    );
}
