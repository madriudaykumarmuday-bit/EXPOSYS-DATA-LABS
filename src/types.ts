/**
 * Types for the Exposys Data Labs Premium Internship & Billing Portal
 */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  currentPeriodEnd: string;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardLast4: string;
  createdAt: string;
}

export interface InternshipApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  college: string;
  tenthPercentage: string;
  twelfthPercentage: string;
  ug: string;
  pg?: string;
  location: string;
  internshipDomain: string;
  internshipDuration: string;
  linkedin?: string;
  github?: string;
  skills?: string;
  whyHire?: string;
  resumeUrl?: string;
  notes?: string;
  status: ApplicationStatus;
  createdAt: string;
  
  // Immersive Stripe Subscription Details
  paymentId?: string;
  subscription?: StripeSubscription;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUser: string;
  createdAt: string;
}
