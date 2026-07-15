import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Box, ArrowRight, ArrowLeft, Image as ImageIcon, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/api/products';
import { collection, addDoc, Timestamp, DocumentReference } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { doc, runTransaction } from 'firebase/firestore';
import { CartItem, AddressFormValues } from '@/types/order';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/config/axios';
import { ProductSize } from '@/types/product';

interface CreateOrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveForm = {
  type: 'existing' | 'custom';
  index?: number;
} | null;

export function CreateOrderPanel({ isOpen, onClose }: CreateOrderPanelProps) {
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // We DO NOT reset state on close. Only on successful submission.
  // Step 1: User Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Address Details
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  // Step 3: Products
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeItemForm, setActiveItemForm] = useState<ActiveForm>(null);
  const [draftItem, setDraftItem] = useState<Partial<CartItem>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Step 4: Billing
  const [discount, setDiscount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>('');

  const resetForm = () => {
    setStep(1);
    setName(''); setPhone(''); setEmail('');
    setStreet(''); setArea(''); setCity(''); setStateName(''); setPincode(''); setCountry('India');
    setItems([]);
    setActiveItemForm(null);
    setDraftItem({});
    setDiscount(0);
    setTransactionId('');
  };

  // Validation Logic
  const canProceedStep1 = name.trim().length > 0 && phone.trim().length >= 10 && email.trim().length > 0;
  const canProceedStep2 = street.trim().length > 0 && city.trim().length > 0 && stateName.trim().length > 0 && pincode.trim().length > 0;
  const canProceedStep3 = items.length > 0 && activeItemForm === null;
  const canProceedStep4 = items.length > 0; // plus maybe valid amounts, checked on submit

  const handleOpenItemForm = (type: 'existing' | 'custom', index?: number) => {
    setActiveItemForm({ type, index });
    if (index !== undefined) {
      setDraftItem({ ...items[index] });
    } else {
      setDraftItem({
        isCustom: type === 'custom',
        quantity: 1,
        price: 0,
        name: '',
        sizeLabel: type === 'custom' ? 'Custom' : '',
        slug: type === 'custom' ? 'custom-slug' : '',
        productId: type === 'custom' ? `custom_${crypto.randomUUID()}` : '',
        sizeId: type === 'custom' ? 'custom-size' : ''
      });
    }
  };

  const handleCloseItemForm = () => {
    setActiveItemForm(null);
    setDraftItem({});
  };

  const handleSaveItemForm = () => {
    // Validate draft
    if (!draftItem.name || draftItem.price === undefined || draftItem.quantity === undefined || draftItem.quantity < 1) {
      alert("Please fill in all required item details.");
      return;
    }
    if (!draftItem.isCustom && (!draftItem.productId || !draftItem.sizeId)) {
      alert("Please select a catalog product and size.");
      return;
    }

    const newItem = draftItem as CartItem;

    if (activeItemForm?.index !== undefined) {
      const newItems = [...items];
      newItems[activeItemForm.index] = newItem;
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }

    handleCloseItemForm();
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'custom_orders');
      setDraftItem(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-fill existing product logic
  const handleSelectCatalogProduct = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setDraftItem(prev => ({
        ...prev,
        productId,
        name: selectedProduct.name,
        slug: selectedProduct.slug,
        image: selectedProduct.images?.[0] || '',
        sizeId: '',
        sizeLabel: '',
        price: 0
      }));
    }
  };

  const handleSelectCatalogSize = (sizeId: string) => {
    const selectedProduct = products.find(p => p.id === draftItem.productId);
    const selectedSize = selectedProduct?.sizes.find(s => s.sizeId === sizeId);
    if (selectedSize && selectedProduct) {
      setDraftItem(prev => ({
        ...prev,
        sizeId,
        sizeLabel: selectedSize.label,
        price: selectedProduct.originalPrice - (selectedProduct.discount || 0) + (selectedSize.priceAdjustment || 0)
      }));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = Math.max(0, subtotal - discount);

  // const handleSubmit = async () => {
  //   if (!canProceedStep4) return;

  //   setIsLoading(true);
  //   try {
  //     const paymentId = `manual_${crypto.randomUUID()}`;
      
  //     const address: AddressFormValues = {
  //       name,
  //       phone,
  //       email,
  //       street,
  //       area,
  //       city,
  //       state: stateName,
  //       pincode,
  //       country,
  //       type: 'home'
  //     };

  //     const orderData = {
  //       items,
  //       address,
  //       paymentStatus: transactionId ? "Paid" : "Pending",
  //       total: subtotal,
  //       discount,
  //       finalAmount,
  //       status: "CONFIRMED",
  //       createdAt: Timestamp.now(),
  //       updatedAt: Timestamp.now(),
  //     };


  //     const orderRef = await addDoc(collection(db, 'orders'), orderData);

  //     //payment calculations

  //     let subTotal = 0;
  //     let totalCGST = 0;
  //     let totalSGST = 0;

  //     items.forEach((item)=>{
  //           const itemInclusiveTotal = (item.price * item.quantity);
  //           const taxableValue = itemInclusiveTotal ;
  //           const cgst = taxableValue * 0.015;
  //           const sgst = taxableValue * 0.015;

  //           subTotal = subTotal + (item.price * item.quantity);
  //           totalCGST = totalCGST + cgst;
  //           totalSGST = totalSGST + sgst;
  //     })

  //     const shippingCharges = 0;

  //     const paymentAmount = subTotal - discount + totalCGST + totalSGST + shippingCharges;

      
      
  //     await addDoc(collection(db, "payments"), {
  //       orderId: orderRef.id,
  //       paymentId,
  //       method: "MANUAL",
  //       amount: paymentAmount,
  //       status: transactionId ? "Successful" : "Pending",
  //       transactionId: transactionId || null,
  //       createdAt: Timestamp.now(),
  //       updatedAt: Timestamp.now(),
  //     });

  //     //generate Invoice
  //     await apiClient.post("/api/invoice/generate",{
  //       orderId: orderRef.id,
  //     });

  //     //send email 
  //     await apiClient.post("/api/order/send-order-email",{
  //       orderId: orderRef.id,
  //     })


  //     // Invalidate orders query to refresh the list
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });

  //     alert("Order created successfully!");
  //     resetForm();
  //     onClose();
  //   } catch (error) {
  //     console.error("Error creating manual order:", error);
  //     alert("Failed to create order.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!canProceedStep4) return;

    setIsLoading(true);

    try {
      const paymentId = `manual_${crypto.randomUUID()}`;

      const address: AddressFormValues = {
        name,
        phone,
        email,
        street,
        area,
        city,
        state: stateName,
        pincode,
        country,
        type: "home",
      };

      const orderData = {
        items,
        address,
        paymentStatus: transactionId ? "Paid" : "Pending",
        total: subtotal,
        discount,
        finalAmount,
        status: "CONFIRMED",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Payment calculations
      let subTotal = 0;
      let totalCGST = 0;
      let totalSGST = 0;

      items.forEach((item) => {
        const itemInclusiveTotal = item.price * item.quantity;
        const taxableValue = itemInclusiveTotal;

        const cgst = taxableValue * 0.015;
        const sgst = taxableValue * 0.015;

        subTotal += itemInclusiveTotal;
        totalCGST += cgst;
        totalSGST += sgst;
      });

      const shippingCharges = 0;

      const paymentAmount =
        subTotal -
        discount +
        totalCGST +
        totalSGST +
        shippingCharges;

      let orderId = "";

      await runTransaction(db, async (transaction) => {
        const orderRef = doc(collection(db, "orders"));
        const paymentRef = doc(collection(db, "payments"));

        orderId = orderRef.id;

        // Store product updates until after all reads
        const productUpdates: {
          ref: DocumentReference;
          updatedSizes: ProductSize[];
        }[] = [];

        // -------------------------
        // 1. READ EVERYTHING FIRST
        // -------------------------
        for (const item of items) {
          if (!item.isCustom && item.productId && item.sizeId) {
            const productRef = doc(db, "products", item.productId);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists()) {
              throw new Error(`Product not found.`);
            }

            const productData = productSnap.data();
            const sizes = productData.sizes || [];

            const updatedSizes = sizes.map((s: ProductSize) => {
              if (s.sizeId === item.sizeId) {
                if ((s.stock || 0) < item.quantity) {
                  throw new Error(
                    `${productData.name} (${s.label}) has only ${s.stock} item(s) left.`
                  );
                }

                return {
                  ...s,
                  stock: s.stock - item.quantity,
                };
              }

              return s;
            });

            productUpdates.push({
              ref: productRef,
              updatedSizes,
            });
            }
          }

          // -------------------------
          // 2. NOW DO ALL WRITES
          // -------------------------

          transaction.set(orderRef, orderData);

          transaction.set(paymentRef, {
            orderId,
            paymentId,
            method: "MANUAL",
            amount: paymentAmount,
            status: transactionId ? "Successful" : "Pending",
            transactionId: transactionId || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          for (const update of productUpdates) {
            transaction.update(update.ref, {
              sizes: update.updatedSizes,
            });
          }
      });

      // Generate Invoice
      await apiClient.post("/api/invoice/generate", {
        orderId,
      });

      // Send Order Email
      await apiClient.post("/api/order/send-order-email", {
        orderId,
      });

      // Refresh orders list
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      alert("Order created successfully!");

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating manual order:", error);
      alert("Failed to create order.");
    } finally {
      setIsLoading(false);
    }
  };
  const nextStep = () => {
    if (step === 1 && !canProceedStep1) return;
    if (step === 2 && !canProceedStep2) return;
    if (step === 3 && !canProceedStep3) return;
    setStep(s => Math.min(s + 1, 4) as typeof step);
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1) as typeof step);

  // Helper to determine if Next button should be disabled
  const isNextDisabled = () => {
    if (step === 1) return !canProceedStep1;
    if (step === 2) return !canProceedStep2;
    if (step === 3) return !canProceedStep3;
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-card shadow-2xl z-[110] border-l border-border overflow-y-auto flex flex-col"
          >
            <div className="sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Order</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 4</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-muted/10">
              
              {/* Step 1: User Details */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">User Details</h3>
                    <p className="text-sm text-muted-foreground">Enter the customer's contact information.</p>
                  </div>
                  
                  <div className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="space-y-2">
                      <Label>Customer Name <span className="text-destructive">*</span></Label>
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number <span className="text-destructive">*</span></Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email <span className="text-destructive">*</span></Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@example.com" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address Details */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Delivery Address</h3>
                    <p className="text-sm text-muted-foreground">Where should the order be shipped?</p>
                  </div>
                  
                  <div className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="space-y-2">
                      <Label>Street Address <span className="text-destructive">*</span></Label>
                      <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="House No, Street, Landmark" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Area / Locality</Label>
                        <Input value={area} onChange={e => setArea(e.target.value)} placeholder="Area" />
                      </div>
                      <div className="space-y-2">
                        <Label>City <span className="text-destructive">*</span></Label>
                        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State <span className="text-destructive">*</span></Label>
                        <Input value={stateName} onChange={e => setStateName(e.target.value)} placeholder="State" />
                      </div>
                      <div className="space-y-2">
                        <Label>PIN Code <span className="text-destructive">*</span></Label>
                        <Input value={pincode} onChange={e => setPincode(e.target.value)} placeholder="PIN Code" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Products */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Order Items</h3>
                    <p className="text-sm text-muted-foreground">Add products to this order.</p>
                  </div>

                  {!activeItemForm && (
                    <div className="flex gap-4 mb-6">
                      <Button onClick={() => handleOpenItemForm('existing')} variant="outline" className="flex-1 border-primary/50 text-primary hover:bg-primary/5">
                        <Plus className="w-4 h-4 mr-2" /> Catalog Product
                      </Button>
                      <Button onClick={() => handleOpenItemForm('custom')} variant="outline" className="flex-1 border-purple-500/50 text-purple-600 hover:bg-purple-50">
                        <Plus className="w-4 h-4 mr-2" /> Custom Product
                      </Button>
                    </div>
                  )}

                  {/* Sub-form for adding/editing an item - Now ABOVE the list */}
                  {activeItemForm && (
                    <div className="bg-card border border-border shadow-md rounded-xl overflow-hidden animate-in fade-in zoom-in-95 mb-6">
                      <div className={`p-4 border-b border-border flex justify-between items-center ${activeItemForm.type === 'custom' ? 'bg-purple-50/50' : 'bg-primary/5'}`}>
                        <h4 className={`font-semibold flex items-center gap-2 ${activeItemForm.type === 'custom' ? 'text-purple-700' : 'text-primary'}`}>
                          {activeItemForm.index !== undefined ? 'Update' : 'Add'} {activeItemForm.type === 'custom' ? 'Custom Product' : 'Catalog Product'}
                        </h4>
                        <Button variant="ghost" size="icon" onClick={handleCloseItemForm} className="h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* CUSTOM ITEM FORM */}
                        {activeItemForm.type === 'custom' && (
                          <>
                            <div className="flex gap-4">
                              {/* Image Upload */}
                              <div className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden bg-muted/30 group">
                                {draftItem.image ? (
                                  <>
                                    <img src={draftItem.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Label htmlFor="custom-image-upload" className="text-white text-xs cursor-pointer hover:underline">Change</Label>
                                    </div>
                                  </>
                                ) : (
                                  <Label htmlFor="custom-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                                    <span className="text-[10px] text-muted-foreground font-medium text-center px-2">Upload Image</span>
                                  </Label>
                                )}
                                <input title='images-input' id="custom-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                  <Label className="text-xs">Product Name <span className="text-destructive">*</span></Label>
                                  <Input className="h-9" value={draftItem.name || ''} onChange={e => setDraftItem({...draftItem, name: e.target.value})} placeholder="e.g. 22K Gold Chain" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Size / Variant Label <span className="text-destructive">*</span></Label>
                                  <Input className="h-9" value={draftItem.sizeLabel || ''} onChange={e => setDraftItem({...draftItem, sizeLabel: e.target.value})} placeholder="e.g. 18 Inches" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs">Internal Notes</Label>
                              <Textarea value={draftItem.notes || ''} onChange={e => setDraftItem({...draftItem, notes: e.target.value})} placeholder="Specific design requirements, material notes..." className="h-20 text-sm" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-xs">Unit Price (₹) <span className="text-destructive">*</span></Label>
                                <Input className="h-9" type="number" min="0" value={draftItem.price || ''} onChange={e => setDraftItem({...draftItem, price: Number(e.target.value)})} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Quantity <span className="text-destructive">*</span></Label>
                                <Input className="h-9" type="number" min="1" value={draftItem.quantity || ''} onChange={e => setDraftItem({...draftItem, quantity: Number(e.target.value)})} />
                              </div>
                            </div>
                          </>
                        )}

                        {/* EXISTING CATALOG FORM */}
                        {activeItemForm.type === 'existing' && (
                          <>
                            {draftItem.image && (
                              <div className="w-full h-32 rounded-lg bg-muted border border-border overflow-hidden mb-4">
                                <img src={draftItem.image} alt={draftItem.name} className="w-full h-full object-contain" />
                              </div>
                            )}
                            <div className="space-y-1">
                              <Label className="text-xs">Select Product <span className="text-destructive">*</span></Label>
                              <Select value={draftItem.productId || ''} onValueChange={handleSelectCatalogProduct}>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Search product..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs">Select Size <span className="text-destructive">*</span></Label>
                              <Select 
                                value={draftItem.sizeId || ''} 
                                onValueChange={handleSelectCatalogSize}
                                disabled={!draftItem.productId}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select size..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {draftItem.productId && products.find(p => p.id === draftItem.productId)?.sizes.map(s => (
                                    <SelectItem disabled={s.stock==0} key={s.sizeId} value={s.sizeId}>{s.label} (+₹{s.priceAdjustment || 0})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Unit Price (₹)</Label>
                                <Input className="h-9 bg-muted" type="number" value={draftItem.price || 0} readOnly disabled />
                                <p className="text-[10px] text-muted-foreground mt-1">Auto-calculated</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Quantity <span className="text-destructive">*</span></Label>
                                <Input className="h-9" type="number" min="1" value={draftItem.quantity || ''} onChange={e => setDraftItem({...draftItem, quantity: Number(e.target.value)})} />
                              </div>
                            </div>
                          </>
                        )}
                        
                        <div className="flex gap-3 pt-4 border-t border-border mt-6">
                          <Button variant="outline" className="flex-1" onClick={handleCloseItemForm}>Cancel</Button>
                          <Button className="flex-1" onClick={handleSaveItemForm}>
                            {activeItemForm.index !== undefined ? 'Save Changes' : 'Add Item'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="group relative p-2 flex gap-4 bg-card border border-border shadow-sm rounded-xl transition-all hover:shadow-md">
                        <div className="w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0 border border-border">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.name || 'Unnamed Item'}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.isCustom ? (
                              <span className="text-purple-600 font-medium">Custom Product</span>
                            ) : (
                              <span>Catalog Product</span>
                            )}
                            <span className="mx-2">•</span>
                            Size: {item.sizeLabel}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium">₹{item.price} x {item.quantity}</span>
                            <span className="text-sm font-bold text-primary">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <button 
                            className="pointer-events-auto absolute top-2 right-2 w-5 h-5 border border-rose-400 bg-rose-100  text-rose-400 rounded-full flex items-center justify-center transition-colors shadow-sm"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }}
                            title="Remove Item"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          <button 
                            title="Edit Item"
                            className="pointer-events-auto absolute top-2 left-2 bg-primary text-muted p-1.5 rounded-md text-xs font-semibold flex items-center transition-colors shadow-sm"
                            onClick={(e) => { e.stopPropagation(); handleOpenItemForm(item.isCustom ? 'custom' : 'existing', idx); }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground bg-card border border-dashed rounded-xl shadow-sm text-sm">
                        <Box className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        No items added yet. Click above to add a product.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Billing & Submit */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Billing & Payment</h3>
                    <p className="text-sm text-muted-foreground">Review order total and enter transaction ID.</p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                    <div className="space-y-3 mb-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground line-clamp-1 flex-1 pr-4">{item.name || 'Unnamed Item'} (x{item.quantity})</span>
                          <span className="font-medium shrink-0">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Subtotal</span>
                        <span className="font-semibold text-foreground">₹{subtotal}</span>
                      </div>
                      
                      <div className="flex justify-between items-center gap-4">
                        <Label className="text-muted-foreground font-medium shrink-0">Custom Discount (₹)</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          value={discount} 
                          onChange={e => setDiscount(Number(e.target.value))}
                          className="text-right w-32 h-9"
                        />
                      </div>

                      <div className="h-px bg-border my-4" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-foreground">Final Amount</span>
                        <span className="text-xl font-bold text-primary">₹{finalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <Label className="flex items-center gap-2">
                      Transaction ID 
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">Optional</span>
                    </Label>
                    <Input 
                      value={transactionId} 
                      onChange={e => setTransactionId(e.target.value)} 
                      placeholder="e.g. txn_1234567890" 
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If provided, the payment status will automatically be marked as <strong className="text-foreground">"Successful"</strong>. Otherwise, it defaults to <strong className="text-foreground">"Pending"</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-card/50 flex justify-between shrink-0">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : <div />}
              
              {step < 4 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={isNextDisabled()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !canProceedStep4}
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm Order'}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
