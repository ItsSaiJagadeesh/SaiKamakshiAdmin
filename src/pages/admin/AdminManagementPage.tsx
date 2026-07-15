import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { db, app as primaryApp } from '@/config/firebaseconfig';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt?: any;
}

export default function AdminManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // New admin form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Restrict access to root admin only
  if (user?.role !== 'root_admin') {
    return <Navigate to="/" replace />;
  }

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const querySnapshot = await getDocs(q);
      const adminList: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        adminList.push({ id: doc.id, ...doc.data() } as AdminUser);
      });
      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins", error);
      toast({ title: 'Error', description: 'Failed to fetch admins', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) return;
    
    setIsAdding(true);
    try {
      // Create secondary app to prevent signing out the current root admin
      const secondaryApp = initializeApp(primaryApp.options, `SecondaryApp-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUser = userCredential.user;

      // Create document in users collection
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        name: newName,
        role: 'admin',
        createdAt: serverTimestamp()
      });

      // Sign out and clean up secondary auth
      await signOut(secondaryAuth);

      toast({ title: 'Success', description: 'Admin user created successfully' });
      
      // Reset form
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      
      // Refresh list
      fetchAdmins();

    } catch (error: any) {
      console.error("Error creating admin", error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create admin user', 
        variant: 'destructive' 
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm("Are you sure you want to remove this admin's access? Note: This only deletes their role document, their Firebase Auth account remains but they cannot access the dashboard.")) {
      return;
    }
    
    setIsDeleting(adminId);
    try {
      await deleteDoc(doc(db, 'users', adminId));
      toast({ title: 'Success', description: 'Admin access removed' });
      fetchAdmins();
    } catch (error: any) {
      console.error("Error deleting admin", error);
      toast({ title: 'Error', description: 'Failed to remove admin access', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <AdminHeader 
        title="Admin Management" 
        description="Root access control. Manage secondary admin users here."
      />

      <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Add Admin Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Add New Admin
            </h3>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="e.g. John Doe"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="admin@example.com"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Minimum 6 characters"
                  required 
                  minLength={6}
                />
              </div>
              
              <Button type="submit" variant="gold" className="w-full mt-2" disabled={isAdding}>
                {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Admin Account
              </Button>
            </form>
          </div>
        </div>

        {/* Right Col: Admin List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg">Active Administrators</h3>
            </div>
            
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : admins.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No secondary admins found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteAdmin(admin.id)}
                      disabled={isDeleting === admin.id}
                    >
                      {isDeleting === admin.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
