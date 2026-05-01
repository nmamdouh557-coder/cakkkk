export type Role = 'admin' | 'employee';
export type OfferStatus = 'active' | 'upcoming' | 'expired';
export type NotificationType = 'new_offer' | 'update_offer';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Offer {
  id: string;
  brand: string;
  title: string;
  description: string;
  productPrice?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  status: OfferStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    displayName: string;
  };
}

export const BRANDS = ['Shakir', 'Yelo', 'BBT', 'Slice', 'Pattie', 'Chili', 'Just C', 'Mishmash', 'Table'];

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read?: boolean;
}
