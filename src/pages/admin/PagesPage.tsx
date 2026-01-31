import { useState, useEffect } from 'react';
import { FileText, Pencil, ExternalLink, Clock } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fetchPages } from '@/data/mockData';
import type { PageContent } from '@/types/admin';
import { format } from 'date-fns';

export default function PagesPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [content, setContent] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    const loadPages = async () => {
      const data = await fetchPages();
      setPages(data);
    };
    loadPages();
  }, []);

  const handleEdit = (page: PageContent) => {
    setEditingPage(page);
    setContent(page.content);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPage) {
      setPages(prev => prev.map(p => 
        p.id === editingPage.id 
          ? { ...p, content, updatedAt: new Date() }
          : p
      ));
      toast({
        title: 'Page updated',
        description: `${editingPage.title} has been saved.`,
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Pages" 
        description="Manage your website content pages"
      />
      
      <div className="p-6">
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div 
              key={page.id} 
              className="luxury-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        /{page.slug}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Updated {format(page.updatedAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </a>
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => handleEdit(page)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Edit {editingPage?.title}
              </DialogTitle>
              <DialogDescription>
                Update the content for this page. HTML is supported.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="pageContent">Page Content</Label>
              <Textarea
                id="pageContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1.5 input-luxury min-h-[300px] font-mono text-sm"
                placeholder="Enter page content..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 You can use HTML tags to format your content. For a rich text editor, enable Lovable Cloud.
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
