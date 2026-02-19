 import { NavLink, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import {
   LayoutDashboard,
   FolderOpen,
   Package,
   Layers,
   ShoppingCart,
   CreditCard,
   FileText,
   Settings,
   LogOut,
   ChevronLeft,
   ChevronRight,
 } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { Dispatch, SetStateAction, useState } from 'react';
 
 const navItems = [
   { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
   { name: 'Collections', icon: FolderOpen, path: '/collections' },
   { name: 'Products', icon: Package, path: '/products' },
   { name: 'Variants', icon: Layers, path: '/variants' },
   { name: 'Orders', icon: ShoppingCart, path: '/orders' },
   { name: 'Payments', icon: CreditCard, path: '/payments' },
   { name: 'Content', icon: FileText, path: '/content' },
   { name: 'Settings', icon: Settings, path: '/settings' },
 ];
 
 export function AdminSidebar({isCollapsed, setIsCollapsed}:{isCollapsed:boolean,setIsCollapsed:Dispatch<React.SetStateAction<boolean>>}) {
   const { user, logout } = useAuth();
   const location = useLocation();
 
   return (
     <motion.aside
       initial={false}
       animate={{ width: isCollapsed ? 72 : 260 }}
       transition={{ duration: 0.3, ease: 'easeInOut' }}
       className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border z-50"
     >
       {/* Logo */}
       <div className="p-4 border-b border-sidebar-border">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
             <span className="text-primary-foreground font-serif font-bold text-lg">S</span>
           </div>
           {!isCollapsed && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="overflow-hidden"
             >
               <h1 className="font-serif font-semibold text-sidebar-foreground text-sm">Snigdha</h1>
               <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
             </motion.div>
           )}
         </div>
       </div>
 
       {/* Navigation */}
       <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <NavLink
               key={item.path}
               to={item.path}
               className={cn(
                 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative',
                 isCollapsed && "justify-center",
                 isActive
                   ? 'bg-sidebar-accent text-sidebar-primary'
                   : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
               )}
             >
               {isActive && (
                 <motion.div
                   layoutId="activeIndicator"
                   className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full"
                 />
               )}
               <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
               {!isCollapsed && (
                 <span className={cn('text-sm font-medium', isActive && 'text-sidebar-primary')}>
                   {item.name}
                 </span>
               )}
             </NavLink>
           );
         })}
       </nav>
 
       {/* User section */}
       <div className="p-3 border-t border-sidebar-border">
         {!isCollapsed && user && (
           <div className="flex items-center gap-3 px-2 py-2 mb-2">
             <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
               <span className="text-sidebar-foreground text-sm font-medium">
                 {user.name.charAt(0)}
               </span>
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
               <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
             </div>
           </div>
         )}
         
         <Button
           variant="ghost"
           onClick={logout}
           className={cn(
             'w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10',
             isCollapsed && 'px-3'
           )}
         >
           <LogOut className="h-5 w-5 shrink-0" />
           {!isCollapsed && <span className="ml-3">Logout</span>}
         </Button>
       </div>
 
       {/* Collapse toggle */}
       <button
         onClick={() => setIsCollapsed(!isCollapsed)}
         className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
       >
         {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
       </button>
     </motion.aside>
   );
 }