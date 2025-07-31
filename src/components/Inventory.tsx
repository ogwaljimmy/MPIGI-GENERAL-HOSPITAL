import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  Edit, 
  Package, 
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';

const Inventory: React.FC = () => {
  const { medicines, updateMedicine, addMedicine, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    generic_name: '',
    category: '',
    manufacturer: '',
    batch_number: '',
    expiry_date: '',
    quantity_in_stock: 0,
    minimum_stock_level: 0,
    unit_price: 0,
    location: '',
    description: ''
  });

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || medicine.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicine(newMedicine);
    setNewMedicine({
      name: '',
      generic_name: '',
      category: '',
      manufacturer: '',
      batch_number: '',
      expiry_date: '',
      quantity_in_stock: 0,
      minimum_stock_level: 0,
      unit_price: 0,
      location: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const handleUpdateStock = (medicineId: string, newStock: number) => {
    updateMedicine(medicineId, { quantity_in_stock: newStock });
    setEditingMedicine(null);
  };

  const getStockStatus = (medicine: any) => {
    if (medicine.quantity_in_stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (medicine.quantity_in_stock <= medicine.minimum_stock_level) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    }
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1>
        {(currentUser?.role === 'pharmacist' || currentUser?.role === 'admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => {
          const stockStatus = getStockStatus(medicine);
          const expiringSoon = isExpiringSoon(medicine.expiry_date);
          
          return (
            <div key={medicine.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                  <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                </div>
                {expiringSoon && (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{medicine.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <div className="flex items-center space-x-2">
                    {editingMedicine === medicine.id ? (
                      <input
                        type="number"
                        defaultValue={medicine.quantity_in_stock}
                        className="w-16 px-2 py-1 text-sm border rounded"
                        onBlur={(e) => handleUpdateStock(medicine.id, parseInt(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStock(medicine.id, parseInt((e.target as HTMLInputElement).value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="text-sm font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => currentUser?.role !== 'doctor' && setEditingMedicine(medicine.id)}
                      >
                        {medicine.quantity_in_stock}
                      </span>
                    )}
                    {currentUser?.role !== 'doctor' && (
                      <Edit 
                        className="w-3 h-3 text-gray-400 cursor-pointer hover:text-blue-600"
                        onClick={() => setEditingMedicine(medicine.id)}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expiry:</span>
                  <span className={`text-sm ${expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                    {new Date(medicine.expiry_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium">{medicine.location}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium">UGX {medicine.unit_price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Batch: {medicine.batch_number} • {medicine.manufacturer}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Medicine</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.generic_name}
                    onChange={(e) => setNewMedicine({...newMedicine, generic_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.batch_number}
                    onChange={(e) => setNewMedicine({...newMedicine, batch_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newMedicine.expiry_date}
                    onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.quantity_in_stock}
                    onChange={(e) => setNewMedicine({...newMedicine, quantity_in_stock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.minimum_stock_level}
                    onChange={(e) => setNewMedicine({...newMedicine, minimum_stock_level: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (UGX)</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.unit_price}
                    onChange={(e) => setNewMedicine({...newMedicine, unit_price: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.location}
                    onChange={(e) => setNewMedicine({...newMedicine, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMedicine.description}
                  onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;