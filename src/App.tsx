import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Requests from './components/Requests';
import ExpiryMonitor from './components/ExpiryMonitor';
import Analytics from './components/Analytics';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);

  // Listen for custom events from dashboard quick actions
  React.useEffect(() => {
    const handleOpenNewRequest = () => {
      setActiveTab('requests');
      setTimeout(() => setShowNewRequestModal(true), 100);
    };
    
    const handleOpenAddMedicine = () => {
      setActiveTab('inventory');
      setTimeout(() => setShowAddMedicineModal(true), 100);
    };
    
    const handleViewAnalytics = () => {
      setActiveTab('analytics');
    };

    window.addEventListener('openNewRequest', handleOpenNewRequest);
    window.addEventListener('openAddMedicine', handleOpenAddMedicine);
    window.addEventListener('viewAnalytics', handleViewAnalytics);

    return () => {
      window.removeEventListener('openNewRequest', handleOpenNewRequest);
      window.removeEventListener('openAddMedicine', handleOpenAddMedicine);
      window.removeEventListener('viewAnalytics', handleViewAnalytics);
    };
  }, []);

  if (!currentUser) {
    return <Login />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory showAddModal={showAddMedicineModal} setShowAddModal={setShowAddMedicineModal} />;
      case 'requests':
        return <Requests showNewRequestModal={showNewRequestModal} setShowNewRequestModal={setShowNewRequestModal} />;
      case 'expiry':
        return <ExpiryMonitor />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;