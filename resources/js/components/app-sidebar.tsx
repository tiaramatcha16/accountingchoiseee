import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileSpreadsheet, Folder, LayoutGrid, ShoppingBag, Store, Users, UserRoundCheck } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits', icon: BookOpen },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { user: { role?: string } | null } };
    const role = auth.user?.role ?? 'buyer';
    const mainNavItems: NavItem[] = role === 'admin'
        ? [
            { title: 'Ringkasan admin', href: '/admin', icon: LayoutGrid },
            { title: 'Template Excel', href: '/admin/products', icon: FileSpreadsheet },
            { title: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
            { title: 'Pengguna', href: '/admin/users', icon: Users },
            { title: 'Pengajuan penjual', href: '/admin/seller-applications', icon: UserRoundCheck },
            { title: 'Lihat katalog', href: '/templates', icon: Store },
        ]
        : role === 'seller'
            ? [
                { title: 'Template saya', href: '/seller/products', icon: FileSpreadsheet },
                { title: 'Katalog', href: '/templates', icon: Store },
                { title: 'Pesanan pembeli', href: '/my-orders', icon: ShoppingBag },
            ]
            : [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Jelajahi template', href: '/templates', icon: Store },
                { title: 'Pesanan saya', href: '/my-orders', icon: ShoppingBag },
                { title: 'Jadi penjual', href: '/become-a-seller', icon: FileSpreadsheet },
            ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={role === 'admin' ? '/admin' : role === 'seller' ? '/seller/products' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent><NavMain items={mainNavItems} /></SidebarContent>
            <SidebarFooter><NavFooter items={footerNavItems} className="mt-auto" /><NavUser /></SidebarFooter>
        </Sidebar>
    );
}
