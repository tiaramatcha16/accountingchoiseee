import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Calculator,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    Globe,
    HelpCircle,
    Layers,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    Sheet,
    Star,
    Store,
    Wallet,
    X,
    Zap,
    type LucideIcon,
} from 'lucide-react';

export type IconName =
    | 'arrow-right'
    | 'arrow-up-right'
    | 'calculator'
    | 'check'
    | 'check-circle-2'
    | 'chevron-down'
    | 'globe'
    | 'help-circle'
    | 'instagram'
    | 'layers'
    | 'linkedin'
    | 'map-pin'
    | 'message-circle'
    | 'phone'
    | 'search'
    | 'sheet'
    | 'star'
    | 'store'
    | 'wallet'
    | 'x'
    | 'zap';

const icons: Record<IconName, LucideIcon> = {
    'arrow-right': ArrowRight,
    'arrow-up-right': ArrowUpRight,
    calculator: Calculator,
    check: Check,
    'check-circle-2': CheckCircle2,
    'chevron-down': ChevronDown,
    globe: Globe,
    'help-circle': HelpCircle,
    instagram: Camera,
    layers: Layers,
    linkedin: BriefcaseBusiness,
    'map-pin': MapPin,
    'message-circle': MessageCircle,
    phone: Phone,
    search: Search,
    sheet: Sheet,
    star: Star,
    store: Store,
    wallet: Wallet,
    x: X,
    zap: Zap,
};

interface IconProps {
    name: IconName;
    className?: string;
}

export function Icon({ name, className }: IconProps) {
    const IconComponent = icons[name];

    return <IconComponent aria-hidden="true" className={className} />;
}
