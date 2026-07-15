import { Order } from "@/types/order";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price?: number) => {
  if (price === undefined || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}


export const statusDisable = (status:Order['status'],value:string)=>{
  switch (status) {
    case 'CONFIRMED':
      if (value == 'SHIPPED' || value == 'CANCELLED') {
        return false;
      }
      return true;
    case 'SHIPPED':
      if (value == 'DELIVERED' || value == 'CANCELLED') {
        return false;
      }
      return true;
    case 'DELIVERED':
      return true;
    
    case 'CANCELLED':
      return true;
      
    default: 
      return false;
  }
}