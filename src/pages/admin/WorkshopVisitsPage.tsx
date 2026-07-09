import React, { useState } from 'react';
import { 
  Users, 
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
  X,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useWorkshopVisits, useUpdateWorkshopVisit, WorkshopVisit } from '@/api/workshop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const WorkshopVisitsPage = () => {
  const { data: visits, isLoading } = useWorkshopVisits();
  const updateVisit = useUpdateWorkshopVisit();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [selectedVisit, setSelectedVisit] = useState<WorkshopVisit | null>(null);
  const [localNote, setLocalNote] = useState('');

  // Reschedule Modal State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{ id: string, date: string, time: string, visit: WorkshopVisit | null }>({
    id: '', date: '', time: '', visit: null
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESCHEDULED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOpenPanel = (visit: WorkshopVisit) => {
    setSelectedVisit(visit);
    setLocalNote(visit.adminNotes || '');
  };

  const handleSendEmail = async (visit: WorkshopVisit, action: string, extraData: any = {}) => {
    try {
      toast.loading(`Sending ${action.toLowerCase()} email...`, { id: 'workshop-email' });
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/workshop/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          visit, 
          action, 
          adminNotes: visit.adminNotes,
          ...extraData
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Email sent to ${visit.email}.`, { id: 'workshop-email' });
      } else {
        toast.error('Failed to send email.', { id: 'workshop-email' });
      }
    } catch (err) {
      toast.error('Server error while sending email.', { id: 'workshop-email' });
    }
  };

  const handleUpdateStatus = async (visit: WorkshopVisit, newStatus: string) => {
    try {
      if (newStatus === 'RESCHEDULED') {
        setRescheduleData({ id: visit.id!, date: '', time: '', visit });
        setIsRescheduleOpen(true);
        return; // Pause here to open modal
      }

      // Optimistic local update
      setSelectedVisit(prev => prev ? { ...prev, status: newStatus } : null);

      await updateVisit.mutateAsync({ id: visit.id!, status: newStatus });
      
      if (['CONFIRMED', 'CANCELLED'].includes(newStatus)) {
        await handleSendEmail(visit, newStatus);
      } else {
        toast.success(`Visit status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time || !rescheduleData.visit) {
      toast.error('Please provide both date and time');
      return;
    }

    setIsRescheduleOpen(false);
    
    try {
      // Local optimistic update
      setSelectedVisit(prev => prev ? { 
        ...prev, 
        status: 'RESCHEDULED', 
        preferredDate: rescheduleData.date, 
        preferredTime: rescheduleData.time 
      } : null);

      await updateVisit.mutateAsync({ 
        id: rescheduleData.id, 
        status: 'RESCHEDULED',
        preferredDate: rescheduleData.date, 
        preferredTime: rescheduleData.time
      });
      
      await handleSendEmail(rescheduleData.visit, 'RESCHEDULED', {
        rescheduleDate: rescheduleData.date,
        rescheduleTime: rescheduleData.time
      });
    } catch (error) {
      toast.error('Failed to reschedule visit');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedVisit) return;
    try {
      const id = selectedVisit.id!;
      const notes = localNote;
      setSelectedVisit(prev => prev ? { ...prev, adminNotes: notes } : null);
      await updateVisit.mutateAsync({ id, adminNotes: notes });
      toast.success('Admin notes updated');
    } catch (err) {
      toast.error('Failed to update notes');
    }
  };

  const exportCSV = () => {
    const dataToExport = filteredVisits || [];
    if (dataToExport.length === 0) {
      toast.error('No visits found to export.');
      return;
    }
    
    const headers = ['Visit ID', 'Submitted Date', 'Full Name', 'Mobile', 'Email', 'Preferred Date', 'Preferred Time', 'Visitors', 'Coming From', 'Purpose', 'Status', 'Special Requirements', 'Admin Notes'];
    const rows = dataToExport.map(v => [
      v.id,
      v.createdAt?.toDate ? format(v.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A',
      `"${v.fullName}"`,
      v.mobile,
      v.email,
      v.preferredDate,
      v.preferredTime,
      v.numVisitors,
      `"${v.comingFrom}"`,
      v.purpose,
      v.status,
      `"${(v.specialRequirements || '').replace(/"/g, '""')}"`,
      `"${(v.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `workshop_visits_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVisits = visits?.filter(visit => {
    const matchesSearch = 
      visit.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.mobile?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || visit.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading workshop visits...</div>;

  return (
    <div className="animate-fade-in pb-12 relative overflow-x-hidden min-h-screen">
      <AdminHeader 
          title="Workshop Visits" 
          description="Manage guest appointments to the panchaloha manufacturing unit."
      />
      <div className='p-6'>
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by name, email, or mobile..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
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

        {/* Reschedule Modal (Z-index ensures it's above the panel if panel is open) */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="z-[60]">
            <DialogHeader>
              <DialogTitle>Reschedule Visit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Select a new date and time for <b>{rescheduleData.visit?.fullName}</b>.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Date</label>
                <Input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Time</label>
                <select className="w-full border border-gray-200 rounded-md p-2 text-sm" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})}>
                  <option value="">Select time</option>
                  <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                  <option value="2:00 PM">2:00 PM - 3:00 PM</option>
                  <option value="3:00 PM">3:00 PM - 4:00 PM</option>
                  <option value="4:00 PM">4:00 PM - 5:00 PM</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
              <Button onClick={submitReschedule}>Send Reschedule Email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisits?.map((visit) => (
              <div 
                key={visit.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleOpenPanel(visit)}
              >
                <div className="p-5 border-b border-gray-100 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{visit.fullName}</h3>
                        <p className="text-xs text-gray-500 capitalize">{visit.purpose.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(visit.status)}`}>
                      {visit.status}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{visit.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{visit.preferredTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{visit.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{visit.comingFrom} ({visit.numVisitors} pax)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredVisits?.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No workshop visits found matching your search.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Visitor Info</th>
                  <th className="px-4 py-3">Appointment</th>
                  <th className="px-4 py-3">Group Size</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisits?.map(visit => (
                  <tr 
                    key={visit.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedVisit?.id === visit.id ? 'bg-primary/5' : ''}`}
                    onClick={() => handleOpenPanel(visit)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{visit.fullName}</div>
                      <div className="text-gray-500 text-xs">{visit.mobile}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-gray-900 font-medium text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {visit.preferredDate}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {visit.preferredTime}
                      </div>
                    </td>
                    <td className="px-4 py-4">{visit.numVisitors} from {visit.comingFrom}</td>
                    <td className="px-4 py-4 capitalize">{visit.purpose.replace('_', ' ')}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredVisits?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No workshop visits found matching your search.
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
        {selectedVisit && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisit(null)}
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
                  <h2 className="text-xl font-bold text-gray-900">{selectedVisit.fullName}</h2>
                  <p className="text-sm text-gray-500">Visit ID: {selectedVisit.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedVisit(null)} className="rounded-full hover:bg-gray-100">
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
                      value={selectedVisit.status}
                      onValueChange={(value) => handleUpdateStatus(selectedVisit, value)}
                    >
                      <SelectTrigger className="w-full h-10 bg-white border-gray-200">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending (New)</SelectItem>
                        <SelectItem value="CONFIRMED">Confirm Visit & Email</SelectItem>
                        <SelectItem value="RESCHEDULED">Reschedule Visit</SelectItem>
                        <SelectItem value="COMPLETED">Mark Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancel & Email</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-4 bg-white p-3 rounded-lg text-xs text-gray-500 space-y-2 border border-gray-100 shadow-sm">
                      <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> <b>Confirm</b> sends an acceptance email.</p>
                      <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-purple-500" /> <b>Reschedule</b> asks for a new time & emails them.</p>
                      <p className="flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-red-500" /> <b>Cancel</b> sends a cancellation email.</p>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Visit Details
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <span className="text-xs text-gray-500 block mb-1">Email</span>
                        <a href={`mailto:${selectedVisit.email}`} className="text-sm font-medium text-primary hover:underline">{selectedVisit.email}</a>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Mobile</span>
                        <a href={`tel:${selectedVisit.mobile}`} className="text-sm font-medium text-gray-900 hover:text-primary">{selectedVisit.mobile}</a>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Purpose</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{selectedVisit.purpose.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Group Size</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVisit.numVisitors} Pax</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Coming From</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVisit.comingFrom}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Appointment Date</span>
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {selectedVisit.preferredDate}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Appointment Time</span>
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {selectedVisit.preferredTime}</span>
                      </div>
                    </div>
                    
                    {selectedVisit.specialRequirements && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500 block mb-2">Special Requirements</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                          {selectedVisit.specialRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes Section */}
                <div className="space-y-3 pb-8">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Internal Admin Notes
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">These notes will be included if a cancellation or confirmation email is sent.</p>
                    <textarea 
                      className="w-full text-sm border border-gray-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-sm leading-relaxed"
                      placeholder="Enter internal notes, preparation requirements, etc..."
                      value={localNote}
                      onChange={(e) => setLocalNote(e.target.value)}
                    />
                    <AnimatePresence>
                      {localNote !== (selectedVisit.adminNotes || '') && (
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

export default WorkshopVisitsPage;
