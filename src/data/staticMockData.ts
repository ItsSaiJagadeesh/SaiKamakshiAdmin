export type OrderStatus = 'Pending' | 'Approved' | 'Proceeding' | 'Delivered' | 'Cancelled';

export interface CorporateOrder {
  id: string;
  dateSubmitted: string;
  contactPerson: string;
  companyName: string;
  email: string;
  mobile: string;
  category: string;
  quantity: number;
  requirements: string;
  status: OrderStatus;
  adminNotes: string;
}

export const mockCorporateOrders: CorporateOrder[] = [
  {
    id: "CORP-2024-001",
    dateSubmitted: "2024-03-12",
    contactPerson: "Rajesh Varma",
    companyName: "Tirumala Tirupati Devasthanams",
    email: "rajesh.v@ttd.org",
    mobile: "+91 9876543210",
    category: "temple_jewellery",
    quantity: 150,
    requirements: "Need customized small silver-plated mementos for VIP gifting.",
    status: "Proceeding",
    adminNotes: "Manufacturing started. Target date April 15."
  },
  {
    id: "CORP-2024-002",
    dateSubmitted: "2024-03-14",
    contactPerson: "Sneha Reddy",
    companyName: "Kalyan Silks",
    email: "sneha.r@kalyansilks.com",
    mobile: "+91 8765432109",
    category: "corporate_gifting",
    quantity: 50,
    requirements: "Diwali gifting for top executives. Panchaloha idols.",
    status: "Pending",
    adminNotes: ""
  },
  {
    id: "CORP-2024-003",
    dateSubmitted: "2024-02-28",
    contactPerson: "Arun Kumar",
    companyName: "Sri Krishna Jewellers",
    email: "arun.k@srikrishna.com",
    mobile: "+91 7654321098",
    category: "retail_wholesale",
    quantity: 200,
    requirements: "Bulk order of traditional anklets and bracelets.",
    status: "Delivered",
    adminNotes: "Delivered via BlueDart. Payment settled."
  },
  {
    id: "CORP-2024-004",
    dateSubmitted: "2024-03-16",
    contactPerson: "Vikram Singh",
    companyName: "Global Event Managers",
    email: "vikram@globalevents.in",
    mobile: "+91 6543210987",
    category: "custom_manufacturing",
    quantity: 500,
    requirements: "Customized medals in panchaloha finish for a marathon event.",
    status: "Approved",
    adminNotes: "Advance payment received. Waiting for design approval."
  }
];

export type VisitStatus = 'Pending' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';

export interface VisitRequest {
  id: string;
  dateSubmitted: string;
  visitorName: string;
  mobile: string;
  email: string;
  location: string;
  visitDate: string;
  visitTime: string;
  numVisitors: number;
  purpose: string;
  additionalNotes: string;
  status: VisitStatus;
  adminNotes: string;
}

export const mockWorkshopVisits: VisitRequest[] = [
  {
    id: "VR-2024-001",
    dateSubmitted: "2024-03-15",
    visitorName: "Rahul Sharma",
    mobile: "+91 9876543210",
    email: "rahul.s@example.com",
    location: "Hyderabad, Telangana",
    visitDate: "2024-03-20",
    visitTime: "10:00 AM - 11:00 AM",
    numVisitors: 2,
    purpose: "Custom jewellery consultation",
    additionalNotes: "Looking to discuss a custom bridal set.",
    status: "Pending",
    adminNotes: ""
  },
  {
    id: "VR-2024-002",
    dateSubmitted: "2024-03-14",
    visitorName: "Priya Patel",
    mobile: "+91 8765432109",
    email: "priya.p@example.com",
    location: "Vijayawada, AP",
    visitDate: "2024-03-18",
    visitTime: "02:00 PM - 03:00 PM",
    numVisitors: 3,
    purpose: "Purchase jewellery",
    additionalNotes: "Interested in the Anklets collection.",
    status: "Confirmed",
    adminNotes: "Sent confirmation email on March 14."
  },
  {
    id: "VR-2024-003",
    dateSubmitted: "2024-03-10",
    visitorName: "Amit Kumar",
    mobile: "+91 7654321098",
    email: "amit.k@example.com",
    location: "Visakhapatnam, AP",
    visitDate: "2024-03-12",
    visitTime: "11:00 AM - 12:00 PM",
    numVisitors: 1,
    purpose: "Corporate/Bulk order discussion",
    additionalNotes: "Need 50 pieces for corporate gifting.",
    status: "Completed",
    adminNotes: "Meeting went well. Preparing quotation."
  }
];

export const mockRevenueData = [
  { name: 'Sep', revenue: 45000 },
  { name: 'Oct', revenue: 52000 },
  { name: 'Nov', revenue: 68000 },
  { name: 'Dec', revenue: 100000 },
  { name: 'Jan', revenue: 85000 },
  { name: 'Feb', revenue: 72000 },
];

export const mockDashboardRecentOrders = [
  {
    id: "SWW-2025-0156",
    customer: "Priya Sharma",
    mobile: "+91 98765 43210",
    amount: "₹6,195",
    paymentStatus: "Paid",
    status: "Shipped",
    date: "1 Feb 2025",
  },
  {
    id: "SWW-2025-0155",
    customer: "Lakshmi Narayanan",
    mobile: "+91 87654 32109",
    amount: "₹26,325",
    paymentStatus: "Paid",
    status: "Delivered",
    date: "28 Jan 2025",
  },
  {
    id: "SWW-2025-0154",
    customer: "Meera Krishnan",
    mobile: "+91 76543 21098",
    amount: "₹8,802",
    paymentStatus: "Pending",
    status: "Processing",
    date: "3 Feb 2025",
  },
  {
    id: "SWW-2025-0153",
    customer: "Anitha Reddy",
    mobile: "+91 65432 10987",
    amount: "₹4,744",
    paymentStatus: "Paid",
    status: "Confirmed",
    date: "4 Feb 2025",
  },
  {
    id: "SWW-2025-0152",
    customer: "Kavitha Sundaram",
    mobile: "+91 54321 09876",
    amount: "₹4,635",
    paymentStatus: "Failed",
    status: "Cancelled",
    date: "4 Feb 2025",
  },
];
