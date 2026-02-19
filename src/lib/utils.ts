import { Timestamp } from 'firebase/firestore';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const formatFirebaseTimestamp = (
  timestamp: Timestamp | null | undefined
): string => {
  if (!timestamp) return '—';

  const date = timestamp.toDate();

  const time = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // set false if you want 24h
  });

  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${time} · ${formattedDate}`;
};
