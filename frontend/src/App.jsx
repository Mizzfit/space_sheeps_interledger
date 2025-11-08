import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const API_BASE_URL = 'http://localhost:3000';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      const healthData = await healthResponse.json();
      setHealth(healthData);

      // Check API info endpoint
      const infoResponse = await fetch(`${API_BASE_URL}/api/info`);
      const infoData = await infoResponse.json();
      setApiInfo(infoData);

      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }) => {
    if (status === 'healthy') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Healthy</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
        <XCircle className="w-4 h-4" />
        <span className="font-medium">Unhealthy</span>
      </div>
    );
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Checking server health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Connection Error</h2>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={checkHealth}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Space Sheeps Interledger</h1>
                <p className="text-gray-600">Health Check Dashboard</p>
              </div>
            </div>
            <StatusBadge status={health?.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Server Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Server Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">{health?.status || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Version:</span>
                <span className="font-semibold text-gray-800">{health?.version || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Last Check:</span>
                <span className="font-semibold text-gray-800">{lastCheck || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono text-sm text-gray-800">
                  {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">API Information</h2>
            <div className="space-y-3">
              <div className="py-2 border-b">
                <span className="text-gray-600 block mb-1">Name:</span>
                <span className="font-semibold text-gray-800">{apiInfo?.name || 'N/A'}</span>
              </div>
              <div className="py-2 border-b">
                <span className="text-gray-600 block mb-1">Description:</span>
                <span className="text-gray-800">{apiInfo?.description || 'N/A'}</span>
              </div>
              <div className="py-2">
                <span className="text-gray-600 block mb-1">Default Wallet:</span>
                <span className="font-mono text-xs text-blue-600 break-all">
                  {apiInfo?.defaultWallet || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Available Endpoints */}
          {apiInfo?.endpoints && (
            <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Available Endpoints</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(apiInfo.endpoints).map(([category, endpoints]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h3>
                    <div className="space-y-1">
                      {endpoints.map((endpoint, idx) => (
                        <div key={idx} className="text-sm text-gray-600 font-mono">
                          {endpoint}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={checkHealth}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                Refresh Status
              </button>
              <a
                href={`${API_BASE_URL}/api/info`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                View API Info
              </a>
              <a
                href={`${API_BASE_URL}/api/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                View Health JSON
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Auto-refreshing every 30 seconds • Server: {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;