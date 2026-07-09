import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Layers,
  ShoppingCart,
  CreditCard,
  Briefcase,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Collections', href: '/admin/collections', icon: FolderOpen },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Variants', href: '/admin/variants', icon: Layers },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard }, 
  { name: 'Corporate', href: '/admin/corporate', icon: Briefcase },
  { name: 'Workshop Visits', href: '/admin/visits', icon: CalendarCheck },
  { name: 'Content', href: '/admin/pages', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border z-50 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-serif font-bold text-lg">S</span>
          </div> */}
          <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full" />
          {!collapsed && (
            <div className="overflow-hidden opacity-100 transition-opacity duration-300">
              <h1 className="font-serif font-semibold text-sidebar-foreground text-sm">SAI KAMAKSHI</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative",
                active 
                  ? "bg-sidebar-accent text-sidebar-primary active" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center"
              )}
            >
              {active && (
                <div className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full" />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0", active && "text-sidebar-primary")} />
              {!collapsed && (
                <span className={cn("text-sm font-medium", active && "text-sidebar-primary")}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-2 py-2 mb-2", collapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <span className="text-sidebar-foreground text-sm font-medium">
              {user?.name?.charAt(0) || 'L'}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Lakshmi Devi'}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">super_admin</p>
            </div>
          )}
        </div>
        <button 
          onClick={logout}
          className={cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 py-2 w-full text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center px-0" : "justify-start px-4"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
