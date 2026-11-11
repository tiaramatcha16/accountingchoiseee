import { LayoutGrid, FileSpreadsheet, ShoppingBag, Users, UserRoundCheck } from 'lucide-react';
import { type NavGroup } from '@/types';
export const adminNavGroups: NavGroup[] = [{ title: 'Marketplace admin', items: [
    { title: 'Ringkasan', href: '/admin', icon: LayoutGrid },
    { title: 'Template Excel', href: '/admin/products', icon: FileSpreadsheet },
    { title: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { title: 'Pengguna', href: '/admin/users', icon: Users },
    { title: 'Pengajuan penjual', href: '/admin/seller-applications', icon: UserRoundCheck },
] }];
