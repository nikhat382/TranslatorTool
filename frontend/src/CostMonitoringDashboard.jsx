import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Activity, Database, BarChart3, FileText, Zap, PieChart, Calendar, RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react';

const CostMonitoringDashboard = ({ token, apiUrl, user, sessionStartTime }) => {
  const [costSummary, setCostSummary] = useState(null);
  const [documentCosts, setDocumentCosts] = useState([]);
  const [serviceCosts, setServiceCosts] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'all', '7days', '30days'
  const [showTrends, setShowTrends] = useState(false);
  const [dataView, setDataView] = useState('historical'); // 'historical' or 'session'

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, dateRange, dataView]);

  const getDateRangeParams = () => {
    // If session view, use session start time
    if (dataView === 'session' && sessionStartTime) {
      return {
        startDate: sessionStartTime,
        endDate: new Date().toISOString()
      };
    }

    // Otherwise use date range selector
    if (dateRange === 'all') return {};

    const endDate = new Date().toISOString();
    const startDate = new Date();

    if (dateRange === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString(),
      endDate
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const dateParams = getDateRangeParams();
      const queryString = new URLSearchParams(dateParams).toString();

      // Fetch all data in parallel
      const [summaryRes, documentsRes, servicesRes, cacheRes, trendsRes] = await Promise.all([
        fetch(`${apiUrl}/analytics/costs/summary?${queryString}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/analytics/costs/by-document?${queryString}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/analytics/costs/by-service?${queryString}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/analytics/cache/stats?${queryString}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/analytics/costs/trends?days=30`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const summary = await summaryRes.json();
      const documents = await documentsRes.json();
      const services = await servicesRes.json();
      const cache = await cacheRes.json();
      const trends = await trendsRes.json();

      if (summary.success) setCostSummary(summary.data);
      if (documents.success) setDocumentCosts(documents.data.documents);
      if (services.success) setServiceCosts(services.data.services);
      if (cache.success) setCacheStats(cache.data);
      if (trends.success) setDailyTrends(trends.data.trends);

    } catch (err) {
      console.error('Failed to fetch cost data:', err);
      setError('Failed to load cost monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'purple', trend }) => (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-${color}-500/50 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 text-${color}-400`} />
            <h3 className="text-sm font-medium text-slate-300">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const ServiceBreakdownChart = ({ services }) => {
    const total = services.reduce((sum, s) => sum + parseFloat(s.cost), 0);

    const getServiceColor = (name) => {
      switch(name.toLowerCase()) {
        case 'gemini': return 'bg-blue-500';
        case 'gpt': return 'bg-green-500';
        case 'claude': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className="space-y-3">
        {services.map((service, idx) => {
          const percentage = total > 0 ? (parseFloat(service.cost) / total * 100).toFixed(1) : 0;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium capitalize">{service.name}</span>
                <span className="text-white font-bold">${parseFloat(service.cost).toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getServiceColor(service.name)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-12 text-right">{percentage}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                <div>Calls: {service.call_count}</div>
                <div>Tokens: {service.tokens?.total?.toLocaleString() || 0}</div>
                <div>Avg: {service.avg_latency_ms}ms</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !costSummary) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
        {error}
      </div>
    );
  }

  if (!costSummary) {
    return (
      <div className="text-center py-12 text-slate-400">
        No cost data available yet. Start translating documents to see statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-purple-400" />
              API Cost Monitoring Dashboard
            </h2>
            <p className="text-slate-400 text-sm mt-1">Track your API usage and costs across all services</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            {dailyTrends.length > 0 && (
              <button
                onClick={() => setShowTrends(!showTrends)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                title="Toggle Daily Cost Trends"
              >
                <Calendar className="w-4 h-4 text-purple-400" />
                Trends
                {showTrends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Time Period: All Time</option>
              <option value="7days">Time Period: Last 7 Days</option>
              <option value="30days">Time Period: Last 30 Days</option>
            </select>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Data View Tabs */}
        <div className="mt-4 flex gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setDataView('historical')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dataView === 'historical'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            📊 Historical Data (Accumulated)
          </button>
          <button
            onClick={() => setDataView('session')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              dataView === 'session'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            🕐 Current Session Data
          </button>
        </div>

        {/* Data View Info Badge */}
        {dataView === 'session' && sessionStartTime && (
          <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="text-green-300 font-medium">Showing Current Session Data</span>
              <span className="text-slate-400"> • Session started: {new Date(sessionStartTime).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        {dataView === 'session' && !sessionStartTime && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-300">
              No active session detected. Showing all data.
            </div>
          </div>
        )}

        {/* Daily Trends - Collapsible */}
        {showTrends && dailyTrends.length > 0 && (
          <div className="mt-4 bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 animate-in slide-in-from-top">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Daily Cost Trends (Last 30 Days)
            </h3>

            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Simple bar chart */}
                <div className="flex items-end gap-1 h-48">
                  {dailyTrends.slice(0, 30).reverse().map((day, idx) => {
                    const maxCost = Math.max(...dailyTrends.map(d => parseFloat(d.daily_cost)));
                    const height = maxCost > 0 ? (parseFloat(day.daily_cost) / maxCost * 100) : 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 group relative cursor-pointer"
                      >
                        <div className="flex flex-col items-center h-full justify-end">
                          <div
                            className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t hover:from-purple-500 hover:to-blue-400 transition-all"
                            style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0' }}
                          />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                            <div className="font-semibold text-white mb-2">{new Date(day.date).toLocaleDateString()}</div>
                            <div className="space-y-1 text-slate-300">
                              <div>Total: ${day.daily_cost}</div>
                              <div className="text-blue-400">Gemini: ${day.gemini_cost}</div>
                              <div className="text-green-400">GPT: ${day.gpt_cost}</div>
                              <div className="text-purple-400">Claude: ${day.claude_cost}</div>
                              <div className="text-slate-400">Calls: {day.call_count}</div>
                              <div className="text-slate-400">Cache Hits: {day.cache_hits}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels (show every 5th date) */}
                <div className="flex gap-1 mt-2">
                  {dailyTrends.slice(0, 30).reverse().map((day, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      {idx % 5 === 0 && (
                        <span className="text-xs text-slate-400">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total API Cost"
          value={`$${costSummary.total_cost}`}
          subtitle={`Quota: $${costSummary.quota_limit}`}
          color="purple"
        />
        <StatCard
          icon={Activity}
          title="API Calls"
          value={costSummary.statistics.total_calls.toLocaleString()}
          subtitle={`${costSummary.statistics.failed_calls} failed`}
          color="blue"
        />
        <StatCard
          icon={Zap}
          title="Cache Hit Rate"
          value={`${costSummary.cache.hit_rate}%`}
          subtitle={`Saved: $${costSummary.cache.estimated_savings}`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Latency"
          value={`${costSummary.statistics.avg_latency_ms}ms`}
          subtitle={`${costSummary.statistics.total_tokens.toLocaleString()} tokens`}
          color="orange"
        />
      </div>

      {/* Service Breakdown & Cache Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Service Breakdown */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            API Cost Breakdown
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div>
                <div className="text-sm text-slate-300">Gemini API</div>
                <div className="text-xs text-slate-400">{costSummary.breakdown.gemini.percentage}% of total</div>
              </div>
              <div className="text-xl font-bold text-blue-400">${costSummary.breakdown.gemini.cost}</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div>
                <div className="text-sm text-slate-300">GPT API</div>
                <div className="text-xs text-slate-400">{costSummary.breakdown.gpt.percentage}% of total</div>
              </div>
              <div className="text-xl font-bold text-green-400">${costSummary.breakdown.gpt.cost}</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div>
                <div className="text-sm text-slate-300">Claude API</div>
                <div className="text-xs text-slate-400">{costSummary.breakdown.claude.percentage}% of total</div>
              </div>
              <div className="text-xl font-bold text-purple-400">${costSummary.breakdown.claude.cost}</div>
            </div>
          </div>

          {serviceCosts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Detailed Service Breakdown</h4>
              <ServiceBreakdownChart services={serviceCosts} />
            </div>
          )}
        </div>

        {/* Cache Performance */}
        {cacheStats && (
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Cache Performance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Requests</span>
                <span className="text-white font-bold">{cacheStats.total_requests.toLocaleString()}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Cache Hits</span>
                  <span className="text-green-400 font-bold">{cacheStats.cache_hits.toLocaleString()}</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${cacheStats.hit_rate}` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1">Hit Rate: {cacheStats.hit_rate}</div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cache Misses</span>
                <span className="text-red-400 font-bold">{cacheStats.cache_misses.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <div className="text-sm text-slate-300 mb-1">Cost Saved by Caching</div>
                  <div className="text-2xl font-bold text-green-400">${cacheStats.cost_saved}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {cacheStats.savings_percentage}% savings
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Actual Cost:</span>
                    <span className="text-white">${cacheStats.actual_cost}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Without Cache:</span>
                    <span className="text-white">${cacheStats.total_cost_if_no_cache}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document-wise Cost Breakdown */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Document-wise Cost Analysis ({documentCosts.length} documents)
        </h3>

        {documentCosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Document</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Type</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-semibold">API Calls</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-semibold">Cache Hits</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Gemini</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">GPT</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Claude</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {documentCosts.map((doc, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <div className="font-medium truncate max-w-xs" title={doc.filename}>
                        {doc.filename}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">{doc.api_calls}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-400">{doc.cache.hits}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-red-400">{doc.cache.misses}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-blue-400">${doc.costs.gemini}</td>
                    <td className="py-3 px-4 text-right text-green-400">${doc.costs.gpt}</td>
                    <td className="py-3 px-4 text-right text-purple-400">${doc.costs.claude}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">${doc.costs.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-600">
                  <td colSpan="7" className="py-3 px-4 text-right font-bold text-slate-300">
                    Grand Total:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white text-lg">
                    ${documentCosts.reduce((sum, doc) => sum + parseFloat(doc.costs.total), 0).toFixed(4)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No documents translated yet</p>
            <p className="text-sm mt-2">Start translating documents to see detailed cost analysis per document</p>
          </div>
        )}
      </div>

      {/* Quota Warning */}
      {costSummary.quota_used_percentage >= 80 && (
        <div className={`${costSummary.quota_used_percentage >= 95 ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} border rounded-xl p-4`}>
          <div className="flex items-start gap-3">
            <Activity className={`w-5 h-5 ${costSummary.quota_used_percentage >= 95 ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-bold ${costSummary.quota_used_percentage >= 95 ? 'text-red-300' : 'text-yellow-300'}`}>
                {costSummary.quota_used_percentage >= 95 ? 'Quota Almost Exhausted!' : 'Quota Warning'}
              </p>
              <p className={`text-sm ${costSummary.quota_used_percentage >= 95 ? 'text-red-200' : 'text-yellow-200'}`}>
                You've used {costSummary.quota_used_percentage}% of your quota.
                Remaining: ${costSummary.remaining_quota} of ${costSummary.quota_limit}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostMonitoringDashboard;
