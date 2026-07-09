import { useState } from 'react';
import { 
  Search, Download, CheckCircle, XCircle, Clock, Edit, 
  MessageSquare, Briefcase, LayoutGrid, List, Table, Filter 
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type ViewMode = 'table' | 'grid' | 'list';

import { CorporateOrder, OrderStatus, mockCorporateOrders } from '@/data/staticMockData';

export default function CorporateOrdersPage() {
  const [orders, setOrders] = useState<CorporateOrder[]>(mockCorporateOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedNoteOrder, setSelectedNoteOrder] = useState<CorporateOrder | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      order.companyName.toLowerCase().includes(query) ||
      order.contactPerson.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      order.mobile.includes(query);
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast({
      title: "Status Updated",
      description: `Order ${id} marked as ${newStatus}.`
    });
  };

  const handleSaveNote = () => {
    if (selectedNoteOrder) {
      setOrders(orders.map(o => 
        o.id === selectedNoteOrder.id ? { ...o, adminNotes: adminNoteText } : o
      ));
      toast({ title: "Admin Note Saved", description: "Internal notes updated successfully." });
      setSelectedNoteOrder(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-blue-100 text-blue-800 border-blue-200",
      Proceeding: "bg-purple-100 text-purple-800 border-purple-200",
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const exportToCSV = () => {
    toast({
      title: "Export Successful",
      description: "Corporate_Orders.csv has been generated (Mock)."
    });
  };

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = {
      corporate_gifting: "Corporate Gifting",
      retail_wholesale: "Retail/Wholesale",
      temple_jewellery: "Temple Jewellery",
      custom_manufacturing: "Custom Mfg"
    };
    return categories[cat] || cat;
  };

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Corporate Orders" 
        description="Manage B2B, wholesale, and institutional bulk orders"
        actions={
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        }
      />
      
      <div className="p-6">
        {/* Filters and View Toggles */}
        <div className="luxury-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Company, Contact, or Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 input-luxury"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Proceeding">Proceeding</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
              <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('table')}
                className="px-2 py-1 h-8"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('list')}
                className="px-2 py-1 h-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className="px-2 py-1 h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Data Views */}
        
        {filteredOrders.length === 0 ? (
          <div className="luxury-card p-12 text-center text-muted-foreground">
            No corporate orders found matching your criteria.
          </div>
        ) : (
          <>
            {/* TABLE VIEW */}
            {viewMode === 'table' && (
              <div className="luxury-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company & Contact</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Details</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="table-row-hover">
                          <td className="px-4 py-4">
                            <div className="font-medium text-foreground">{order.id}</div>
                            <div className="text-xs text-muted-foreground">Date: {order.dateSubmitted}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-foreground flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              {order.companyName}
                            </div>
                            <div className="text-sm text-foreground mt-1">{order.contactPerson}</div>
                            <div className="text-xs text-muted-foreground">{order.email}</div>
                            <div className="text-xs text-muted-foreground">{order.mobile}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {getCategoryLabel(order.category)} ({order.quantity} pcs)
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[250px] mt-1" title={order.requirements}>
                              {order.requirements}
                            </div>
                            {order.adminNotes && (
                              <div className="text-xs text-blue-600 truncate max-w-[250px] mt-1 flex items-center gap-1" title={order.adminNotes}>
                                <Edit className="w-3 h-3" /> Note: {order.adminNotes}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <OrderActionsDropdown 
                              order={order} 
                              handleStatusChange={handleStatusChange} 
                              setSelectedNoteOrder={setSelectedNoteOrder}
                              setAdminNoteText={setAdminNoteText}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="luxury-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-secondary/30 transition-colors">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-bold text-foreground text-lg">{order.companyName}</span>
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{order.id}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Contact:</span> <span className="font-medium text-foreground">{order.contactPerson}</span>
                          <div className="text-muted-foreground text-xs mt-0.5">{order.mobile}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Order:</span> <span className="font-medium text-foreground">{getCategoryLabel(order.category)}</span>
                          <div className="text-muted-foreground text-xs mt-0.5">Qty: {order.quantity} pieces</div>
                        </div>
                        <div className="sm:col-span-2 md:col-span-1">
                          <span className="text-muted-foreground">Submitted:</span> <span className="font-medium text-foreground">{order.dateSubmitted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-4 sm:mt-0">
                      <OrderActionsDropdown 
                        order={order} 
                        handleStatusChange={handleStatusChange} 
                        setSelectedNoteOrder={setSelectedNoteOrder}
                        setAdminNoteText={setAdminNoteText}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="luxury-card flex flex-col p-5 hover:-translate-y-1 transition-transform duration-200">
                    <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-foreground truncate" title={order.companyName}>{order.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{order.contactPerson}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="flex-1 space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Request ID</div>
                        <div className="font-medium text-foreground text-right">{order.id}</div>
                        
                        <div className="text-muted-foreground">Date</div>
                        <div className="font-medium text-foreground text-right">{order.dateSubmitted}</div>
                        
                        <div className="text-muted-foreground">Category</div>
                        <div className="font-medium text-foreground text-right">{getCategoryLabel(order.category)}</div>
                        
                        <div className="text-muted-foreground">Quantity</div>
                        <div className="font-medium text-foreground text-right">{order.quantity}</div>
                      </div>
                      
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground line-clamp-2" title={order.requirements}>
                          {order.requirements}
                        </div>
                        {order.adminNotes && (
                          <div className="text-xs text-blue-600 line-clamp-2 mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                            <strong>Note:</strong> {order.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                      <OrderActionsDropdown 
                        order={order} 
                        handleStatusChange={handleStatusChange} 
                        setSelectedNoteOrder={setSelectedNoteOrder}
                        setAdminNoteText={setAdminNoteText}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Note Edit Modal (Global for page) */}
        {selectedNoteOrder && (
          <Dialog open={!!selectedNoteOrder} onOpenChange={(open) => !open && setSelectedNoteOrder(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Admin Note - {selectedNoteOrder.companyName}</DialogTitle>
              </DialogHeader>
              <Textarea 
                value={adminNoteText} 
                onChange={(e) => setAdminNoteText(e.target.value)} 
                placeholder="Type an internal note here (e.g., quotations sent, negotiation details)..."
                className="min-h-[120px]"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedNoteOrder(null)}>Cancel</Button>
                <Button onClick={handleSaveNote}>Save Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Separate component for the dropdown menu to keep code clean and reusable across views
function OrderActionsDropdown({ 
  order, 
  handleStatusChange, 
  setSelectedNoteOrder, 
  setAdminNoteText 
}: { 
  order: CorporateOrder, 
  handleStatusChange: (id: string, s: OrderStatus) => void,
  setSelectedNoteOrder: (o: CorporateOrder) => void,
  setAdminNoteText: (t: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Pending')}>
          <Clock className="h-4 w-4 mr-2 text-yellow-500" /> Mark Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Approved')}>
          <CheckCircle className="h-4 w-4 mr-2 text-blue-500" /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Proceeding')}>
          <Briefcase className="h-4 w-4 mr-2 text-purple-500" /> Set Proceeding
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Delivered')}>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Mark Delivered
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedNoteOrder(order); setAdminNoteText(order.adminNotes); }}>
          <MessageSquare className="h-4 w-4 mr-2" /> Add/Edit Note
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleStatusChange(order.id, 'Cancelled')}
          className="text-destructive focus:text-destructive"
        >
          <XCircle className="h-4 w-4 mr-2" /> Cancel Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
