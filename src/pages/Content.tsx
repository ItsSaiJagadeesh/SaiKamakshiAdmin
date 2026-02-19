 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { FileText, Edit, Save, X, Image, Link as LinkIcon } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Switch } from '@/components/ui/switch';
 import { cn } from '@/lib/utils';
 
 const contentPages = [
   { id: 'home', name: 'Home Page', description: 'Hero section and featured content' },
   { id: 'our-story', name: 'Our Story', description: 'Brand history and values' },
   { id: 'legacy', name: 'Family Legacy', description: 'Since 1975 heritage content' },
   { id: 'gallery', name: 'Gallery', description: 'Product and craftsman images' },
   { id: 'contact', name: 'Contact', description: 'Contact information and form' },
   { id: 'footer', name: 'Footer', description: 'Footer links and content' },
 ];
 
 export default function Content() {
   const [selectedPage, setSelectedPage] = useState('home');
   const [isEditing, setIsEditing] = useState(false);
   const [teluguEnabled, setTeluguEnabled] = useState(false);
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h2 className="text-lg font-semibold text-foreground">Content Management</h2>
           <p className="text-sm text-muted-foreground">
             Edit website pages, images, and text content
           </p>
         </div>
         <div className="flex items-center gap-3">
           <div className="flex items-center gap-2">
             <Switch
               id="telugu"
               checked={teluguEnabled}
               onCheckedChange={setTeluguEnabled}
             />
             <Label htmlFor="telugu" className="text-sm">
               Show Telugu Content
             </Label>
           </div>
         </div>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Pages List */}
         <div className="lg:col-span-1">
           <div className="rounded-xl border border-border bg-card p-4">
             <h3 className="font-semibold text-foreground mb-4">Pages</h3>
             <div className="space-y-2">
               {contentPages.map((page) => (
                 <button
                   key={page.id}
                   onClick={() => setSelectedPage(page.id)}
                   className={cn(
                     'w-full text-left px-3 py-2.5 rounded-lg transition-colors',
                     selectedPage === page.id
                       ? 'bg-primary/10 text-primary'
                       : 'hover:bg-muted text-foreground'
                   )}
                 >
                   <p className="font-medium text-sm">{page.name}</p>
                   <p className="text-xs text-muted-foreground">{page.description}</p>
                 </button>
               ))}
             </div>
           </div>
         </div>
 
         {/* Content Editor */}
         <div className="lg:col-span-3">
           <motion.div
             key={selectedPage}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="rounded-xl border border-border bg-card"
           >
             <div className="p-6 border-b border-border flex items-center justify-between">
               <div>
                 <h3 className="font-semibold text-foreground">
                   {contentPages.find((p) => p.id === selectedPage)?.name}
                 </h3>
                 <p className="text-sm text-muted-foreground">
                   {contentPages.find((p) => p.id === selectedPage)?.description}
                 </p>
               </div>
               {isEditing ? (
                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => setIsEditing(false)}>
                     <X className="h-4 w-4 mr-2" />
                     Cancel
                   </Button>
                   <Button className="bg-gradient-gold text-primary-foreground" onClick={() => setIsEditing(false)}>
                     <Save className="h-4 w-4 mr-2" />
                     Save Changes
                   </Button>
                 </div>
               ) : (
                 <Button onClick={() => setIsEditing(true)}>
                   <Edit className="h-4 w-4 mr-2" />
                   Edit Content
                 </Button>
               )}
             </div>
 
             <div className="p-6">
               {selectedPage === 'home' && (
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <Label>Hero Title</Label>
                     <Input
                       defaultValue="Authentic Panchaloha Jewelry"
                       disabled={!isEditing}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Hero Subtitle</Label>
                     <Textarea
                       defaultValue="Handcrafted with tradition since 1975. Experience the divine beauty of South Indian temple jewelry, made by master artisans."
                       disabled={!isEditing}
                       rows={3}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Hero Image URL</Label>
                     <div className="flex gap-2">
                       <Input
                         defaultValue="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
                         disabled={!isEditing}
                       />
                       <Button variant="outline" disabled={!isEditing}>
                         <Image className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                   {teluguEnabled && (
                     <>
                       <div className="pt-4 border-t border-border">
                         <p className="text-sm font-medium text-primary mb-4">Telugu Content</p>
                       </div>
                       <div className="space-y-2">
                         <Label>Hero Title (Telugu)</Label>
                         <Input
                           defaultValue="అసలైన పంచలోహ ఆభరణాలు"
                           disabled={!isEditing}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label>Hero Subtitle (Telugu)</Label>
                         <Textarea
                           defaultValue="1975 నుండి సంప్రదాయంతో చేతితో తయారు చేయబడింది."
                           disabled={!isEditing}
                           rows={3}
                         />
                       </div>
                     </>
                   )}
                 </div>
               )}
 
               {selectedPage === 'our-story' && (
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <Label>Page Title</Label>
                     <Input defaultValue="Our Story" disabled={!isEditing} />
                   </div>
                   <div className="space-y-2">
                     <Label>Main Content</Label>
                     <Textarea
                       defaultValue="Sri Sai Kamakshi Panchaloham Metal Works was established in 1975 by our founder with a vision to preserve the ancient art of Panchaloha jewelry making. For nearly five decades, we have been handcrafting exquisite temple jewelry that adorns devotees across India..."
                       disabled={!isEditing}
                       rows={8}
                     />
                   </div>
                 </div>
               )}
 
               {selectedPage === 'contact' && (
                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Email</Label>
                       <Input defaultValue="contact@snigdhawomensworld.com" disabled={!isEditing} />
                     </div>
                     <div className="space-y-2">
                       <Label>Phone</Label>
                       <Input defaultValue="+91 98765 43210" disabled={!isEditing} />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>WhatsApp</Label>
                     <Input defaultValue="+91 98765 43210" disabled={!isEditing} />
                   </div>
                   <div className="space-y-2">
                     <Label>Address</Label>
                     <Textarea
                       defaultValue="Sri Sai Kamakshi Panchaloham Metal Works, 123 Temple Street, Tirupati, Andhra Pradesh - 517501"
                       disabled={!isEditing}
                       rows={3}
                     />
                   </div>
                 </div>
               )}
 
               {(selectedPage === 'legacy' || selectedPage === 'gallery' || selectedPage === 'footer') && (
                 <div className="text-center py-12">
                   <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                   <p className="text-muted-foreground">
                     Content editor for {contentPages.find((p) => p.id === selectedPage)?.name}
                   </p>
                   <p className="text-sm text-muted-foreground mt-2">
                     Click "Edit Content" to modify this section
                   </p>
                 </div>
               )}
             </div>
           </motion.div>
         </div>
       </div>
     </div>
   );
 }