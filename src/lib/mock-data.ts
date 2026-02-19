 // Mock Data for Snigdha Women's World Admin Panel
 
 export interface AdminUser {
   id: string;
   name: string;
   email: string;
   role: 'super_admin' | 'admin';
   lastLoginAt: string;
   createdAt: string;
 }
 
 export interface Collection {
   id: string;
   name: string;
   slug: string;
   description: string;
   coverImage: string;
   productCount: number;
   status: 'active' | 'inactive';
   seo: { metaTitle: string; metaDescription: string };
   createdAt: string;
   updatedAt: string;
 }
 
 export interface ProductSize {
   sizeId: string;
   type: string;
   availability: boolean;
   pricing: {
     originalPrice: number;
     discount: number;
     finalPrice: number;
   };
   stock: number;
 }
 
 export interface ProductVariant {
   id: string;
   productId: string;
   collectionId: string;
   skuPrefix: string;
   images: string[];
   sizes: ProductSize[];
   status: 'active' | 'inactive';
   createdAt: string;
   updatedAt: string;
 }
 
 export interface Product {
   id: string;
   name: string;
   slug: string;
   collectionId: string;
   collectionName: string;
   shortDescription: string;
   description: string;
   images: string[];
   priceRange: { minPrice: number; maxPrice: number };
   reviews: { rating: number; count: number };
   occasions: string[];
   designType: string;
   material: string;
   status: 'published' | 'draft';
   variantCount: number;
   seo: { metaTitle: string; metaDescription: string };
   createdAt: string;
   updatedAt: string;
 }
 
 export interface OrderItem {
   productId: string;
   productName: string;
   variantId: string;
   sku: string;
   attributes: { size: string; material: string; variantType: string };
   quantity: number;
   priceSnapshot: number;
 }
 
 export interface Order {
   id: string;
   orderNumber: string;
   customer: { name: string; phone: string; email: string };
   shippingAddress: string;
   items: OrderItem[];
   pricing: {
     subtotal: number;
     gst: number;
     shipping: number;
     cod: number;
     discount: number;
     total: number;
   };
   payment: { method: 'upi' | 'card' | 'netbanking' | 'cod'; status: 'pending' | 'paid' | 'failed'; paymentId?: string };
   orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
   timeline: { status: string; timestamp: string }[];
   createdAt: string;
   updatedAt: string;
 }
 
 export interface Payment {
   id: string;
   orderId: string;
   orderNumber: string;
   gateway: string;
   razorpay?: { orderId: string; paymentId: string; signature: string };
   amount: number;
   currency: string;
   method: 'upi' | 'card' | 'netbanking';
   status: 'pending' | 'success' | 'failed' | 'refunded';
   paidAt?: string;
   createdAt: string;
   updatedAt: string;
 }
 
 // Mock Admin User
 export const mockAdmin: AdminUser = {
   id: 'admin-001',
   name: 'Lakshmi Devi',
   email: 'admin@snigdhawomensworld.com',
   role: 'super_admin',
   lastLoginAt: new Date().toISOString(),
   createdAt: '2024-01-15T10:00:00Z',
 };
 
 // Mock Collections
 export const mockCollections: Collection[] = [
   {
     id: 'col-001',
     name: 'Temple Collection',
     slug: 'temple-collection',
     description: 'Exquisite Panchaloha temple jewellery inspired by South Indian traditions',
     coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
     productCount: 24,
     status: 'active',
     seo: { metaTitle: 'Temple Collection | Snigdha Womens World', metaDescription: 'Shop authentic Panchaloha temple jewellery' },
     createdAt: '2024-06-01T10:00:00Z',
     updatedAt: '2025-01-20T15:30:00Z',
   },
   {
     id: 'col-002',
     name: 'Bridal Essentials',
     slug: 'bridal-essentials',
     description: 'Complete bridal sets for the most auspicious occasions',
     coverImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
     productCount: 18,
     status: 'active',
     seo: { metaTitle: 'Bridal Essentials | Snigdha Womens World', metaDescription: 'Premium bridal jewellery sets' },
     createdAt: '2024-06-15T10:00:00Z',
     updatedAt: '2025-01-18T12:00:00Z',
   },
   {
     id: 'col-003',
     name: 'Daily Wear',
     slug: 'daily-wear',
     description: 'Elegant everyday pieces that blend tradition with modern style',
     coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
     productCount: 32,
     status: 'active',
     seo: { metaTitle: 'Daily Wear | Snigdha Womens World', metaDescription: 'Everyday Panchaloha jewellery' },
     createdAt: '2024-07-01T10:00:00Z',
     updatedAt: '2025-01-22T09:15:00Z',
   },
   {
     id: 'col-004',
     name: 'Festival Special',
     slug: 'festival-special',
     description: 'Celebrate festivals with our specially curated collection',
     coverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
     productCount: 15,
     status: 'inactive',
     seo: { metaTitle: 'Festival Special | Snigdha Womens World', metaDescription: 'Festival jewellery collection' },
     createdAt: '2024-08-01T10:00:00Z',
     updatedAt: '2025-01-10T14:20:00Z',
   },
 ];
 
 // Mock Products
 export const mockProducts: Product[] = [
   {
     id: 'prod-001',
     name: 'Lakshmi Pendant Necklace',
     slug: 'lakshmi-pendant-necklace',
     collectionId: 'col-001',
     collectionName: 'Temple Collection',
     shortDescription: 'Traditional Lakshmi pendant with intricate craftsmanship',
     description: 'This exquisite Lakshmi pendant necklace features the goddess of wealth in traditional South Indian style. Handcrafted in pure Panchaloha by master artisans from our family workshop.',
     images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800'],
     priceRange: { minPrice: 4500, maxPrice: 8500 },
     reviews: { rating: 4.8, count: 124 },
     occasions: ['Wedding', 'Pooja', 'Festival'],
     designType: 'Traditional',
     material: 'Panchaloha',
     status: 'published',
     variantCount: 3,
     seo: { metaTitle: 'Lakshmi Pendant Necklace', metaDescription: 'Buy authentic Panchaloha Lakshmi pendant' },
     createdAt: '2024-06-05T10:00:00Z',
     updatedAt: '2025-01-25T11:00:00Z',
   },
   {
     id: 'prod-002',
     name: 'Temple Jhumka Earrings',
     slug: 'temple-jhumka-earrings',
     collectionId: 'col-001',
     collectionName: 'Temple Collection',
     shortDescription: 'Classic temple jhumkas with bell design',
     description: 'These beautiful temple jhumkas feature the iconic bell design with delicate detailing. Perfect for traditional occasions and daily wear alike.',
     images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
     priceRange: { minPrice: 2200, maxPrice: 4800 },
     reviews: { rating: 4.9, count: 89 },
     occasions: ['Daily Wear', 'Festival', 'Office'],
     designType: 'Traditional',
     material: 'Panchaloha',
     status: 'published',
     variantCount: 4,
     seo: { metaTitle: 'Temple Jhumka Earrings', metaDescription: 'Shop Panchaloha temple jhumkas' },
     createdAt: '2024-06-10T10:00:00Z',
     updatedAt: '2025-01-24T09:30:00Z',
   },
   {
     id: 'prod-003',
     name: 'Bridal Mango Haram',
     slug: 'bridal-mango-haram',
     collectionId: 'col-002',
     collectionName: 'Bridal Essentials',
     shortDescription: 'Grand mango haram for South Indian brides',
     description: 'The quintessential South Indian bridal piece. This magnificent mango haram features traditional paisley motifs and intricate temple work.',
     images: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800'],
     priceRange: { minPrice: 15000, maxPrice: 28000 },
     reviews: { rating: 5.0, count: 45 },
     occasions: ['Wedding', 'Engagement'],
     designType: 'Bridal',
     material: 'Panchaloha',
     status: 'published',
     variantCount: 2,
     seo: { metaTitle: 'Bridal Mango Haram', metaDescription: 'Premium bridal haram for weddings' },
     createdAt: '2024-06-20T10:00:00Z',
     updatedAt: '2025-01-23T16:45:00Z',
   },
   {
     id: 'prod-004',
     name: 'Antique Finish Bangles Set',
     slug: 'antique-finish-bangles-set',
     collectionId: 'col-003',
     collectionName: 'Daily Wear',
     shortDescription: 'Set of 4 antique finish Panchaloha bangles',
     description: 'Elegant set of four matching bangles with beautiful antique finish. Comfortable for everyday wear while maintaining traditional charm.',
     images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'],
     priceRange: { minPrice: 3200, maxPrice: 5600 },
     reviews: { rating: 4.7, count: 156 },
     occasions: ['Daily Wear', 'Office', 'Casual'],
     designType: 'Contemporary',
     material: 'Panchaloha',
     status: 'published',
     variantCount: 5,
     seo: { metaTitle: 'Antique Finish Bangles', metaDescription: 'Buy Panchaloha bangles set' },
     createdAt: '2024-07-05T10:00:00Z',
     updatedAt: '2025-01-26T08:20:00Z',
   },
   {
     id: 'prod-005',
     name: 'Goddess Saraswati Pendant',
     slug: 'goddess-saraswati-pendant',
     collectionId: 'col-001',
     collectionName: 'Temple Collection',
     shortDescription: 'Detailed Saraswati pendant for knowledge seekers',
     description: 'Beautiful depiction of Goddess Saraswati, the deity of knowledge and arts. Perfect gift for students and artists.',
     images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
     priceRange: { minPrice: 3800, maxPrice: 6200 },
     reviews: { rating: 4.6, count: 67 },
     occasions: ['Pooja', 'Gift', 'Daily Wear'],
     designType: 'Traditional',
     material: 'Panchaloha',
     status: 'draft',
     variantCount: 2,
     seo: { metaTitle: 'Saraswati Pendant', metaDescription: 'Panchaloha Saraswati pendant' },
     createdAt: '2024-08-15T10:00:00Z',
     updatedAt: '2025-01-20T13:10:00Z',
   },
 ];
 
 // Mock Orders
 export const mockOrders: Order[] = [
   {
     id: 'ord-001',
     orderNumber: 'SWW-2025-0156',
     customer: { name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya.sharma@email.com' },
     shippingAddress: '42, MG Road, Koramangala, Bangalore - 560034, Karnataka',
     items: [
       { productId: 'prod-001', productName: 'Lakshmi Pendant Necklace', variantId: 'var-001', sku: 'SWW-LPN-001', attributes: { size: 'Regular', material: 'Panchaloha', variantType: 'Gold Polish' }, quantity: 1, priceSnapshot: 6500 },
     ],
     pricing: { subtotal: 6500, gst: 195, shipping: 0, cod: 0, discount: 500, total: 6195 },
     payment: { method: 'upi', status: 'paid', paymentId: 'pay_NxYz123456' },
     orderStatus: 'shipped',
     timeline: [
       { status: 'placed', timestamp: '2025-02-01T10:30:00Z' },
       { status: 'confirmed', timestamp: '2025-02-01T11:00:00Z' },
       { status: 'processing', timestamp: '2025-02-01T14:00:00Z' },
       { status: 'shipped', timestamp: '2025-02-02T09:00:00Z' },
     ],
     createdAt: '2025-02-01T10:30:00Z',
     updatedAt: '2025-02-02T09:00:00Z',
   },
   {
     id: 'ord-002',
     orderNumber: 'SWW-2025-0155',
     customer: { name: 'Lakshmi Narayanan', phone: '+91 87654 32109', email: 'lakshmi.n@email.com' },
     shippingAddress: '15, Anna Salai, T Nagar, Chennai - 600017, Tamil Nadu',
     items: [
       { productId: 'prod-003', productName: 'Bridal Mango Haram', variantId: 'var-003', sku: 'SWW-BMH-001', attributes: { size: 'Long', material: 'Panchaloha', variantType: 'Antique' }, quantity: 1, priceSnapshot: 24000 },
       { productId: 'prod-002', productName: 'Temple Jhumka Earrings', variantId: 'var-002', sku: 'SWW-TJE-001', attributes: { size: 'Medium', material: 'Panchaloha', variantType: 'Gold Polish' }, quantity: 1, priceSnapshot: 3500 },
     ],
     pricing: { subtotal: 27500, gst: 825, shipping: 0, cod: 0, discount: 2000, total: 26325 },
     payment: { method: 'card', status: 'paid', paymentId: 'pay_AbCd789012' },
     orderStatus: 'delivered',
     timeline: [
       { status: 'placed', timestamp: '2025-01-28T15:45:00Z' },
       { status: 'confirmed', timestamp: '2025-01-28T16:00:00Z' },
       { status: 'processing', timestamp: '2025-01-29T09:00:00Z' },
       { status: 'shipped', timestamp: '2025-01-30T10:00:00Z' },
       { status: 'delivered', timestamp: '2025-02-02T14:30:00Z' },
     ],
     createdAt: '2025-01-28T15:45:00Z',
     updatedAt: '2025-02-02T14:30:00Z',
   },
   {
     id: 'ord-003',
     orderNumber: 'SWW-2025-0154',
     customer: { name: 'Meera Krishnan', phone: '+91 76543 21098', email: 'meera.k@email.com' },
     shippingAddress: '8, Jubilee Hills, Road No. 36, Hyderabad - 500033, Telangana',
     items: [
       { productId: 'prod-004', productName: 'Antique Finish Bangles Set', variantId: 'var-004', sku: 'SWW-AFB-001', attributes: { size: '2.6', material: 'Panchaloha', variantType: 'Antique' }, quantity: 2, priceSnapshot: 4200 },
     ],
     pricing: { subtotal: 8400, gst: 252, shipping: 100, cod: 50, discount: 0, total: 8802 },
     payment: { method: 'cod', status: 'pending' },
     orderStatus: 'processing',
     timeline: [
       { status: 'placed', timestamp: '2025-02-03T08:20:00Z' },
       { status: 'confirmed', timestamp: '2025-02-03T09:00:00Z' },
       { status: 'processing', timestamp: '2025-02-03T11:30:00Z' },
     ],
     createdAt: '2025-02-03T08:20:00Z',
     updatedAt: '2025-02-03T11:30:00Z',
   },
   {
     id: 'ord-004',
     orderNumber: 'SWW-2025-0153',
     customer: { name: 'Anitha Reddy', phone: '+91 65432 10987', email: 'anitha.r@email.com' },
     shippingAddress: '22, Indiranagar, 100 Feet Road, Bangalore - 560038, Karnataka',
     items: [
       { productId: 'prod-002', productName: 'Temple Jhumka Earrings', variantId: 'var-002b', sku: 'SWW-TJE-002', attributes: { size: 'Large', material: 'Panchaloha', variantType: 'Matt Finish' }, quantity: 1, priceSnapshot: 4800 },
     ],
     pricing: { subtotal: 4800, gst: 144, shipping: 0, cod: 0, discount: 200, total: 4744 },
     payment: { method: 'upi', status: 'paid', paymentId: 'pay_EfGh345678' },
     orderStatus: 'confirmed',
     timeline: [
       { status: 'placed', timestamp: '2025-02-04T12:15:00Z' },
       { status: 'confirmed', timestamp: '2025-02-04T12:30:00Z' },
     ],
     createdAt: '2025-02-04T12:15:00Z',
     updatedAt: '2025-02-04T12:30:00Z',
   },
   {
     id: 'ord-005',
     orderNumber: 'SWW-2025-0152',
     customer: { name: 'Kavitha Sundaram', phone: '+91 54321 09876', email: 'kavitha.s@email.com' },
     shippingAddress: '5, Besant Nagar, 3rd Main Road, Chennai - 600090, Tamil Nadu',
     items: [
       { productId: 'prod-001', productName: 'Lakshmi Pendant Necklace', variantId: 'var-001b', sku: 'SWW-LPN-002', attributes: { size: 'Small', material: 'Panchaloha', variantType: 'Antique' }, quantity: 1, priceSnapshot: 4500 },
     ],
     pricing: { subtotal: 4500, gst: 135, shipping: 0, cod: 0, discount: 0, total: 4635 },
     payment: { method: 'netbanking', status: 'failed' },
     orderStatus: 'cancelled',
     timeline: [
       { status: 'placed', timestamp: '2025-02-04T09:00:00Z' },
       { status: 'cancelled', timestamp: '2025-02-04T09:15:00Z' },
     ],
     createdAt: '2025-02-04T09:00:00Z',
     updatedAt: '2025-02-04T09:15:00Z',
   },
 ];
 
 // Mock Payments
 export const mockPayments: Payment[] = [
   {
     id: 'pay-001',
     orderId: 'ord-001',
     orderNumber: 'SWW-2025-0156',
     gateway: 'razorpay',
     razorpay: { orderId: 'order_NxYz123', paymentId: 'pay_NxYz123456', signature: 'sig_abc123' },
     amount: 6195,
     currency: 'INR',
     method: 'upi',
     status: 'success',
     paidAt: '2025-02-01T10:32:00Z',
     createdAt: '2025-02-01T10:30:00Z',
     updatedAt: '2025-02-01T10:32:00Z',
   },
   {
     id: 'pay-002',
     orderId: 'ord-002',
     orderNumber: 'SWW-2025-0155',
     gateway: 'razorpay',
     razorpay: { orderId: 'order_AbCd789', paymentId: 'pay_AbCd789012', signature: 'sig_def456' },
     amount: 26325,
     currency: 'INR',
     method: 'card',
     status: 'success',
     paidAt: '2025-01-28T15:48:00Z',
     createdAt: '2025-01-28T15:45:00Z',
     updatedAt: '2025-01-28T15:48:00Z',
   },
   {
     id: 'pay-003',
     orderId: 'ord-004',
     orderNumber: 'SWW-2025-0153',
     gateway: 'razorpay',
     razorpay: { orderId: 'order_EfGh345', paymentId: 'pay_EfGh345678', signature: 'sig_ghi789' },
     amount: 4744,
     currency: 'INR',
     method: 'upi',
     status: 'success',
     paidAt: '2025-02-04T12:17:00Z',
     createdAt: '2025-02-04T12:15:00Z',
     updatedAt: '2025-02-04T12:17:00Z',
   },
 ];
 
 // Dashboard Analytics
 export const dashboardStats = {
   totalOrders: 156,
   totalRevenue: 892450,
   ordersInProgress: 12,
   deliveredOrders: 134,
   cancelledOrders: 10,
   averageOrderValue: 5720,
   weeklyGrowth: 12.5,
   monthlyRevenue: [
     { month: 'Sep', revenue: 65000 },
     { month: 'Oct', revenue: 78000 },
     { month: 'Nov', revenue: 92000 },
     { month: 'Dec', revenue: 145000 },
     { month: 'Jan', revenue: 112000 },
     { month: 'Feb', revenue: 89000 },
   ],
   ordersByStatus: [
     { status: 'Delivered', count: 134, color: 'hsl(142 70% 45%)' },
     { status: 'Shipped', count: 8, color: 'hsl(199 89% 48%)' },
     { status: 'Processing', count: 4, color: 'hsl(38 92% 50%)' },
     { status: 'Cancelled', count: 10, color: 'hsl(0 72% 51%)' },
   ],
 };