import React, { useState, useEffect } from 'react';
import { Car, Lock, User, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';

interface DriverLoginProps {
  onDriverLogin: (driverId: string, driverName: string, driverUuid: string) => void;
}

export default function DriverLogin({ onDriverLogin }: DriverLoginProps) {
  const [driverId, setDriverId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [standAloneDrivers, setStandAloneDrivers] = useState<any[]>([]);
  const { drivers } = useData();

  // Fetch drivers independently for driver portal
  useEffect(() => {
    const fetchDriversForPortal = async () => {
      try {
        console.log('Fetching drivers for driver portal...');
        
        // Try to get all drivers from all users (for driver portal access)
        const { data, error } = await supabase
          .from('drivers')
          .select('*');

        if (error) {
          console.error('Error fetching drivers for portal:', error);
          return;
        }

        const driversWithPin = (data || []).map(driver => ({
          ...driver,
          pin: driver.pin || '1234'
        }));

        console.log('Fetched drivers for portal:', driversWithPin);
        setStandAloneDrivers(driversWithPin);
      } catch (err) {
        console.error('Error in fetchDriversForPortal:', err);
      }
    };

    fetchDriversForPortal();
  }, []);

  // Use standalone drivers if context drivers are empty
  const availableDrivers = drivers.length > 0 ? drivers : standAloneDrivers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverId.trim() || !pin.trim()) {
      setError('Please enter both Driver ID and PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting driver login:', { driverId, pin, driversCount: availableDrivers.length });
      console.log('Available drivers:', availableDrivers.map(d => ({ id: d.id, name: d.name, license: d.license, pin: d.pin })));
      
      // Check if no drivers are loaded
      if (availableDrivers.length === 0) {
        setError('No drivers found in the system. Please ensure drivers are added in the admin panel first.');
        return;
      }
      
      // Find the driver by license number (Driver ID) - case insensitive
      const driver = availableDrivers.find(d => {
        const driverLicense = d.license?.toLowerCase().trim();
        const inputId = driverId.toLowerCase().trim();
        const driverPin = d.pin || '1234';
        
        console.log('Checking driver:', { 
          driverLicense, 
          inputId, 
          driverPin, 
          inputPin: pin,
          licenseMatch: driverLicense === inputId,
          pinMatch: driverPin === pin
        });
        
        return driverLicense === inputId && driverPin === pin;
      });

      if (driver) {
        console.log('Driver login successful:', driver);
        onDriverLogin(driverId, driver.name, driver.id);
      } else {
        console.log('Driver login failed - no matching driver found');
        const availableDriverIds = availableDrivers.map(d => d.license).filter(Boolean);
        console.log('Available Driver IDs:', availableDriverIds);
        setError(`Invalid Driver ID or PIN. Available Driver IDs: ${availableDriverIds.length > 0 ? availableDriverIds.join(', ') : 'None'}. Default PIN is 1234.`);
      }
    } catch (err) {
      console.error('Driver login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Driver Portal</h1>
          <p className="text-blue-200">Access your assigned trips</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your driver ID (license number)"
                  autoComplete="username"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use your license number as your Driver ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your PIN"
                  autoComplete="current-password"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact your dispatcher
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Demo: Use any license number from the driver list with PIN: 1234
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            RidePilot Driver Portal v1.0
          </p>
        </div>
      </div>
    </div>
  );
}