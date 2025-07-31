import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Medicine, MedicineRequest, UsageRecord, AlertItem } from '../types';

interface AppContextType {
  currentUser: User | null;
  medicines: Medicine[];
  requests: MedicineRequest[];
  usageRecords: UsageRecord[];
  alerts: AlertItem[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  submitRequest: (request: Omit<MedicineRequest, 'id' | 'requested_date' | 'status'>) => void;
  approveRequest: (requestId: string, notes?: string) => void;
  rejectRequest: (requestId: string, notes: string) => void;
  dispenseRequest: (requestId: string) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  recordUsage: (usage: Omit<UsageRecord, 'id' | 'date'>) => void;
  dismissAlert: (alertId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data
const sampleUsers: User[] = [
  { id: '1', name: 'Dr. Sarah Nakimuli', email: 'sarah.nakimuli@mpigi.ug', role: 'doctor', department: 'Pediatrics' },
  { id: '2', name: 'Dr. James Musoke', email: 'james.musoke@mpigi.ug', role: 'doctor', department: 'Internal Medicine' },
  { id: '3', name: 'Florence Namukasa', email: 'florence.namukasa@mpigi.ug', role: 'pharmacist', department: 'Pharmacy' },
  { id: '4', name: 'Administrator', email: 'admin@mpigi.ug', role: 'admin', department: 'Administration' }
];

const sampleMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    generic_name: 'Acetaminophen',
    category: 'Analgesic',
    manufacturer: 'Cipla Uganda',
    batch_number: 'PAR2024001',
    expiry_date: '2025-12-31',
    quantity_in_stock: 500,
    minimum_stock_level: 100,
    unit_price: 150,
    location: 'Shelf A1',
    description: 'Pain relief and fever reduction'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    generic_name: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'Quality Chemicals',
    batch_number: 'AMX2024002',
    expiry_date: '2025-06-30',
    quantity_in_stock: 75,
    minimum_stock_level: 50,
    unit_price: 800,
    location: 'Shelf B2',
    description: 'Broad spectrum antibiotic'
  },
  {
    id: '3',
    name: 'Insulin Glargine',
    generic_name: 'Insulin Glargine',
    category: 'Antidiabetic',
    manufacturer: 'Novo Nordisk',
    batch_number: 'INS2024003',
    expiry_date: '2025-03-15',
    quantity_in_stock: 25,
    minimum_stock_level: 20,
    unit_price: 15000,
    location: 'Refrigerator R1',
    description: 'Long-acting insulin'
  },
  {
    id: '4',
    name: 'Panadol Extra',
    generic_name: 'Paracetamol + Caffeine',
    category: 'Analgesic',
    manufacturer: 'GSK',
    batch_number: 'PAN2023015',
    expiry_date: '2025-01-20',
    quantity_in_stock: 200,
    minimum_stock_level: 75,
    unit_price: 250,
    location: 'Shelf A2',
    description: 'Enhanced pain relief'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>(sampleMedicines);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Generate alerts on mount and when data changes
  useEffect(() => {
    const newAlerts: AlertItem[] = [];
    
    // Check for expiring medicines (within 3 months)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    medicines.forEach(medicine => {
      const expiryDate = new Date(medicine.expiry_date);
      const monthsUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsUntilExpiry <= 3 && monthsUntilExpiry > 0) {
        newAlerts.push({
          id: `expiry-${medicine.id}`,
          type: 'expiry',
          message: `${medicine.name} expires on ${medicine.expiry_date}`,
          severity: monthsUntilExpiry <= 1 ? 'high' : 'medium',
          date: new Date().toISOString(),
          medicine_id: medicine.id
        });
      }
      
      // Check for low stock
      if (medicine.quantity_in_stock <= medicine.minimum_stock_level) {
        newAlerts.push({
          id: `stock-${medicine.id}`,
          type: 'stock',
          message: `${medicine.name} is running low (${medicine.quantity_in_stock} remaining)`,
          severity: medicine.quantity_in_stock === 0 ? 'high' : 'medium',
          date: new Date().toISOString(),
          medicine_id: medicine.id
        });
      }
    });
    
    // Check for pending requests
    const pendingRequests = requests.filter(req => req.status === 'pending');
    pendingRequests.forEach(request => {
      const daysSinceRequest = (Date.now() - new Date(request.requested_date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceRequest > 1) {
        newAlerts.push({
          id: `request-${request.id}`,
          type: 'request',
          message: `Pending request from ${request.doctor_name} for ${request.medicine_name}`,
          severity: daysSinceRequest > 3 ? 'high' : 'medium',
          date: new Date().toISOString(),
          request_id: request.id
        });
      }
    });
    
    setAlerts(newAlerts);
  }, [medicines, requests]);

  const login = (email: string, password: string): boolean => {
    const user = sampleUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const submitRequest = (request: Omit<MedicineRequest, 'id' | 'requested_date' | 'status'>) => {
    const newRequest: MedicineRequest = {
      ...request,
      id: Date.now().toString(),
      requested_date: new Date().toISOString(),
      status: 'pending'
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const approveRequest = (requestId: string, notes?: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'approved' as const,
            approved_date: new Date().toISOString(),
            approved_by: currentUser?.name || 'System',
            notes 
          }
        : req
    ));
  };

  const rejectRequest = (requestId: string, notes: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'rejected' as const,
            notes 
          }
        : req
    ));
  };

  const dispenseRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'dispensed' as const,
              dispensed_date: new Date().toISOString()
            }
          : req
      ));
      
      // Update medicine stock
      setMedicines(prev => prev.map(med => 
        med.id === request.medicine_id 
          ? { ...med, quantity_in_stock: med.quantity_in_stock - request.quantity_requested }
          : med
      ));
      
      // Record usage
      recordUsage({
        medicine_id: request.medicine_id,
        medicine_name: request.medicine_name,
        quantity_used: request.quantity_requested,
        used_by: request.doctor_name,
        department: request.department,
        purpose: request.reason
      });
    }
  };

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString()
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(med => 
      med.id === id ? { ...med, ...updates } : med
    ));
  };

  const recordUsage = (usage: Omit<UsageRecord, 'id' | 'date'>) => {
    const newUsage: UsageRecord = {
      ...usage,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setUsageRecords(prev => [...prev, newUsage]);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      medicines,
      requests,
      usageRecords,
      alerts,
      login,
      logout,
      submitRequest,
      approveRequest,
      rejectRequest,
      dispenseRequest,
      addMedicine,
      updateMedicine,
      recordUsage,
      dismissAlert
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};