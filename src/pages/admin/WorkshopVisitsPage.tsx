import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, Calendar, Edit, MessageSquare, Plus } from 'lucide-react';
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

import { VisitRequest, VisitStatus, mockWorkshopVisits } from '@/data/staticMockData';

export default function WorkshopVisitsPage() {
  const [visits, setVisits] = useState<VisitRequest[]>(mockWorkshopVisits);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteVisit, setSelectedNoteVisit] = useState<VisitRequest | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  
  const { toast } = useToast();

  const filteredVisits = visits.filter(visit => {
    const query = searchQuery.toLowerCase();
    return (
      visit.visitorName.toLowerCase().includes(query) ||
      visit.dateSubmitted.includes(query) ||
      visit.mobile.includes(query) ||
      visit.id.toLowerCase().includes(query)
    );
  });

  const handleStatusChange = (id: string, newStatus: VisitStatus) => {
    setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast({
      title: "Status Updated",
      description: `Visit ${id} marked as ${newStatus}. (Mock Email/WhatsApp sent to visitor)`
    });
  };

  const handleSaveNote = () => {
    if (selectedNoteVisit) {
      setVisits(visits.map(v => 
        v.id === selectedNoteVisit.id ? { ...v, adminNotes: adminNoteText } : v
      ));
      toast({ title: "Admin Note Saved", description: "Internal notes updated successfully." });
      setSelectedNoteVisit(null);
    }
  };

  const getStatusBadge = (status: VisitStatus) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      Rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
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
      description: "Workshop_Visits.csv has been generated (Mock)."
    });
  };

  return (
    <div className="animate-fade-in">
      <AdminHeader 
        title="Workshop Visits" 
        description="Manage all workshop visit requests and appointments"
        actions={
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        }
      />
      
      <div className="p-6">
        {/* Filters */}
        <div className="luxury-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name, Date, Mobile or Request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 input-luxury"
              />
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="luxury-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Request Details</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Visitor Info</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Appointment</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Purpose</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No visit requests found.
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <tr key={visit.id} className="table-row-hover">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{visit.id}</div>
                        <div className="text-xs text-muted-foreground">Submitted: {visit.dateSubmitted}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{visit.visitorName}</div>
                        <div className="text-xs text-muted-foreground">{visit.mobile}</div>
                        <div className="text-xs text-muted-foreground">{visit.email}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{visit.location}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {visit.visitDate}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {visit.visitTime}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Visitors: {visit.numVisitors}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-foreground truncate max-w-[200px]">{visit.purpose}</div>
                        {visit.additionalNotes && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-1" title={visit.additionalNotes}>
                            Note: {visit.additionalNotes}
                          </div>
                        )}
                        {visit.adminNotes && (
                          <div className="text-xs text-blue-600 truncate max-w-[200px] mt-1 flex items-center gap-1" title={visit.adminNotes}>
                            <Edit className="w-3 h-3" /> Admin: {visit.adminNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(visit.status)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleStatusChange(visit.id, 'Confirmed')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-blue-500" /> Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(visit.id, 'Rescheduled')}>
                              <Calendar className="h-4 w-4 mr-2 text-purple-500" /> Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(visit.id, 'Completed')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedNoteVisit(visit); setAdminNoteText(visit.adminNotes); }}>
                                  <MessageSquare className="h-4 w-4 mr-2" /> Add/Edit Note
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Internal Admin Note</DialogTitle>
                                </DialogHeader>
                                <Textarea 
                                  value={adminNoteText} 
                                  onChange={(e) => setAdminNoteText(e.target.value)} 
                                  placeholder="Type an internal note here..."
                                  className="min-h-[100px]"
                                />
                                <DialogFooter>
                                  <Button onClick={handleSaveNote}>Save Note</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(visit.id, 'Cancelled')}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Cancel Visit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
