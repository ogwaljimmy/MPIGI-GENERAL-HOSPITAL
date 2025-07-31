export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'pharmacist' | 'admin';
  department?: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  quantity_in_stock: number;
  minimum_stock_level: number;
  unit_price: number;
  location: string;
  description?: string;
}

export interface MedicineRequest {
  id: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  medicine_id: string;
  medicine_name: string;
  quantity_requested: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'dispensed';
  requested_date: string;
  approved_date?: string;
  dispensed_date?: string;
  approved_by?: string;
  notes?: string;
}

export interface UsageRecord {
  id: string;
  medicine_id: string;
  medicine_name: string;
  quantity_used: number;
  used_by: string;
  department: string;
  date: string;
  purpose: string;
}

export interface AlertItem {
  id: string;
  type: 'expiry' | 'stock' | 'request';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  medicine_id?: string;
  request_id?: string;
}