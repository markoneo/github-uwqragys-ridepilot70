import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  Car, 
  LogOut, 
  CheckCircle2, 
  Play, 
  Navigation,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Banknote,
  Bell,
  Star,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Timer,
  Activity
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverDashboardProps {
  driverId: string;
  driverName: string;
  driverUuid: string;
  onLogout: () => void;
}

const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

const getUrgencyLevel = (date: string, time: string) => {
  const now = new Date();
  const tripTime = new Date(`${date}T${time}`);
  const diffMinutes = Math.floor((tripTime.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 30) return 'urgent';
  if (diffMinutes <= 120) return 'soon';
  return 'later';
};

const getTimeUntilTrip = (date: string, time: string) => {
  const now = new Date();
  const tripTime = new Date(`${date}T${time}`);
  const diffMinutes = Math.floor((tripTime.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
    
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-r ${color} p-3 rounded-xl shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
    </div>
  </motion.div>
);

const TodayTripsSection = ({ 
  todayProjects, 
  upcomingIn24Hours, 
  startedProjects, 
  handleStartTrip, 
  handleCompleteTrip, 
  getCompanyName, 
  getCarTypeName 
}: any) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Filter out trips that are already shown in priority section
  const todayTripsNotInPriority = todayProjects.filter((project: any) => 
    !upcomingIn24Hours.some((p: any) => p.id === project.id)
  );

  if (todayTripsNotInPriority.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Today's Schedule</h2>
              <p className="text-blue-100">
                {todayTripsNotInPriority.length} trip{todayTripsNotInPriority.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-5 h-5 text-white transform rotate-90" />
            </motion.div>
          </motion.button>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 font-medium">Total Earnings</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(todayTripsNotInPriority.reduce((sum: number, trip: any) => 
                sum + (trip.driverFee > 0 ? trip.driverFee : trip.price), 0
              ))}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 font-medium">Started</p>
            <p className="text-lg font-bold text-white">
              {todayTripsNotInPriority.filter((trip: any) => startedProjects.has(trip.id)).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 font-medium">Remaining</p>
            <p className="text-lg font-bold text-white">
              {todayTripsNotInPriority.filter((trip: any) => !startedProjects.has(trip.id)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {todayTripsNotInPriority.map((project: any, index: number) => (
                <TripCard
                  key={project.id}
                  project={project}
                  index={index}
                  onStart={handleStartTrip}
                  onComplete={handleCompleteTrip}
                  isStarted={startedProjects.has(project.id)}
                  getCompanyName={getCompanyName}
                  getCarTypeName={getCarTypeName}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed View - Quick Trip List */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayTripsNotInPriority.map((project: any) => {
                  const driverFee = project.driverFee > 0 ? project.driverFee : project.price;
                  const isStarted = startedProjects.has(project.id);
                  
                  return (
                    <div 
                      key={project.id}
                      className="bg-white rounded-2xl border-2 border-blue-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-gray-900">
                            {project.time.substring(0, 5)}
                          </div>
                          <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                            {getCompanyName(project.company)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(driverFee)}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{project.bookingId}
                          </div>
                        </div>
                      </div>
                      
                      {/* Client and Vehicle Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{project.clientName}</span>
                          {project.clientPhone && (
                            <button
                              onClick={() => window.open(`tel:${project.clientPhone}`, '_self')}
                              className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            <span>{getCarTypeName(project.carType)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{project.passengers} passengers</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pickup Location */}
                      <div className="bg-emerald-50 rounded-xl p-3 mb-3 border border-emerald-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-500 p-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                              Pickup Location
                            </p>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed break-words">
                              {project.pickupLocation}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(project.pickupLocation)}`, '_blank')}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                          >
                            <Navigation className="w-4 h-4 text-emerald-600" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Dropoff Location */}
                      <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-red-500 p-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                              Dropoff Location
                            </p>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed break-words">
                              {project.dropoffLocation}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(project.dropoffLocation)}`, '_blank')}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            <Navigation className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => isStarted ? handleCompleteTrip(project.id) : handleStartTrip(project.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                            isStarted 
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-emerald-500/25' 
                              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/25'
                          }`}
                        >
                          {isStarted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Complete Trip
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Start Trip
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TripCard = ({ project, index, onStart, onComplete, isStarted, getCompanyName, getCarTypeName }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const urgency = getUrgencyLevel(project.date, project.time);
  const driverFee = project.driverFee > 0 ? project.driverFee : project.price;
  
  const urgencyConfig = {
    urgent: {
      borderColor: 'border-red-400',
      bgGradient: 'from-red-50 to-red-100',
      accentColor: 'bg-red-500',
      textColor: 'text-red-700',
      pulseAnimation: 'animate-pulse'
    },
    soon: {
      borderColor: 'border-orange-400', 
      bgGradient: 'from-orange-50 to-orange-100',
      accentColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      pulseAnimation: ''
    },
    later: {
      borderColor: 'border-blue-400',
      bgGradient: 'from-blue-50 to-blue-100', 
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      pulseAnimation: ''
    }
  };

  const config = urgencyConfig[urgency as keyof typeof urgencyConfig];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative overflow-hidden ${config.pulseAnimation}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-60`} />
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      
      <div className={`relative bg-white/95 rounded-2xl border-2 ${config.borderColor} shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
        {/* Header - Always Visible */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900">
                {project.time.substring(0, 5)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {urgency === 'urgent' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`${config.accentColor} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getTimeUntilTrip(project.date, project.time)}
                    </motion.div>
                  )}
                  {urgency === 'soon' && (
                    <div className={`${config.accentColor} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      <Clock className="w-3 h-3" />
                      {getTimeUntilTrip(project.date, project.time)}
                    </div>
                  )}
                </div>
                <div className={`text-sm font-bold ${config.textColor} mt-1`}>
                  {getCompanyName(project.company)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(driverFee)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                #{project.bookingId}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">{project.clientName}</span>
              {project.clientPhone && (
                <button
                  onClick={() => window.open(`tel:${project.clientPhone}`, '_self')}
                  className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Expand/Collapse Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              {isExpanded ? 'Less Info' : 'More Info'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4 transform rotate-90" />
              </motion.div>
            </motion.button>
          </div>

          {/* Compact Info - Always Visible */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{getCarTypeName(project.carType)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{project.passengers} passengers</span>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Locations */}
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-emerald-500 p-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                            Pickup Location
                          </p>
                          <p className="text-sm font-medium text-gray-900 leading-relaxed break-words">
                            {project.pickupLocation}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(project.pickupLocation)}`, '_blank')}
                        className="ml-3 p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                      >
                        <Navigation className="w-4 h-4 text-emerald-600" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-red-500 p-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                            Dropoff Location
                          </p>
                          <p className="text-sm font-medium text-gray-900 leading-relaxed break-words">
                            {project.dropoffLocation}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(project.dropoffLocation)}`, '_blank')}
                        className="ml-3 p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        <Navigation className="w-4 h-4 text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className={`p-3 rounded-xl border-2 ${
                  project.paymentStatus === 'paid' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      project.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                      {project.paymentStatus === 'paid' ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Banknote className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold uppercase tracking-wide ${
                        project.paymentStatus === 'paid' ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {project.paymentStatus === 'paid' ? 'Payment Received' : 'Collect Payment'}
                      </p>
                      <p className={`text-lg font-bold mt-1 ${
                        project.paymentStatus === 'paid' ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {formatCurrency(driverFee)}
                      </p>
                      <p className={`text-xs mt-1 ${
                        project.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {project.paymentStatus === 'paid' ? 'Already paid by client' : 'Collect from client'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {project.description && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                      Special Instructions
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions - Always Visible */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Trip Fee</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(driverFee)}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isStarted ? onComplete(project.id) : onStart(project.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                isStarted 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-emerald-500/25' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/25'
              }`}
            >
              {isStarted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Trip
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Trip
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function DriverDashboard({ driverId, driverName, driverUuid, onLogout }: DriverDashboardProps) {
  const { projects, companies, carTypes, updateProject, refreshData } = useData();
  const [driverProjects, setDriverProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [upcomingIn24Hours, setUpcomingIn24Hours] = useState<any[]>([]);
  const [startedProjects, setStartedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [monthlyEarningsHistory, setMonthlyEarningsHistory] = useState<{[key: string]: number}>({});
  const [selectedEarningsMonth, setSelectedEarningsMonth] = useState<string>('current');

  // Filter projects for this driver using the UUID
  useEffect(() => {
    const allDriverProjects = projects.filter(project => project.driver === driverUuid);
    
    const activeProjects = allDriverProjects
      .filter(project => project.status === 'active')
      .sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time}`);
        const bDateTime = new Date(`${b.date}T${b.time}`);
        return aDateTime.getTime() - bDateTime.getTime();
      });

    const completed = allDriverProjects.filter(project => project.status === 'completed');
    
    setDriverProjects(activeProjects);
    setCompletedProjects(completed);
  }, [projects, driverUuid]);

  // Calculate upcoming trips within 24 hours
  useEffect(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    
    const upcoming = driverProjects.filter(project => {
      const projectDateTime = new Date(`${project.date}T${project.time}`);
      return projectDateTime > now && projectDateTime <= next24Hours;
    }).sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time}`);
      const bDateTime = new Date(`${b.date}T${b.time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
    
    setUpcomingIn24Hours(upcoming);
  }, [driverProjects]);

  // Calculate earnings from completed trips
  useEffect(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // Start of current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate different time period earnings
    let todayTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let allTimeTotal = 0;
    
    // Monthly earnings history
    const monthlyHistory: {[key: string]: number} = {};
    
    completedProjects.forEach(project => {
      const projectDate = new Date(project.date);
      const fee = project.driverFee > 0 ? project.driverFee : project.price;
      
      // Monthly history key (YYYY-MM format)
      const monthKey = `${projectDate.getFullYear()}-${String(projectDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyHistory[monthKey] = (monthlyHistory[monthKey] || 0) + fee;
      
      // Today's earnings
      if (projectDate.toDateString() === today) {
        todayTotal += fee;
      }
      
      // Weekly earnings
      if (projectDate >= startOfWeek) {
        weeklyTotal += fee;
      }
      
      // Monthly earnings
      if (projectDate >= startOfMonth) {
        monthlyTotal += fee;
      }
      
      // All-time earnings
      allTimeTotal += fee;
    });
    
    setTodayEarnings(todayTotal);
    setWeeklyEarnings(weeklyTotal);
    setMonthlyEarnings(monthlyTotal);
    setTotalEarnings(allTimeTotal);
    setMonthlyEarningsHistory(monthlyHistory);
  }, [completedProjects]);

  const getCompanyName = (id: string) => {
    const company = companies.find(c => c.id === id);
    return company?.name || 'Unknown Company';
  };

  const getCarTypeName = (id: string) => {
    const carType = carTypes.find(c => c.id === id);
    return carType?.name || 'Standard';
  };

  const handleStartTrip = (projectId: string) => {
    setStartedProjects(prev => new Set([...prev, projectId]));
  };

  const handleCompleteTrip = async (projectId: string) => {
    try {
      await updateProject(projectId, { status: 'completed' });
      setStartedProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
      
      setTimeout(() => {
        refreshData();
      }, 500);
    } catch (error) {
      console.error('Failed to complete trip:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayProjects = driverProjects.filter(project => {
    const today = new Date().toDateString();
    const projectDate = new Date(project.date).toDateString();
    return projectDate === today;
  });

  const futureProjects = driverProjects.filter(project => {
    const today = new Date().toDateString();
    const projectDate = new Date(project.date).toDateString();
    return projectDate > today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg"
              >
                <Car className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                >
                  Driver Portal
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600"
                >
                  Welcome back, <span className="font-semibold">{driverName}</span>
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 text-gray-600 hover:text-blue-600 rounded-xl hover:bg-white/50 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Today's Trips"
            value={todayProjects.length}
            color="from-blue-500 to-blue-600"
            delay={0.1}
          />
          <StatCard
            icon={Clock}
            title="Future Trips"
            value={futureProjects.length}
            color="from-purple-500 to-purple-600"
            delay={0.2}
          />
          <StatCard
            icon={DollarSign}
            title="Today's Earnings"
            value={formatCurrency(todayEarnings)}
            subtitle="From completed trips"
            color="from-emerald-500 to-emerald-600"
            delay={0.3}
          />
        </div>

        {/* Earnings Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg border border-emerald-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Earnings Overview</h2>
                  <p className="text-gray-600">Track your earnings from completed trips</p>
                </div>
              </div>
              
              {/* Month Selector */}
              {Object.keys(monthlyEarningsHistory).length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">View Month:</label>
                  <select
                    value={selectedEarningsMonth}
                    onChange={(e) => setSelectedEarningsMonth(e.target.value)}
                    className="bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="current">Current Month</option>
                    {Object.keys(monthlyEarningsHistory)
                      .sort((a, b) => b.localeCompare(a))
                      .map(monthKey => {
                        const [year, month] = monthKey.split('-');
                        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        return (
                          <option key={monthKey} value={monthKey}>
                            {monthName}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-1">Today</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(todayEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedProjects.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length} trips
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-1">This Week</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(weeklyEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const startOfWeek = new Date();
                      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
                      startOfWeek.setHours(0, 0, 0, 0);
                      return completedProjects.filter(p => new Date(p.date) >= startOfWeek).length;
                    })()} trips
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    {selectedEarningsMonth === 'current' ? 'This Month' : 'Selected Month'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(selectedEarningsMonth === 'current' ? monthlyEarnings : (monthlyEarningsHistory[selectedEarningsMonth] || 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      if (selectedEarningsMonth === 'current') {
                        const startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);
                        return completedProjects.filter(p => new Date(p.date) >= startOfMonth).length;
                      } else {
                        const [year, month] = selectedEarningsMonth.split('-');
                        const startOfSelectedMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
                        const endOfSelectedMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
                        return completedProjects.filter(p => {
                          const projectDate = new Date(p.date);
                          return projectDate >= startOfSelectedMonth && projectDate <= endOfSelectedMonth;
                        }).length;
                      }
                    })()} trips
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-1">All Time</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">{completedProjects.length} trips</p>
                </div>
              </div>
            </div>
            
            {totalEarnings > 0 && (
              <div className="mt-6 p-4 bg-white/60 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Average per Trip</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(completedProjects.length > 0 ? totalEarnings / completedProjects.length : 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Best Day {selectedEarningsMonth === 'current' ? 'This Month' : 'Selected Month'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {(() => {
                        let monthlyTrips;
                        if (selectedEarningsMonth === 'current') {
                          const startOfMonth = new Date();
                          startOfMonth.setDate(1);
                          monthlyTrips = completedProjects.filter(p => new Date(p.date) >= startOfMonth);
                        } else {
                          const [year, month] = selectedEarningsMonth.split('-');
                          const startOfSelectedMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
                          const endOfSelectedMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
                          monthlyTrips = completedProjects.filter(p => {
                            const projectDate = new Date(p.date);
                            return projectDate >= startOfSelectedMonth && projectDate <= endOfSelectedMonth;
                          });
                        }
                        
                        const dailyEarnings = monthlyTrips.reduce((acc, trip) => {
                          const date = trip.date;
                          const earnings = trip.driverFee > 0 ? trip.driverFee : trip.price;
                          acc[date] = (acc[date] || 0) + earnings;
                          return acc;
                        }, {});
                        
                        const maxEarnings = Math.max(...Object.values(dailyEarnings), 0);
                        return formatCurrency(maxEarnings);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Trips Alert */}
        {upcomingIn24Hours.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Bell className="w-6 h-6" />
                </motion.div>
                <h2 className="text-xl font-bold">Upcoming Within 24 Hours</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {upcomingIn24Hours.length} trip{upcomingIn24Hours.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Clock className="w-5 h-5" />
                Upcoming Trips
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Trip History ({completedProjects.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'upcoming' && (
            <>
              {/* Upcoming Trips */}
              {upcomingIn24Hours.length > 0 && (
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                  >
                    <Zap className="w-6 h-6 text-orange-500" />
                    Priority Trips
                  </motion.h2>
                  <div className="space-y-6">
                    {upcomingIn24Hours.map((project, index) => (
                      <TripCard
                        key={project.id}
                        project={project}
                        index={index}
                        onStart={handleStartTrip}
                        onComplete={handleCompleteTrip}
                        isStarted={startedProjects.has(project.id)}
                        getCompanyName={getCompanyName}
                        getCarTypeName={getCarTypeName}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Trips Section */}
              <TodayTripsSection 
                todayProjects={todayProjects}
                upcomingIn24Hours={upcomingIn24Hours}
                startedProjects={startedProjects}
                handleStartTrip={handleStartTrip}
                handleCompleteTrip={handleCompleteTrip}
                getCompanyName={getCompanyName}
                getCarTypeName={getCarTypeName}
              />

              {/* Future Trips Preview */}
              {futureProjects.length > 0 && (
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
              >
                <TrendingUp className="w-6 h-6 text-purple-500" />
                Upcoming Schedule
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureProjects.slice(0, 6).map((project, index) => {
                  const isInUpcoming = upcomingIn24Hours.some(p => p.id === project.id);
                  if (isInUpcoming) return null;
                  
                  const driverFee = project.driverFee > 0 ? project.driverFee : project.price;
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              {new Date(project.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{project.time.substring(0, 5)}</p>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {getCompanyName(project.company)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{project.clientName}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3 h-3 text-emerald-600 mt-1" />
                            <span className="text-xs text-gray-600 break-words">{project.pickupLocation}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3 h-3 text-red-600 mt-1" />
                            <span className="text-xs text-gray-600 break-words">{project.dropoffLocation}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{project.passengers}</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-600">{formatCurrency(driverFee)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
                </div>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <>
              {completedProjects.length > 0 ? (
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    Completed Trips
                  </motion.h2>
                  <div className="space-y-4">
                    {completedProjects
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((project, index) => {
                        const driverFee = project.driverFee > 0 ? project.driverFee : project.price;
                        
                        return (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/95 rounded-xl border border-emerald-200 shadow-lg overflow-hidden"
                          >
                            {/* Header */}
                            <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-emerald-500 text-white p-2 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-emerald-700 font-medium">
                                      {new Date(project.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{project.time.substring(0, 5)}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-emerald-600">
                                    {formatCurrency(driverFee)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    #{project.bookingId}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                              <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-900">{project.clientName}</span>
                                <span className="text-sm text-gray-500">• {getCompanyName(project.company)}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{getCarTypeName(project.carType)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{project.passengers} passengers</span>
                                </div>
                              </div>

                              {/* Locations */}
                              <div className="space-y-3">
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-emerald-500 p-2 rounded-lg">
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                                        Pickup
                                      </p>
                                      <p className="text-sm text-gray-900 break-words">
                                        {project.pickupLocation}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-red-500 p-2 rounded-lg">
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                                        Dropoff
                                      </p>
                                      <p className="text-sm text-gray-900 break-words">
                                        {project.dropoffLocation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {project.description && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                                    Notes
                                  </p>
                                  <p className="text-sm text-blue-900">{project.description}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg"
                >
                  <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No completed trips yet</h3>
                  <p className="text-gray-600">
                    Your completed trips will appear here once you finish them.
                  </p>
                </motion.div>
              )}
            </>
          )}

          {/* No trips message for upcoming tab */}
          {activeTab === 'upcoming' && driverProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg"
            >
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No trips assigned</h3>
              <p className="text-gray-600 mb-6">
                You don't have any trips assigned at the moment.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''} inline`} />
                {loading ? 'Refreshing...' : 'Refresh Trips'}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}