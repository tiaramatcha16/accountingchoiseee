import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, BookOpen, FileSpreadsheet, Folder, LayoutGrid, MessageCircle, ShoppingBag, Store, Users } from 'lucide-react';
import { useEffect } from 'react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits', icon: BookOpen },
];

export function AppSidebar() {
    const { auth, adminChatNeedsReplyCount = 0 } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    useEffect(() => {
        if (!isAdmin) return;

        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['adminChatNeedsReplyCount'] });
            }
        }, 10000);

        return () => window.clearInterval(timer);
    }, [isAdmin]);

    const home = isAdmin ? '/admin' : '/dashboard';
    const mainNavItems: NavItem[] = isAdmin
        ? [
              { title: 'Dashboard admin', href: '/admin', icon: LayoutGrid },
              { title: 'Analitik penjualan', href: '/admin/analytics', icon: BarChart3 },
              { title: 'Template Excel', href: '/admin/products', icon: FileSpreadsheet },
              { title: 'Pesanan pembeli', href: '/admin/orders', icon: ShoppingBag },
              {
                  title: adminChatNeedsReplyCount > 0 ? `Chat pembeli (${adminChatNeedsReplyCount})` : 'Chat pembeli',
                  href: '/admin/chats',
                  icon: MessageCircle,
              },
              { title: 'Pengguna', href: '/admin/users', icon: Users },
              { title: 'Lihat katalog', href: '/templates', icon: Store },
          ]
        : [
              { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
              { title: 'Jelajahi template', href: '/#template-list', icon: Store },
              { title: 'Pesanan saya', href: '/my-orders', icon: ShoppingBag },
              { title: 'Chat Admin', href: '/chat', icon: MessageCircle },
          ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={home} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
