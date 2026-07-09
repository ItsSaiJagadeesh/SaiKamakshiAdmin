import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CouponsTab from '@/components/admin/promotions/CouponsTab';
import SalesTab from '@/components/admin/promotions/SalesTab';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function OffersPage() {
  return (
    <div className="animate-fade-in pb-12">
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Offers & Sales</h1>
          <p className="text-muted-foreground mt-1">Manage discount coupons and promotional sales events.</p>
        </div>
      </div> */}
      <AdminHeader title="Offers & Sales" description="Manage discount coupons and promotional sales events." />
      <div className='p-6'>
      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="coupons">Discount Coupons</TabsTrigger>
          <TabsTrigger value="sales" disabled className="opacity-50 cursor-not-allowed" title="Locked for now">
            Festival Sales (Locked)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="coupons" className="mt-0 outline-none">
          <CouponsTab />
        </TabsContent>
        <TabsContent value="sales" className="mt-0 outline-none">
          <SalesTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
