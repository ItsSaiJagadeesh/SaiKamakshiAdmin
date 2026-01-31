import { useState, useEffect } from 'react';
import { Save, Mail, Phone, MapPin, CreditCard, Loader2, Globe } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { fetchSettings } from '@/data/mockData';
import type { Settings } from '@/types/admin';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
    
    setIsSubmitting(false);
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Settings" 
        description="Manage your store settings"
        actions={
          <Button variant="gold" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        }
      />
      
      <div className="p-6">
        <div className="max-w-3xl space-y-6">
          {/* Contact Information */}
          <div className="luxury-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-6">
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Contact Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="mt-1.5 input-luxury"
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="mt-1.5 input-luxury"
                  placeholder="+91 98765 43210"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Include country code (e.g., +91 for India)
                </p>
              </div>
              
              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-1.5 input-luxury"
                  placeholder="Enter your business address..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Payment Settings */}
          <div className="luxury-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-6">
              Payment Settings
            </h3>
            
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="cod" className="font-medium">Cash on Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay when they receive their order
                  </p>
                </div>
              </div>
              <Switch
                id="cod"
                checked={settings.codEnabled}
                onCheckedChange={(checked) => handleChange('codEnabled', checked)}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              💡 To enable online payments (UPI, Cards, etc.), enable Lovable Cloud and integrate a payment gateway.
            </p>
          </div>
          
          {/* Store Information */}
          <div className="luxury-card p-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-6">
              Store Information
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Store Name</p>
                <p className="font-medium text-foreground mt-1">Sai Kamakshi Jewellery</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Domain</p>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-primary" />
                  <p className="font-medium text-foreground">saikamakshijewellery.com</p>
                </div>
              </div>
              
              <div className="sm:col-span-2 p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Parent Company</p>
                <p className="font-medium text-foreground mt-1">
                  Sri Sai Kamakshi Panchaloham Metal Works (Est. 1975)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
