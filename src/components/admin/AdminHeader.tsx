 import { useState } from 'react';
 import { useLocation } from 'react-router-dom';
 import { Bell, Search, Menu } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 const pageTitles: Record<string, string> = {
   '/dashboard': 'Dashboard',
   '/collections': 'Collections',
   '/products': 'Products',
   '/variants': 'Product Variants',
   '/orders': 'Orders',
   '/payments': 'Payments',
   '/content': 'Content Management',
   '/settings': 'Settings',
 };
 
 export function AdminHeader() {
   const location = useLocation();
   const [searchOpen, setSearchOpen] = useState(false);
 
   const pageTitle = pageTitles[location.pathname] || 'Admin';
 
   return (
     <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-serif font-semibold text-foreground">{pageTitle}</h1>
           <p className="text-sm text-muted-foreground">
             {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
         </div>
 
         <div className="flex items-center gap-3">
           {/* Search */}
           <div className="hidden md:flex items-center">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search orders, products..."
                 className="w-64 pl-10 h-9 bg-card border-border"
               />
             </div>
           </div>
 
           {/* Notifications */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="relative">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-80">
               <div className="p-4 border-b border-border">
                 <h3 className="font-semibold">Notifications</h3>
               </div>
               <DropdownMenuItem className="p-4 cursor-pointer">
                 <div>
                   <p className="text-sm font-medium">New order received</p>
                   <p className="text-xs text-muted-foreground">SWW-2025-0156 • 2 min ago</p>
                 </div>
               </DropdownMenuItem>
               <DropdownMenuItem className="p-4 cursor-pointer">
                 <div>
                   <p className="text-sm font-medium">Payment confirmed</p>
                   <p className="text-xs text-muted-foreground">₹6,195 via UPI • 5 min ago</p>
                 </div>
               </DropdownMenuItem>
               <DropdownMenuItem className="p-4 cursor-pointer">
                 <div>
                   <p className="text-sm font-medium">Low stock alert</p>
                   <p className="text-xs text-muted-foreground">Temple Jhumkas (2.4 size) • 1 hr ago</p>
                 </div>
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
     </header>
   );
 }