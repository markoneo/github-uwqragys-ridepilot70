import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  Phone,
  Car,
  ArrowRight,
  Edit,
  Trash2,
  Play,
  CheckCircle2,
  FileText,
  Star,
  AlertCircle,
  Zap,
  ChevronDown
} from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    clientName: string;
    clientPhone?: string;
    date: string;
    time: string;
    pickupLocation: string;
    dropoffLocation: string;
    passengers: number;
    price: number;
    company: string;
    driver: string;
    carType: string;
    status: string;
    paymentStatus: string;
    bookingId?: string;
    description?: string;
  };
  companyName: string;
  driverName?: string;
  carTypeName?: string;
  colorTheme: string;
  isUpcoming?: boolean;
  isUrgent?: boolean;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onStart?: () => void;
  onVoucher?: () => void;
  isStarted?: boolean;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

const ProjectCard = React.memo(({ 
  project, 
  companyName, 
  driverName,
  carTypeName,
  colorTheme, 
  isUpcoming = false,
  isUrgent = false,
  onEdit, 
  onView, 
  onDelete,
  onStart,
  onVoucher,
  isStarted = false,
  isCollapsible = false,
  defaultExpanded = true
}: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntil = () => {
    const now = new Date();
    const projectDateTime = new Date(`${project.date}T${project.time}`);
    const diff = projectDateTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1 && minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h ${minutes}m`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getUrgencyConfig = () => {
    if (isUrgent) return {
      borderColor: 'border-red-400',
      bgGradient: 'from-red-50 to-red-100',
      accentColor: 'bg-red-500',
      textColor: 'text-red-700',
      pulseAnimation: 'animate-pulse'
    };
    if (isUpcoming) return {
      borderColor: 'border-orange-400',
      bgGradient: 'from-orange-50 to-orange-100',
      accentColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      pulseAnimation: ''
    };
    return {
      borderColor: 'border-slate-200',
      bgGradient: 'from-white to-slate-50',
      accentColor: 'bg-slate-400',
      textColor: 'text-slate-700',
      pulseAnimation: ''
    };
  };

  // Get button color class that ensures good contrast with white text
  const getButtonColorClass = () => {
    if (isStarted) {
      return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
    }
    
    // Map theme colors to button-safe versions that work with white text
    const buttonColorMap: { [key: string]: string } = {
      'blue': 'bg-gradient-to-r from-blue-600 to-blue-500',
      'green': 'bg-gradient-to-r from-green-600 to-green-500',
      'purple': 'bg-gradient-to-r from-purple-600 to-purple-500',
      'amber': 'bg-gradient-to-r from-amber-600 to-amber-500',
      'teal': 'bg-gradient-to-r from-teal-600 to-teal-500',
      'red': 'bg-gradient-to-r from-red-600 to-red-500',
      'indigo': 'bg-gradient-to-r from-indigo-600 to-indigo-500',
      'pink': 'bg-gradient-to-r from-pink-600 to-pink-500',
      'orange': 'bg-gradient-to-r from-orange-600 to-orange-500',
      'emerald': 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      'viator': 'bg-gradient-to-r from-[#328E6E] to-[#2a7a5e]',
      'booking': 'bg-gradient-to-r from-[#3D365C] to-[#332d4d]',
      'rideconnect': 'bg-gradient-to-r from-[#BF3131] to-[#a62a2a]'
    };

    // Extract the base color from the theme
    let baseColor = colorTheme;
    if (colorTheme.includes('from-')) {
      // If it's already a gradient, extract the base color
      const match = colorTheme.match(/from-(\w+)-/);
      if (match) {
        baseColor = match[1];
      }
    }

    return buttonColorMap[baseColor] || 'bg-gradient-to-r from-blue-600 to-blue-500';
  };

  const urgencyConfig = getUrgencyConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className={`group relative overflow-hidden will-change-transform ${urgencyConfig.pulseAnimation}`}
    >
      {/* Background Effects - Simplified */}
      <div className={`absolute inset-0 bg-gradient-to-br ${urgencyConfig.bgGradient} opacity-60`} />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      
      {/* Company Accent Bar */}
      <div className={`absolute top-0 left-0 w-2 h-full ${getButtonColorClass()}`} />

      <div className={`relative bg-white/90 backdrop-blur-sm rounded-xl border-2 ${urgencyConfig.borderColor} shadow-lg group-hover:shadow-xl transition-all duration-200 overflow-hidden`}>
        
        {/* Top Status Bar */}
        <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {isUpcoming && (
              <div className={`flex items-center gap-1 ${urgencyConfig.accentColor} text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg`}>
                {isUrgent ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span className="text-xs">{getTimeUntil()}</span>
              </div>
            )}
            
            {project.paymentStatus === 'paid' && (
              <div className="bg-emerald-500 text-white p-1 rounded-full" title="Payment Received">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            )}
          </div>
          
          {project.bookingId && (
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-xs font-mono text-slate-600">#{project.bookingId}</span>
            </div>
          )}
        </div>

        {/* Main Header - Separated into clear sections */}
        <div className="p-4 space-y-3">
          {/* Collapse Toggle Button */}
          {isCollapsible && (
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-3 py-2 rounded-lg font-medium"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium">
                  {isExpanded ? 'Hide' : 'Show'} Details
                </span>
              </button>
              <div className="text-xs text-slate-500">
                {isExpanded ? 'Full view' : 'Summary view'}
              </div>
            </div>
          )}

          {/* Time and Date Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {formatTime(project.time)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  {formatDate(project.date)}
                </span>
              </div>
            </div>
            
            {/* Price Section - Moved to separate area */}
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                €{project.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Company and Payment Status Row */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${urgencyConfig.textColor}`}>
              {companyName}
            </span>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              project.paymentStatus === 'paid' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              <DollarSign className="w-3 h-3 mr-1" />
              {project.paymentStatus === 'paid' ? 'Paid' : 'To Charge'}
            </div>
          </div>

          {/* Client Information Row */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 truncate mb-1">
              {project.clientName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              <span>Contact available</span>
            </div>
          </div>

          {/* Summary Route Info - Always visible */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{project.pickupLocation}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="truncate">{project.dropoffLocation}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{project.passengers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                <span>{carTypeName || 'Standard'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{driverName || 'TBA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Detailed Content */}
        <AnimatePresence>
          {(!isCollapsible || isExpanded) && (
            <motion.div
              initial={isCollapsible ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Location Section - Better organized */}
              <div className="px-4 py-3 bg-slate-50/50 border-y border-slate-100">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 group/location">
                    <div className="bg-emerald-100 p-3 rounded-xl group-hover/location:bg-emerald-200 transition-colors flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        Pickup Location
                      </p>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed break-words">
                        {project.pickupLocation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 group/location">
                    <div className="bg-red-100 p-3 rounded-xl group-hover/location:bg-red-200 transition-colors flex-shrink-0">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        Dropoff Location
                      </p>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed break-words">
                        {project.dropoffLocation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details - Reorganized as separate section */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mb-2 mx-auto">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Passengers</p>
                    <p className="text-lg font-bold text-slate-900">{project.passengers}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mb-2 mx-auto">
                      <Car className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Vehicle</p>
                    <p className="text-sm font-bold text-slate-900">{carTypeName || 'Standard'}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mb-2 mx-auto">
                      <Star className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Driver</p>
                    <p className="text-sm font-bold text-slate-900">{driverName || 'TBA'}</p>
                  </div>
                </div>

                {/* Notes Section - Separated */}
                {project.description && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      Special Instructions
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions Section - Clear separation */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            {/* Left Side - Primary Action */}
            <div className="flex items-center gap-3">
              {onStart && project.status === 'active' && (
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStart}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 ${getButtonColorClass()}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Trip
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              )}
              
              {/* Completed Trip Badge */}
              {project.status === 'completed' && (
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-emerald-700 bg-emerald-100 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  Trip Completed
                </div>
              )}
            </div>
            
            {/* Secondary Actions - Icon-only for cleaner UI */}
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                onClick={onView}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                title="View full project details and client information"
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <button
                onClick={onEdit}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
                title="Edit project details, time, location, or driver"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              {onVoucher && (
                <button
                  onClick={onVoucher}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                  title="Generate voucher for client - share via WhatsApp, email, or print"
                >
                  <FileText className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onDelete}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;