import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { medicines, requests, usageRecords } = useApp();
  const [timeRange, setTimeRange] = useState('30');

  // Calculate analytics data
  const getAnalytics = () => {
    const now = new Date();
    const daysBack = parseInt(timeRange);
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    const recentRequests = requests.filter(r => new Date(r.requested_date) >= startDate);
    const recentUsage = usageRecords.filter(u => new Date(u.date) >= startDate);

    // Top requested medicines
    const requestCounts = recentRequests.reduce((acc, request) => {
      acc[request.medicine_name] = (acc[request.medicine_name] || 0) + request.quantity_requested;
      return acc;
    }, {} as Record<string, number>);

    const topRequested = Object.entries(requestCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Usage by department
    const departmentUsage = recentUsage.reduce((acc, usage) => {
      acc[usage.department] = (acc[usage.department] || 0) + usage.quantity_used;
      return acc;
    }, {} as Record<string, number>);

    // Request status distribution
    const statusCounts = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category analysis
    const categoryUsage = recentUsage.reduce((acc, usage) => {
      const medicine = medicines.find(m => m.id === usage.medicine_id);
      if (medicine) {
        acc[medicine.category] = (acc[medicine.category] || 0) + usage.quantity_used;
      }
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthRequests = requests.filter(r => {
        const requestDate = new Date(r.requested_date);
        return requestDate >= monthStart && requestDate <= monthEnd;
      }).length;

      const monthUsage = usageRecords.filter(u => {
        const usageDate = new Date(u.date);
        return usageDate >= monthStart && usageDate <= monthEnd;
      }).reduce((sum, u) => sum + u.quantity_used, 0);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        requests: monthRequests,
        usage: monthUsage
      });
    }

    return {
      totalRequests: recentRequests.length,
      totalUsage: recentUsage.reduce((sum, u) => sum + u.quantity_used, 0),
      avgResponseTime: 2.5, // Mock data
      costSavings: 15000, // Mock data
      topRequested,
      departmentUsage: Object.entries(departmentUsage).sort(([,a], [,b]) => b - a),
      statusCounts,
      categoryUsage: Object.entries(categoryUsage).sort(([,a], [,b]) => b - a),
      monthlyData
    };
  };

  const analytics = getAnalytics();

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BarChart = ({ data, title, color }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item[1]));
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.slice(0, 8).map(([name, value]: [string, number], index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 truncate">{name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${color} h-2 rounded-full`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-sm font-medium text-gray-900 text-right">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={analytics.totalRequests}
          icon={BarChart3}
          color="bg-blue-500"
          subtitle={`Last ${timeRange} days`}
        />
        <StatCard
          title="Medicine Usage"
          value={analytics.totalUsage}
          icon={Activity}
          color="bg-green-500"
          subtitle="Units dispensed"
        />
        <StatCard
          title="Avg Response Time"
          value={`${analytics.avgResponseTime}h`}
          icon={Calendar}
          color="bg-orange-500"
          subtitle="Request to approval"
        />
        <StatCard
          title="Cost Savings"
          value={`UGX ${analytics.costSavings.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="This month"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={analytics.topRequested}
          title="Most Requested Medicines"
          color="bg-blue-500"
        />
        
        <BarChart
          data={analytics.departmentUsage}
          title="Usage by Department"
          color="bg-green-500"
        />
        
        <BarChart
          data={analytics.categoryUsage}
          title="Usage by Category"
          color="bg-purple-500"
        />

        {/* Request Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const total = Object.values(analytics.statusCounts).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);
              const colors = {
                pending: 'bg-yellow-500',
                approved: 'bg-green-500',
                rejected: 'bg-red-500',
                dispensed: 'bg-blue-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`} />
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Requests</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Usage</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyData.map((month, index) => {
                const prevMonth = analytics.monthlyData[index - 1];
                const trend = prevMonth 
                  ? ((month.requests - prevMonth.requests) / prevMonth.requests * 100).toFixed(1)
                  : 0;
                
                return (
                  <tr key={month.month} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{month.month}</td>
                    <td className="py-3 text-gray-600">{month.requests}</td>
                    <td className="py-3 text-gray-600">{month.usage}</td>
                    <td className="py-3">
                      <div className={`flex items-center space-x-1 text-sm ${
                        parseFloat(trend.toString()) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${
                          parseFloat(trend.toString()) < 0 ? 'rotate-180' : ''
                        }`} />
                        <span>{Math.abs(parseFloat(trend.toString()))}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;