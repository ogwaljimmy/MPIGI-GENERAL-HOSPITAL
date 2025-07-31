import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Calendar, 
  Package,
  Filter,
  Search,
  Clock
} from 'lucide-react';

const ExpiryMonitor: React.FC = () => {
  const { medicines, alerts, dismissAlert } = useApp();
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600 bg-red-100 border-red-200', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'critical', color: 'text-red-600 bg-red-100 border-red-200', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', color: 'text-orange-600 bg-orange-100 border-orange-200', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 180) {
      return { status: 'caution', color: 'text-yellow-600 bg-yellow-100 border-yellow-200', days: daysUntilExpiry };
    }
    return { status: 'good', color: 'text-green-600 bg-green-100 border-green-200', days: daysUntilExpiry };
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const expiryStatus = getExpiryStatus(medicine.expiry_date);
    
    switch (timeFilter) {
      case 'expired':
        return expiryStatus.status === 'expired';
      case 'critical':
        return expiryStatus.status === 'critical';
      case 'warning':
        return expiryStatus.status === 'warning';
      case 'caution':
        return expiryStatus.status === 'caution';
      case 'good':
        return expiryStatus.status === 'good';
      default:
        return true;
    }
  });

  const expiryAlerts = alerts.filter(alert => alert.type === 'expiry');

  const getStatusText = (status: string, days: number) => {
    switch (status) {
      case 'expired':
        return `Expired ${days} days ago`;
      case 'critical':
        return `Expires in ${days} days`;
      case 'warning':
        return `Expires in ${days} days`;
      case 'caution':
        return `Expires in ${days} days`;
      case 'good':
        return `Expires in ${days} days`;
      default:
        return '';
    }
  };

  const getUrgencyIcon = (status: string) => {
    switch (status) {
      case 'expired':
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'caution':
        return <Calendar className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expiry Monitor</h1>
        <div className="text-sm text-gray-600">
          {expiryAlerts.length} active expiry alerts
        </div>
      </div>

      {/* Alert Summary */}
      {expiryAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-orange-900">Expiry Alerts</h2>
          </div>
          <div className="space-y-2">
            {expiryAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="text-sm text-gray-900">{alert.message}</span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            ))}
            {expiryAlerts.length > 3 && (
              <p className="text-sm text-orange-700">
                And {expiryAlerts.length - 3} more alerts...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Items</option>
              <option value="expired">Expired</option>
              <option value="critical">Critical (≤30 days)</option>
              <option value="warning">Warning (≤90 days)</option>
              <option value="caution">Caution (≤180 days)</option>
              <option value="good">Good ({'>'}180 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expiry Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Expired', filter: 'expired', count: medicines.filter(m => getExpiryStatus(m.expiry_date).status === 'expired').length, color: 'bg-red-100 text-red-800' },
          { label: 'Critical', filter: 'critical', count: medicines.filter(m => getExpiryStatus(m.expiry_date).status === 'critical').length, color: 'bg-red-100 text-red-800' },
          { label: 'Warning', filter: 'warning', count: medicines.filter(m => getExpiryStatus(m.expiry_date).status === 'warning').length, color: 'bg-orange-100 text-orange-800' },
          { label: 'Caution', filter: 'caution', count: medicines.filter(m => getExpiryStatus(m.expiry_date).status === 'caution').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Good', filter: 'good', count: medicines.filter(m => getExpiryStatus(m.expiry_date).status === 'good').length, color: 'bg-green-100 text-green-800' }
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => setTimeFilter(item.filter)}
            className={`p-4 rounded-lg border-2 transition-all ${
              timeFilter === item.filter 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{item.count}</div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${item.color}`}>
                {item.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Medicine List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Medicine</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Batch</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Stock</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Expiry Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiry_date);
                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {getUrgencyIcon(expiryStatus.status)}
                        <div>
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-600">{medicine.generic_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{medicine.batch_number}</div>
                      <div className="text-xs text-gray-500">{medicine.manufacturer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">{medicine.quantity_in_stock}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {new Date(medicine.expiry_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${expiryStatus.color}`}>
                        {getStatusText(expiryStatus.status, expiryStatus.days)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{medicine.location}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medicines found matching the selected criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryMonitor;