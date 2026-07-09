import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle,
  FileText,
  Download,
  LayoutGrid,
  List as ListIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCorporateOrders, useUpdateCorporateOrder, CorporateOrder } from '@/api/corporate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Tag, Save } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

const CorporateOrdersPage = () => {
  const { data: corporateOrders, isLoading } = useCorporateOrders();
  const updateOrder = useUpdateCorporateOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<CorporateOrder | null>(null);
  const [localNote, setLocalNote] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUpdateStatus = async (order: CorporateOrder, newStatus: string) => {
    try {
      // Optimistic local update of selected order panel state
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);

      if (newStatus === 'CONFIRMED') {
        toast.loading('Confirming order & sending email...', { id: 'confirm-email' });
        
        await updateOrder.mutateAsync({ id: order.id!, status: newStatus });

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/corporate/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, adminNotes: order.adminNotes })
        });
        const data = await res.json();
        
        if (data.success) {
          toast.success('Order confirmed and detailed email sent to customer.', { id: 'confirm-email' });
        } else {
          toast.error('Order updated but email failed to send.', { id: 'confirm-email' });
        }
      } else {
        await updateOrder.mutateAsync({ id: order.id!, status: newStatus });
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedOrder) return;
    try {
      const id = selectedOrder.id!;
      const notes = localNote;
      setSelectedOrder(prev => prev ? { ...prev, adminNotes: notes } : null);
      await updateOrder.mutateAsync({ id, adminNotes: notes });
      toast.success('Admin notes updated');
    } catch (err) {
      toast.error('Failed to update notes');
    }
  };

  const handleOpenPanel = (order: CorporateOrder) => {
    setSelectedOrder(order);
    setLocalNote(order.adminNotes || '');
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredOrders?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders?.map(o => o.id!)));
    }
  };

  const exportCSV = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one order to export.');
      return;
    }

    const selectedData = corporateOrders?.filter(o => selectedIds.has(o.id!)) || [];
    
    const headers = ['Order ID', 'Date', 'Contact Person', 'Company', 'Email', 'Mobile', 'Category', 'Quantity', 'Status', 'Requirements', 'Admin Notes'];
    const rows = selectedData.map(o => [
      o.id,
      o.createdAt?.toDate ? format(o.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A',
      `"${o.contactPerson}"`,
      `"${o.companyName}"`,
      o.email,
      o.mobile,
      o.category,
      o.quantity,
      o.status,
      `"${(o.requirements || '').replace(/"/g, '""')}"`,
      `"${(o.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `corporate_orders_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = corporateOrders?.filter(order => {
    const matchesSearch = 
      order.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading corporate orders...</div>;

  return (
    <div className="animate-fade-in pb-12 relative overflow-x-hidden min-h-screen">
      <AdminHeader
        title="Corporate Orders" 
        description="Manage B2B enquiries, bulk orders, and custom manufacturing requests."
      />
      <div className='p-6'>
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by company, contact person, or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card border-border focus:ring-primary focus:border-primary">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button 
                className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-muted'}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-muted'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders?.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleOpenPanel(order)}
              >
                <div className="p-5 border-b border-gray-100 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.companyName}</h3>
                        <p className="text-sm text-gray-500">{order.contactPerson}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-[200px]">{order.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.mobile}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{order.category.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Est. Quantity</p>
                        <p className="text-sm font-medium text-gray-900">{order.quantity} pieces</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders?.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No corporate orders found matching your search.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary/20"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredOrders?.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">Company / Contact</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders?.map(order => (
                  <tr 
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-primary/5' : ''}`}
                    onClick={() => handleOpenPanel(order)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary/20"
                        checked={selectedIds.has(order.id!)}
                        onChange={() => handleToggleSelect(order.id!)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{order.companyName}</div>
                      <div className="text-gray-500 text-xs">{order.contactPerson}</div>
                    </td>
                    <td className="px-4 py-4 capitalize">{order.category.replace('_', ' ')}</td>
                    <td className="px-4 py-4">{order.quantity} pcs</td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredOrders?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No corporate orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Side Panel using Framer Motion */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 border-l border-gray-200 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrder.companyName}</h2>
                  <p className="text-sm text-gray-500">Order ID: {selectedOrder.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              <div className="p-6 space-y-8">
                
                {/* Status Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Manage Status
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Select 
                      value={selectedOrder.status}
                      onValueChange={(value) => handleUpdateStatus(selectedOrder, value)}
                    >
                      <SelectTrigger className="w-full h-10 bg-white border-gray-200">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLACED">Placed (New)</SelectItem>
                        <SelectItem value="CONFIRMED">Confirm & Send Email</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancel Order</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedOrder.status === 'CONFIRMED' && (
                      <p className="text-xs text-blue-600 mt-3 bg-blue-50/50 p-2.5 rounded-lg flex items-center gap-2 border border-blue-100">
                        <CheckCircle2 className="w-4 h-4" /> Confirmation email already sent to client.
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Enquiry Details
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Contact Person</span>
                        <span className="text-sm font-medium text-gray-900">{selectedOrder.contactPerson}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Mobile</span>
                        <a href={`tel:${selectedOrder.mobile}`} className="text-sm font-medium text-gray-900 hover:text-primary">{selectedOrder.mobile}</a>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-gray-500 block mb-1">Email</span>
                        <a href={`mailto:${selectedOrder.email}`} className="text-sm font-medium text-primary hover:underline">{selectedOrder.email}</a>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Category</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{selectedOrder.category.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Estimated Quantity</span>
                        <span className="text-sm font-medium text-gray-900">{selectedOrder.quantity} pieces</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block mb-2">Special Requirements</span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                        {selectedOrder.requirements || 'No special requirements provided.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes Section */}
                <div className="space-y-3 pb-8">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Admin Official Notes
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">These notes will be included in the confirmation email sent to the client as an official quotation.</p>
                    <textarea 
                      className="w-full text-sm border border-gray-200 rounded-xl p-4 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-sm leading-relaxed"
                      placeholder="Enter quotation details, pricing, or internal notes..."
                      value={localNote}
                      onChange={(e) => setLocalNote(e.target.value)}
                    />
                    <AnimatePresence>
                      {localNote !== (selectedOrder.adminNotes || '') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-end"
                        >
                          <Button onClick={handleUpdateNotes} size="sm" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Notes
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CorporateOrdersPage;
