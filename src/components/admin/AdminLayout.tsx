 import { Outlet } from 'react-router-dom';
 import { AdminSidebar } from './AdminSidebar';
 import { AdminHeader } from './AdminHeader';
 import { useState } from 'react';
 
 export function AdminLayout() {
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 
   return (
     <div className="min-h-screen bg-background">
       <AdminSidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
       <div className={`transition-all duration-300  ${sidebarCollapsed?"ml-[72px]":"ml-[260px]"}`}>
         <AdminHeader />
         <main className="p-6">
           <Outlet />
         </main>
       </div>
     </div>
   );
 }