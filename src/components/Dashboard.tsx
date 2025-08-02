import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Pill, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { medicines, requests, alerts, usageRecords, currentUser } = useApp();

  const stats = {
    totalMedicines: medicines.length,
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    lowStockItems: medicines.filter(m => m.quantity_in_stock <= m.minimum_stock_level).length,
    expiringItems: alerts.filter(a => a.type === 'expiry').length,
    totalUsage: usageRecords.reduce((sum, record) => sum + record.quantity_used, 0),
    recentRequests: requests.slice(-5).reverse()
  };

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      icon: Pill,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockItems,
      icon: Package,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringItems,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'dispensed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {useApp().currentUser?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentRequests.length > 0 ? (
              stats.recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <p className="font-medium text-gray-900 text-sm">{request.medicine_name}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {request.doctor_name} • {request.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Qty: {request.quantity_requested}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent requests</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  alert.severity === 'high' 
                    ? 'bg-red-100' 
                    : alert.severity === 'medium' 
                    ? 'bg-yellow-100' 
                    : 'bg-blue-100'
                }`}>
                  <AlertTriangle className={`w-3 h-3 ${
                    alert.severity === 'high' 
                      ? 'text-red-600' 
                      : alert.severity === 'medium' 
                      ? 'text-yellow-600' 
                      : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{alert.type} alert</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-center py-8">No active alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(currentUser?.role === 'doctor' || currentUser?.role === 'admin') && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openNewRequest'))}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Submit New Request</span>
            </button>
          )}
          {(currentUser?.role === 'pharmacist' || currentUser?.role === 'admin') && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openAddMedicine'))}
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Pill className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Add Medicine</span>
            </button>
          )}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('viewAnalytics'))}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;