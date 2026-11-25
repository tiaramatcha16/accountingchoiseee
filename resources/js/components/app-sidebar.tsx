import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, FileSpreadsheet, LayoutGrid, MessageCircle, ShoppingBag, Store, Users } from 'lucide-react';
import { useEffect } from 'react';
import AppLogo from './app-logo';

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
          ]
        : [
              { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
              { title: 'Jelajahi template', href: '/#template-list', icon: Store },
              { title: 'Pesanan saya', href: '/my-orders', icon: ShoppingBag },
              { title: 'Chat Admin', href: '/chat', icon: MessageCircle },
          ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-black/[0.06] bg-white">
            <SidebarHeader className="border-b border-black/[0.06] bg-white p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-neutral-100 transition-colors rounded-2xl">
                            <Link href={home} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="p-2 bg-white">
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter className="border-t border-black/[0.06] bg-white p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
