/**
 * Types for Airstar Fashion Home
 */

export type Role = 'CUSTOMER' | 'TAILOR' | 'DESIGNER' | 'ADMIN';

export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'DESIGN_REVIEW'
  | 'FABRIC_SELECTION'
  | 'PATTERN_DRAFTING'
  | 'CUTTING'
  | 'SEWING'
  | 'FIRST_FITTING'
  | 'ALTERATIONS'
  | 'QUALITY_INSPECTION'
  | 'PACKAGING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED';

export type AppointmentType =
  | 'MEASUREMENT_SESSION'
  | 'CONSULTATION'
  | 'BRIDAL_CONSULTATION'
  | 'FITTING_SESSION'
  | 'PICKUP_APPOINTMENT'
  | 'ALTERATION_APPOINTMENT';

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED';

export type MaterialCategory =
  | 'FABRIC'
  | 'LACE'
  | 'ANKARA'
  | 'SILK'
  | 'SATIN'
  | 'CREPE'
  | 'VELVET'
  | 'LINING'
  | 'THREAD'
  | 'BUTTON'
  | 'ZIPPER'
  | 'BEAD'
  | 'STONE'
  | 'ACCESSORY';

export interface MeasurementProfile {
  id: string;
  profileName: string;
  bust: number;
  upperBust: number;
  underBust: number;
  waist: number;
  hip: number;
  shoulderWidth: number;
  acrossChest: number;
  backWidth: number;
  sleeveLength: number;
  armCircumference: number;
  biceps: number;
  wrist: number;
  neck: number;
  dressLength: number;
  skirtLength: number;
  blouseLength: number;
  topLength: number;
  trouserLength: number;
  thigh: number;
  knee: number;
  ankle: number;
  height: number;
  heelHeightPref: number;
  braCupSize?: string;
  createdAt: string;
}

export interface CustomOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  category: string;
  dressType: string;
  fabricPreference: string;
  colorPreference: string;
  sleeveStyle: string;
  neckline: string;
  silhouetteLength: string;
  fitStyle: string;
  liningPreference: string;
  closureType: string;
  embellishments: string[];
  accessories: string[];
  specialInstructions?: string;
  inspirationImages: string[];
  status: OrderStatus;
  progressPercentage: number;
  totalAmount: number;
  depositPaid: number;
  measurementProfile: MeasurementProfile;
  createdAt: string;
  statusHistory: {
    status: OrderStatus;
    updatedAt: string;
    notes: string;
  }[];
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
  associatedProduct?: CollectionItem;
  attachedFile?: { name: string; size: number; type: string; base64: string };
  attachedAudio?: { name: string; size: number; type: string; base64: string };
  attachedVideo?: { name: string; size: number; type: string; base64: string };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unitOfMeasure: string;
  lowStockAlert: number;
  supplierName?: string;
  supplierEmail?: string;
  costPerUnit: number;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  category: 'Bridal' | 'Ready-to-Wear' | 'Traditional' | 'Evening Wear' | 'Corporate';
  description: string;
  image: string;
  price: number;
  fabrics: string[];
  silhouette: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'PENDING' | 'REVIEWED' | 'ANSWERED';
}
