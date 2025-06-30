
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  AlertCircle, 
  User,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';

interface Project {
  id: string;
  clientName: string;
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
}

interface ProjectTimelineProps {
  projects: Project[];
  companies: Array<{ id: string; name: string }>;
  drivers: Array<{ id: string; name: string }>;
  carTypes: Array<{ id: string; name: string }>;
  onProjectAction: (projectId: string, action: string) => void;
  getCompanyName: (id: string) => string;
  getDriverName: (id: string) => string;
  getCarTypeName: (id: string) => string;
  getCompanyTheme: (companyId: string) => string;
}

export default function ProjectTimeline({
  projects,
  companies,
  drivers,
  carTypes,
  onProjectAction,
  getCompanyName,
  getDriverName,
  getCarTypeName,
  getCompanyTheme
}: ProjectTimelineProps) {
  // Group projects by date and calculate timeline positions
  const timelineData = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    
    projects.forEach(project => {
      const dateKey = project.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(project);
    });

    // Sort projects within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.map(date => ({
      date,
      projects: grouped[date],
      formattedDate: formatDateHeader(date)
    }));
  }, [projects]);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    // Scale to 0-100% for 24 hours (0-1440 minutes)
    return (totalMinutes / 1440) * 100;
  };

  const getTimeDifference = (time1: string, time2: string) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.abs(diff);
  };

  const checkOverlap = (projects: Project[]) => {
    const overlaps: Record<string, boolean> = {};
    
    for (let i = 0; i < projects.length; i++) {
      for (let j = i + 1; j < projects.length; j++) {
        const timeDiff = getTimeDifference(projects[i].time, projects[j].time);
        // Consider overlap if less than 30 minutes apart
        if (timeDiff < 30) {
          overlaps[projects[i].id] = true;
          overlaps[projects[j].id] = true;
        }
      }
    }
    
    return overlaps;
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No projects to display</h3>
        <p className="text-slate-600">Projects will appear here when you create them.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {timelineData.map(({ date, projects: dayProjects, formattedDate }) => {
        const overlaps = checkOverlap(dayProjects);
        
        return (
          <div key={date} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Date Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{formattedDate}</h2>
                  <p className="text-slate-300 mt-1">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{dayProjects.length}</div>
                  <div className="text-slate-300 text-sm">
                    trip{dayProjects.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              {/* Time Scale */}
              <div className="relative mb-8">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  {Array.from({ length: 25 }, (_, i) => (
                    <span key={i} className="flex-1 text-center">
                      {i.toString().padStart(2, '0')}:00
                    </span>
                  ))}
                </div>
                <div className="h-px bg-slate-200 relative">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 w-px h-2 bg-slate-300"
                      style={{ left: `${(i / 24) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Projects Timeline */}
              <div className="relative">
                {dayProjects.map((project, index) => {
                  const position = getTimePosition(project.time);
                  const isOverlapping = overlaps[project.id];
                  const themeColor = getCompanyTheme(project.company);
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`absolute ${isOverlapping ? 'top-20' : 'top-0'} transform -translate-x-1/2`}
                      style={{ left: `${position}%` }}
                    >
                      {/* Timeline Marker */}
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg ${
                          isOverlapping ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        
                        {/* Project Card */}
                        <div className={`mt-2 w-72 bg-white rounded-xl shadow-lg border-2 ${
                          isOverlapping ? 'border-red-300' : 'border-slate-200'
                        } p-4`}>
                          {/* Overlap Warning */}
                          {isOverlapping && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-xs text-red-700 font-medium">
                                Potential Schedule Conflict
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          <div className="text-center mb-3">
                            <div className="text-2xl font-bold text-slate-900">
                              {project.time.substring(0, 5)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {getCompanyName(project.company)}
                            </div>
                          </div>

                          {/* Client */}
                          <div className="text-center mb-3">
                            <h3 className="font-bold text-slate-900 truncate">
                              {project.clientName}
                            </h3>
                            <div className="text-lg font-bold text-emerald-600">
                              €{project.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Route */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="truncate text-slate-700">
                                {project.pickupLocation}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <span className="truncate text-slate-700">
                                {project.dropoffLocation}
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{project.passengers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              <span className="truncate">{getCarTypeName(project.carType)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{getDriverName(project.driver)}</span>
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="flex justify-center mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.paymentStatus === 'paid' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              <DollarSign className="w-3 h-3 inline mr-1" />
                              {project.paymentStatus === 'paid' ? 'Paid' : 'To Charge'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => onProjectAction(project.id, 'view')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onProjectAction(project.id, 'edit')}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onProjectAction(project.id, 'voucher')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Voucher"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onProjectAction(project.id, 'delete')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add spacing for overlapping cards */}
              <div className="h-96" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
