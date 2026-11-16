import { type NavGroup } from '@/types';
import { FileSpreadsheet, LayoutGrid, ShoppingBag, Users } from 'lucide-react';
export const adminNavGroups: NavGroup[] = [
    {
        title: 'Marketplace admin',
        items: [
            { title: 'Ringkasan', href: '/admin', icon: LayoutGrid },
            { title: 'Template Excel', href: '/admin/products', icon: FileSpreadsheet },
            { title: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
            { title: 'Pengguna', href: '/admin/users', icon: Users },
        ],
    },
];
