import React, { useEffect, useState, useRef } from 'react';
import { Activity, Building2, CheckCircle2, Timer, Users, TrendingUp, Calendar, ArrowLeft, FileText, DollarSign, Award, Trophy, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import LocationAnalytics from './LocationAnalytics';

// Only load Chart.js on client-side as needed
let Pie: any = () => <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>;
let Bar: any = () => <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>;

// Dynamically import Chart.js components to prevent mobile issues
if (typeof window !== 'undefined') {
  import('react-chartjs-2').then(module => {
    Pie = module.Pie;
    Bar = module.Bar;
  }).catch(err => {
    console.error("Could not load Chart.js components:", err);
  });
  
  // Register required components only if in browser
  try {
    ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, LineElement, PointElement);
  } catch (err) {
    console.warn("Could not register Chart.js components:", err);
  }
}

// Define colors for pie chart
const chartColors = [
  '#4ade80', // green-400
  '#60a5fa', // blue-400
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#a855f7', // purple-500
];

export default function Statistics() {
  const navigate = useNavigate();
  const { projects, companies, drivers } = useData();
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalRevenue: 0,
    totalPassengers: 0,
    todayPassengers: 0,
    weeklyPassengers: 0,
    monthlyPassengers: 0
  });
  const [companyStats, setCompanyStats] = useState<{ [key: string]: number }>({});
  const [topDrivers, setTopDrivers] = useState<Array<{ id: string; total: number }>>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ [key: string]: number }>({});
  const [dailyEarnings, setDailyEarnings] = useState<{ [key: string]: number }>({});
  const [allTimeBestDay, setAllTimeBestDay] = useState<{ date: string; earnings: number; dayName: string } | null>(null);
  const [pieChartData, setPieChartData] = useState<any>(null);
  const [chartError, setChartError] = useState<boolean>(false);
  const [hourlyData, setHourlyData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [growthTrends, setGrowthTrends] = useState<any>(null);
  const [demandPrediction, setDemandPrediction] = useState<any>(null);

  const getCompanyName = (id: string) => {
    const company = companies.find(c => c.id === id);
    return company?.name || 'Unknown Company';
  };

  const getDriverName = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    return driver?.name || 'Unknown Driver';
  };

  // Calculate statistics
  useEffect(() => {
    try {
      // Calculate passenger statistics
      const now = new Date();
      const today = now.toDateString();
      
      // Start of current week (Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalPassengers = projects.reduce((sum, p) => sum + (p.passengers || 0), 0);
      
      const todayPassengers = projects
        .filter(p => new Date(p.date).toDateString() === today)
        .reduce((sum, p) => sum + (p.passengers || 0), 0);
      
      const weeklyPassengers = projects
        .filter(p => new Date(p.date) >= startOfWeek)
        .reduce((sum, p) => sum + (p.passengers || 0), 0);
      
      const monthlyPassengers = projects
        .filter(p => new Date(p.date) >= startOfMonth)
        .reduce((sum, p) => sum + (p.passengers || 0), 0);

      // Project statistics
      const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalRevenue: projects.reduce((sum, p) => sum + p.price, 0),
        totalPassengers,
        todayPassengers,
        weeklyPassengers,
        monthlyPassengers
      };
      setStatistics(stats);

      // Company distribution
      const companyDist = projects.reduce((acc, project) => {
        acc[project.company] = (acc[project.company] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      setCompanyStats(companyDist);

      // Monthly revenue
      const monthly = projects.reduce((acc, project) => {
        const month = new Date(project.date).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + project.price;
        return acc;
      }, {} as { [key: string]: number });
      setMonthlyStats(monthly);

      // Daily earnings - last 30 days
      const daily = projects.reduce((acc, project) => {
        const dateKey = project.date; // YYYY-MM-DD format
        acc[dateKey] = (acc[dateKey] || 0) + project.price;
        return acc;
      }, {} as { [key: string]: number });
      
      // Sort daily earnings by date and keep only last 30 days
      const sortedDates = Object.keys(daily).sort().reverse().slice(0, 30);
      const recentDailyEarnings = sortedDates.reduce((acc, date) => {
        acc[date] = daily[date];
        return acc;
      }, {} as { [key: string]: number });
      
      setDailyEarnings(recentDailyEarnings);

      // Calculate all-time best earning day
      let bestDate = '';
      let bestEarnings = 0;
      for (const [date, earnings] of Object.entries(daily)) {
        if (earnings > bestEarnings) {
          bestEarnings = earnings;
          bestDate = date;
        }
      }
      
      if (bestDate && bestEarnings > 0) {
        const dayName = new Date(bestDate).toLocaleDateString('en-US', { weekday: 'long' });
        setAllTimeBestDay({
          date: bestDate,
          earnings: bestEarnings,
          dayName
        });
      } else {
        setAllTimeBestDay(null);
      }

      // Top drivers by earnings
      const driverEarnings = drivers
        .map(driver => ({
          id: driver.id,
          total: driver.total_earnings || 0
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setTopDrivers(driverEarnings);

      // Create pie chart data
      if (Object.keys(companyDist).length > 0) {
        // Calculate total projects for percentage calculation
        const totalProjects = Object.values(companyDist).reduce((sum, count) => sum + count, 0);
        
        // Prepare data for pie chart
        const companyNames = Object.keys(companyDist).map(id => getCompanyName(id));
        const companyCounts = Object.values(companyDist);
        
        setPieChartData({
          labels: companyNames,
          datasets: [{
            data: companyCounts,
            backgroundColor: chartColors.slice(0, companyCounts.length),
            borderColor: chartColors.map(color => color + '80'), // 50% opacity
            borderWidth: 1,
          }],
        });
      }

      // Calculate hourly project creation patterns
      const hourlyStats = new Array(24).fill(0);
      projects.forEach(project => {
        const hour = parseInt(project.time.split(':')[0]);
        hourlyStats[hour]++;
      });

      setHourlyData({
        labels: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        datasets: [{
          label: 'Projects Created',
          data: hourlyStats,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }]
      });

      // Calculate weekly project creation patterns
      const weeklyStats = new Array(7).fill(0);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      projects.forEach(project => {
        const dayOfWeek = new Date(project.date).getDay();
        weeklyStats[dayOfWeek]++;
      });

      setWeeklyData({
        labels: dayNames,
        datasets: [{
          label: 'Projects Created',
          data: weeklyStats,
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)',   // Sunday - Red
            'rgba(59, 130, 246, 0.6)',  // Monday - Blue
            'rgba(34, 197, 94, 0.6)',   // Tuesday - Green
            'rgba(251, 191, 36, 0.6)',  // Wednesday - Yellow
            'rgba(168, 85, 247, 0.6)',  // Thursday - Purple
            'rgba(20, 184, 166, 0.6)',  // Friday - Teal
            'rgba(245, 101, 101, 0.6)', // Saturday - Light Red
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(20, 184, 166, 1)',
            'rgba(245, 101, 101, 1)',
          ],
          borderWidth: 1,
        }]
      });

      // Calculate Growth Trends
      const calculateGrowthTrends = () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        // Group projects by year-month
        const monthlyData = projects.reduce((acc, project) => {
          const date = new Date(project.date);
          const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
          const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!acc[yearMonth]) {
            acc[yearMonth] = { count: 0, revenue: 0, key };
          }
          acc[yearMonth].count++;
          acc[yearMonth].revenue += project.price;
          return acc;
        }, {} as { [key: string]: { count: number; revenue: number; key: string } });

        // Get last 12 months for comparison
        const last12Months = [];
        const last12MonthsLabels = [];
        const previous12Months = [];
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(currentYear, currentMonth - i, 1);
          const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
          const prevYearMonth = `${date.getFullYear() - 1}-${date.getMonth()}`;
          const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          
          last12MonthsLabels.push(label);
          last12Months.push(monthlyData[yearMonth]?.revenue || 0);
          previous12Months.push(monthlyData[prevYearMonth]?.revenue || 0);
        }

        setGrowthTrends({
          labels: last12MonthsLabels,
          datasets: [
            {
              label: 'Current Year Revenue',
              data: last12Months,
              borderColor: 'rgba(34, 197, 94, 1)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Previous Year Revenue',
              data: previous12Months,
              borderColor: 'rgba(156, 163, 175, 1)',
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
              fill: true,
              tension: 0.4,
              borderDash: [5, 5],
            }
          ]
        });
      };

      // Calculate Demand Prediction
      const calculateDemandPrediction = () => {
        const hourlyDemand = new Array(24).fill(0);
        const weeklyDemand = new Array(7).fill(0);
        
        projects.forEach(project => {
          const date = new Date(project.date);
          const hour = parseInt(project.time.split(':')[0]);
          const dayOfWeek = date.getDay();
          
          hourlyDemand[hour]++;
          weeklyDemand[dayOfWeek]++;
        });

        // Calculate predicted busy periods (above average + 1 standard deviation)
        const avgHourly = hourlyDemand.reduce((a, b) => a + b, 0) / 24;
        const stdDevHourly = Math.sqrt(hourlyDemand.reduce((acc, val) => acc + Math.pow(val - avgHourly, 2), 0) / 24);
        const busyHourThreshold = avgHourly + stdDevHourly;

        const avgWeekly = weeklyDemand.reduce((a, b) => a + b, 0) / 7;
        const stdDevWeekly = Math.sqrt(weeklyDemand.reduce((acc, val) => acc + Math.pow(val - avgWeekly, 2), 0) / 7);
        const busyDayThreshold = avgWeekly + stdDevWeekly;

        const busyHours = hourlyDemand.map((demand, hour) => ({
          hour,
          demand,
          isBusy: demand > busyHourThreshold,
          intensity: Math.min((demand / busyHourThreshold) * 100, 100)
        }));

        const busyDays = weeklyDemand.map((demand, day) => ({
          day: dayNames[day],
          demand,
          isBusy: demand > busyDayThreshold,
          intensity: Math.min((demand / busyDayThreshold) * 100, 100)
        }));

        setDemandPrediction({
          hourly: busyHours,
          weekly: busyDays,
          thresholds: {
            hourly: busyHourThreshold,
            weekly: busyDayThreshold
          }
        });
      };

      calculateGrowthTrends();
      calculateDemandPrediction();
    } catch (error) {
      console.error("Error calculating statistics:", error);
      setChartError(true);
    }
  }, [projects, companies, drivers]);

  // Pie chart options - enhanced with percentage display
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const, // Better for mobile
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} projects (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    animation: {
      duration: 500 // Shorter animations for mobile
    }
  };

  // Bar chart options for hourly and weekly data
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} projects`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    animation: {
      duration: 500
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </button>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Statistics</h1>
          </div>
          
          <button
            onClick={() => navigate('/financial-report')}
            className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Financial Report
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Projects</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.total}</h3>
              </div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Active Projects</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.active}</h3>
              </div>
              <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Completed</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.completed}</h3>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-lg sm:text-2xl font-bold">€{statistics.totalRevenue.toFixed(2)}</h3>
              </div>
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Passenger Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 sm:p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-indigo-100 mb-1">Total Passengers</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.totalPassengers}</h3>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 sm:p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-emerald-100 mb-1">Today's Passengers</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.todayPassengers}</h3>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-100 mb-1">Weekly Passengers</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.weeklyPassengers}</h3>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 sm:p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-100 mb-1">Monthly Passengers</p>
                <h3 className="text-lg sm:text-2xl font-bold">{statistics.monthlyPassengers}</h3>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
          {/* Daily Earnings */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Daily Earnings (Last 30 Days)
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-72 overflow-y-auto">
              {Object.entries(dailyEarnings)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 10)
                .map(([date, earnings]) => {
                  const maxEarnings = Math.max(...Object.values(dailyEarnings));
                  const percentage = maxEarnings ? (earnings / maxEarnings) * 100 : 0;
                  
                  return (
                    <div key={date} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-20 sm:w-24 h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm min-w-[60px] text-right">€{earnings.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              
              {Object.keys(dailyEarnings).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No earnings data available</p>
                </div>
              )}
            </div>
            
            {Object.keys(dailyEarnings).length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/financial-report')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  View Full Report →
                </button>
              </div>
            )}
          </div>

          {/* Company Distribution - Enhanced with modern graphics and percentages */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-purple-500" />
              Companies Distribution
            </h3>

            <div className="space-y-4">
              {(() => {
                const totalProjects = Object.values(companyStats).reduce((sum, count) => sum + count, 0);
                const sortedCompanies = Object.entries(companyStats)
                  .sort((a, b) => b[1] - a[1]) // Sort by project count descending
                  .slice(0, 10); // Show top 10 companies
                
                if (sortedCompanies.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No company data available</p>
                    </div>
                  );
                }

                // Color palette for companies
                const companyColors = [
                  'from-purple-500 to-purple-600',
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600',
                  'from-orange-500 to-orange-600',
                  'from-pink-500 to-pink-600',
                  'from-teal-500 to-teal-600',
                  'from-indigo-500 to-indigo-600',
                  'from-red-500 to-red-600',
                  'from-yellow-500 to-yellow-600',
                  'from-cyan-500 to-cyan-600'
                ];

                return (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">{sortedCompanies.length}</div>
                        <div className="text-xs text-purple-600">Active Companies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{totalProjects}</div>
                        <div className="text-xs text-blue-600">Total Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {sortedCompanies.length > 0 ? Math.round(totalProjects / sortedCompanies.length) : 0}
                        </div>
                        <div className="text-xs text-green-600">Avg per Company</div>
                      </div>
                    </div>

                    {/* Enhanced Company Bars */}
                    <div className="space-y-3">
                      {sortedCompanies.map(([companyId, count], index) => {
                        const percentage = totalProjects > 0 ? ((count / totalProjects) * 100) : 0;
                        const colorClass = companyColors[index % companyColors.length];
                        const isTopCompany = index === 0;
                        
                        return (
                          <div key={companyId} className={`group transition-all duration-300 hover:transform hover:scale-[1.02] ${
                            isTopCompany ? 'ring-2 ring-purple-200 ring-opacity-50' : ''
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass} shadow-sm`} />
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {getCompanyName(companyId)}
                                  </span>
                                  {isTopCompany && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      <Star className="w-3 h-3 mr-1" />
                                      Top
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900">{count} projects</div>
                                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${colorClass} shadow-sm`}>
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Progress Bar */}
                            <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 ease-out relative overflow-hidden group-hover:shadow-lg`}
                                style={{ width: `${percentage}%` }}
                              >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 transform -skew-x-12 animate-pulse" />
                              </div>
                              
                              {/* Percentage label on bar for larger percentages */}
                              {percentage > 15 && (
                                <div 
                                  className="absolute top-0 left-2 h-full flex items-center text-xs font-medium text-white"
                                  style={{ width: `${percentage}%` }}
                                >
                                  {percentage.toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Footer */}
                    {sortedCompanies.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            Top performer: <span className="font-medium text-purple-600">{getCompanyName(sortedCompanies[0][0])}</span>
                          </span>
                          <span>
                            {sortedCompanies.length} of {Object.keys(companyStats).length} companies shown
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Monthly Revenue Trend */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Monthly Revenue
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(monthlyStats)
                .sort((a, b) => b[1] - a[1]) // Sort by revenue amount
                .slice(0, 5)
                .map(([month, revenue]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month}</span>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-24 sm:w-32 h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(revenue / Math.max(...Object.values(monthlyStats))) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-sm">€{revenue.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              This Week Summary
            </h3>
            <div className="space-y-4">
              {(() => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                
                const weekProjects = projects.filter(p => {
                  const projectDate = new Date(p.date);
                  return projectDate >= startOfWeek && projectDate <= now;
                });
                
                const weekEarnings = weekProjects.reduce((sum, p) => sum + p.price, 0);
                const avgDailyEarnings = weekEarnings / 7;
                
                // Calculate daily earnings for this week
                const dailyWeekEarnings = weekProjects.reduce((acc, project) => {
                  const dateKey = project.date;
                  acc[dateKey] = (acc[dateKey] || 0) + project.price;
                  return acc;
                }, {} as { [key: string]: number });
                
                // Find the best earning day for this week
                let bestWeekDay = null;
                let bestWeekEarnings = 0;
                for (const [date, earnings] of Object.entries(dailyWeekEarnings)) {
                  if (earnings > bestWeekEarnings) {
                    bestWeekEarnings = earnings;
                    bestWeekDay = date;
                  }
                }
                
                const bestWeekDayName = bestWeekDay 
                  ? new Date(bestWeekDay).toLocaleDateString('en-US', { weekday: 'long' })
                  : 'No data';
                
                // Check if this week's best day is a new all-time record
                const isNewRecord = allTimeBestDay && bestWeekEarnings > allTimeBestDay.earnings;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-semibold text-green-600">€{weekEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Projects Completed</span>
                      <span className="font-semibold">{weekProjects.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Daily Earnings</span>
                      <span className="font-semibold text-blue-600">€{avgDailyEarnings.toFixed(2)}</span>
                    </div>
                    
                    {/* All-time Best Day Record */}
                    {allTimeBestDay && (
                      <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="text-sm text-gray-600">All-Time Record</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-700">{allTimeBestDay.dayName}</div>
                          <div className="text-sm font-medium text-purple-600">€{allTimeBestDay.earnings.toFixed(2)}</div>
                          <div className="text-xs text-purple-500">
                            {new Date(allTimeBestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* This Week's Best Day */}
                    {bestWeekDay && (
                      <div className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                        isNewRecord 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center">
                          {isNewRecord ? (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-orange-600 mr-1" />
                              <Trophy className="w-4 h-4 text-orange-600 mr-2" />
                            </div>
                          ) : (
                            <Award className="w-4 h-4 text-yellow-600 mr-2" />
                          )}
                          <div>
                            <span className="text-sm text-gray-600">
                              {isNewRecord ? 'NEW RECORD!' : 'Best Day This Week'}
                            </span>
                            {isNewRecord && (
                              <div className="text-xs text-orange-600 font-medium">All-Time High!</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${isNewRecord ? 'text-orange-700' : 'text-yellow-700'}`}>
                            {bestWeekDayName}
                          </div>
                          <div className={`text-sm font-medium ${isNewRecord ? 'text-orange-600' : 'text-yellow-600'}`}>
                            €{bestWeekEarnings.toFixed(2)}
                          </div>
                          {isNewRecord && (
                            <div className="text-xs text-orange-500">
                              Previous: €{allTimeBestDay?.earnings.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Top Drivers */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Top Drivers by Earnings
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {topDrivers.map(({ id, total }, index) => (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-2 sm:mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{getDriverName(id)}</span>
                  </div>
                  <span className="font-medium text-sm text-green-600">€{total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          
        </div>

        {/* Passenger Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Daily Passenger Count (Last 30 Days)
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-72 overflow-y-auto">
              {Object.entries(dailyEarnings)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 10)
                .map(([date]) => {
                  const dayPassengers = projects
                    .filter(p => p.date === date)
                    .reduce((sum, p) => sum + (p.passengers || 0), 0);
                  const maxDailyPassengers = Math.max(...Object.keys(dailyEarnings).map(d => 
                    projects.filter(p => p.date === d).reduce((sum, p) => sum + (p.passengers || 0), 0)
                  ));
                  const percentage = maxDailyPassengers ? (dayPassengers / maxDailyPassengers) * 100 : 0;
                  
                  return (
                    <div key={date} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-20 sm:w-24 h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm min-w-[40px] text-right">{dayPassengers}</span>
                      </div>
                    </div>
                  );
                })}
              
              {Object.keys(dailyEarnings).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No passenger data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Passenger Summary Stats */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              Passenger Analytics
            </h3>
            <div className="space-y-4">
              {(() => {
                const avgPassengersPerTrip = projects.length > 0 
                  ? statistics.totalPassengers / projects.length 
                  : 0;
                
                // Find the day with most passengers
                const dailyPassengerCounts = Object.keys(dailyEarnings).map(date => ({
                  date,
                  passengers: projects
                    .filter(p => p.date === date)
                    .reduce((sum, p) => sum + (p.passengers || 0), 0)
                }));
                
                const bestPassengerDay = dailyPassengerCounts.reduce((best, current) => 
                  current.passengers > (best?.passengers || 0) ? current : best
                , null);
                
                // Monthly passenger trend
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                
                const currentMonthPassengers = projects
                  .filter(p => {
                    const date = new Date(p.date);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                  })
                  .reduce((sum, p) => sum + (p.passengers || 0), 0);
                
                const lastMonthPassengers = projects
                  .filter(p => {
                    const date = new Date(p.date);
                    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
                  })
                  .reduce((sum, p) => sum + (p.passengers || 0), 0);
                
                const monthlyGrowth = lastMonthPassengers > 0 
                  ? ((currentMonthPassengers - lastMonthPassengers) / lastMonthPassengers * 100)
                  : 0;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Passengers per Trip</span>
                      <span className="font-semibold text-indigo-600">{avgPassengersPerTrip.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Growth</span>
                      <span className={`font-semibold ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                      </span>
                    </div>
                    
                    {bestPassengerDay && (
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 text-indigo-600 mr-2" />
                            <span className="text-sm text-gray-600">Best Passenger Day</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-indigo-700">{bestPassengerDay.passengers} passengers</div>
                            <div className="text-xs text-indigo-500">
                              {new Date(bestPassengerDay.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-900">{statistics.todayPassengers}</div>
                        <div className="text-xs text-gray-500">Today</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-900">{statistics.weeklyPassengers}</div>
                        <div className="text-xs text-gray-500">This Week</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Growth Trends Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-8 mt-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Revenue Growth Trends - Year over Year Comparison
            </h3>
            {growthTrends && !chartError ? (
              <div className="h-64 sm:h-80">
                <Pie data={growthTrends} options={{
                  ...barChartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value: any) {
                          return '€' + value.toFixed(0);
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 10
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top' as const
                    },
                    tooltip: {
                      enabled: true,
                      displayColors: true,
                      callbacks: {
                        label: function(context: any) {
                          return `${context.dataset.label}: €${context.parsed.y.toFixed(2)}`;
                        }
                      }
                    }
                  }
                }} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No growth trend data available</p>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {(() => {
                if (!growthTrends) return null;
                const currentYearTotal = growthTrends.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const previousYearTotal = growthTrends.datasets[1].data.reduce((a: number, b: number) => a + b, 0);
                const growth = previousYearTotal > 0 ? ((currentYearTotal - previousYearTotal) / previousYearTotal * 100) : 0;
                
                return (
                  <>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Year-over-Year Growth</p>
                      <p className={`text-lg font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue Difference</p>
                      <p className={`text-lg font-bold ${currentYearTotal >= previousYearTotal ? 'text-green-600' : 'text-red-600'}`}>
                        €{Math.abs(currentYearTotal - previousYearTotal).toFixed(0)}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Geographic Heat Map Section */}
        <div className="mt-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-500" />
              Geographic Heat Map - Popular Locations with Earnings
            </h3>
            <LocationAnalytics />
          </div>
        </div>

        {/* Demand Prediction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Hourly Demand Prediction
            </h3>
            {demandPrediction ? (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-1">
                  {demandPrediction.hourly.map((hourData: any, index: number) => (
                    <div
                      key={index}
                      className={`text-center p-2 rounded text-xs font-medium transition-all duration-200 ${
                        hourData.isBusy 
                          ? 'bg-red-500 text-white shadow-md' 
                          : hourData.demand > demandPrediction.thresholds.hourly * 0.7
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={`${index}:00 - ${hourData.demand} projects${hourData.isBusy ? ' (BUSY)' : ''}`}
                    >
                      {index.toString().padStart(2, '0')}
                      <div className="text-xs">{hourData.demand}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>🟥 High Demand</span>
                  <span>🟨 Medium Demand</span>
                  <span>⬜ Low Demand</span>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">Predicted Busy Hours:</p>
                  <p className="text-sm text-orange-600">
                    {demandPrediction.hourly
                      .filter((h: any) => h.isBusy)
                      .map((h: any) => `${h.hour.toString().padStart(2, '0')}:00`)
                      .join(', ') || 'No busy hours predicted'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No demand data available</p>
              </div>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Weekly Demand Prediction
            </h3>
            {demandPrediction ? (
              <div className="space-y-4">
                {demandPrediction.weekly.map((dayData: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      dayData.isBusy 
                        ? 'bg-red-100 border-2 border-red-300' 
                        : dayData.demand > demandPrediction.thresholds.weekly * 0.7
                        ? 'bg-yellow-100 border-2 border-yellow-300'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-3 ${
                        dayData.isBusy ? 'bg-red-500' : 
                        dayData.demand > demandPrediction.thresholds.weekly * 0.7 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="font-medium">{dayData.day}</span>
                      {dayData.isBusy && (
                        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">BUSY</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{dayData.demand} projects</div>
                      <div className="text-xs text-gray-500">{dayData.intensity.toFixed(0)}% intensity</div>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Busiest Days:</p>
                  <p className="text-sm text-blue-600">
                    {demandPrediction.weekly
                      .filter((d: any) => d.isBusy)
                      .map((d: any) => d.day)
                      .join(', ') || 'No particularly busy days identified'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No demand data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Time Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-8">
          {/* Hourly Project Creation */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Projects by Hour of Day
            </h3>
            {hourlyData && !chartError ? (
              <div className="h-64 sm:h-72">
                <Bar data={hourlyData} options={barChartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No hourly data available</p>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500">
              <p>Peak hours: {(() => {
                if (!hourlyData) return 'No data';
                const maxCount = Math.max(...hourlyData.datasets[0].data);
                const peakHours = hourlyData.datasets[0].data
                  .map((count: number, index: number) => count === maxCount ? index : -1)
                  .filter((hour: number) => hour !== -1)
                  .map((hour: number) => `${hour.toString().padStart(2, '0')}:00`);
                return peakHours.join(', ');
              })()}</p>
            </div>
          </div>

          {/* Weekly Project Creation */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 sm:mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Projects by Day of Week
            </h3>
            {weeklyData && !chartError ? (
              <div className="h-64 sm:h-72">
                <Bar data={weeklyData} options={barChartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No weekly data available</p>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500">
              <p>Busiest day: {(() => {
                if (!weeklyData) return 'No data';
                const maxCount = Math.max(...weeklyData.datasets[0].data);
                const maxIndex = weeklyData.datasets[0].data.indexOf(maxCount);
                return `${weeklyData.labels[maxIndex]} (${maxCount} projects)`;
              })()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}