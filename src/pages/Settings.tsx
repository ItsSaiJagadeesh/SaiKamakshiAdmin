 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Save, Globe, Phone, Mail, MapPin, MessageCircle, CreditCard, Shield } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Switch } from '@/components/ui/switch';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useAuth } from '@/contexts/AuthContext';
 
 export default function Settings() {
   const { user } = useAuth();
   const [codEnabled, setCodEnabled] = useState(true);
 
   return (
     <div className="space-y-6">
       <div>
         <h2 className="text-lg font-semibold text-foreground">Settings</h2>
         <p className="text-sm text-muted-foreground">
           Manage store settings and configurations
         </p>
       </div>
 
       <Tabs defaultValue="general" className="space-y-6">
         <TabsList className="bg-muted/50">
           <TabsTrigger value="general">General</TabsTrigger>
           <TabsTrigger value="payment">Payment</TabsTrigger>
           <TabsTrigger value="users">Users</TabsTrigger>
         </TabsList>
 
         <TabsContent value="general" className="space-y-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-xl border border-border bg-card p-6"
           >
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-primary/10">
                 <Globe className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <h3 className="font-semibold text-foreground">Contact Information</h3>
                 <p className="text-sm text-muted-foreground">Public contact details for your store</p>
               </div>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Mail className="h-4 w-4" />
                   Contact Email
                 </Label>
                 <Input defaultValue="contact@snigdhawomensworld.com" />
               </div>
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Phone className="h-4 w-4" />
                   Phone Number
                 </Label>
                 <Input defaultValue="+91 98765 43210" />
               </div>
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <MessageCircle className="h-4 w-4" />
                   WhatsApp Number
                 </Label>
                 <Input defaultValue="+91 98765 43210" />
               </div>
               <div className="space-y-2">
                 <Label>Website URL</Label>
                 <Input defaultValue="https://snigdhawomensworld.com" />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <Label className="flex items-center gap-2">
                   <MapPin className="h-4 w-4" />
                   Business Address
                 </Label>
                 <Textarea
                   defaultValue="Sri Sai Kamakshi Panchaloham Metal Works, 123 Temple Street, Tirupati, Andhra Pradesh - 517501, India"
                   rows={2}
                 />
               </div>
             </div>
 
             <div className="mt-6 pt-6 border-t border-border">
               <h4 className="font-semibold text-foreground mb-4">Social Links</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Instagram</Label>
                   <Input defaultValue="https://instagram.com/snigdhawomensworld" />
                 </div>
                 <div className="space-y-2">
                   <Label>Facebook</Label>
                   <Input defaultValue="https://facebook.com/snigdhawomensworld" />
                 </div>
                 <div className="space-y-2">
                   <Label>YouTube</Label>
                   <Input placeholder="https://youtube.com/..." />
                 </div>
                 <div className="space-y-2">
                   <Label>Pinterest</Label>
                   <Input placeholder="https://pinterest.com/..." />
                 </div>
               </div>
             </div>
 
             <div className="mt-6 flex justify-end">
               <Button className="bg-gradient-gold text-primary-foreground">
                 <Save className="h-4 w-4 mr-2" />
                 Save Changes
               </Button>
             </div>
           </motion.div>
         </TabsContent>
 
         <TabsContent value="payment" className="space-y-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-xl border border-border bg-card p-6"
           >
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-primary/10">
                 <CreditCard className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <h3 className="font-semibold text-foreground">Payment Settings</h3>
                 <p className="text-sm text-muted-foreground">Configure payment methods and options</p>
               </div>
             </div>
 
             <div className="space-y-6">
               <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                 <div>
                   <p className="font-medium text-foreground">Cash on Delivery (COD)</p>
                   <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                 </div>
                 <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
               </div>
 
               <div className="p-4 rounded-lg border border-border">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <p className="font-medium text-foreground">Razorpay Integration</p>
                     <p className="text-sm text-muted-foreground">UPI, Cards, NetBanking payments</p>
                   </div>
                   <span className="px-2 py-1 text-xs font-medium rounded bg-success/10 text-success">
                     Connected
                   </span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Key ID</Label>
                     <Input type="password" defaultValue="rzp_live_xxxxxxxxxxxx" />
                   </div>
                   <div className="space-y-2">
                     <Label>Key Secret</Label>
                     <Input type="password" defaultValue="••••••••••••••••••••" />
                   </div>
                 </div>
               </div>
 
               {codEnabled && (
                 <div className="p-4 rounded-lg bg-muted/50">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>COD Charges (₹)</Label>
                       <Input type="number" defaultValue="50" />
                     </div>
                     <div className="space-y-2">
                       <Label>Free COD Above (₹)</Label>
                       <Input type="number" defaultValue="5000" />
                     </div>
                   </div>
                 </div>
               )}
             </div>
 
             <div className="mt-6 flex justify-end">
               <Button className="bg-gradient-gold text-primary-foreground">
                 <Save className="h-4 w-4 mr-2" />
                 Save Changes
               </Button>
             </div>
           </motion.div>
         </TabsContent>
 
         <TabsContent value="users" className="space-y-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-xl border border-border bg-card p-6"
           >
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-primary/10">
                 <Shield className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <h3 className="font-semibold text-foreground">Admin Users</h3>
                 <p className="text-sm text-muted-foreground">Manage who has access to this panel</p>
               </div>
             </div>
 
             {user && (
               <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                     <span className="text-lg font-semibold text-primary-foreground">
                       {user.name.charAt(0)}
                     </span>
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">{user.name}</p>
                     <p className="text-sm text-muted-foreground">{user.email}</p>
                   </div>
                 </div>
                 <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize">
                   {user.role.replace('_', ' ')}
                 </span>
               </div>
             )}
 
             <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
               <p className="text-sm text-muted-foreground">
                 User management requires Firebase integration. Connect your Firebase project to add more admin users.
               </p>
             </div>
           </motion.div>
         </TabsContent>
       </Tabs>
     </div>
   );
 }