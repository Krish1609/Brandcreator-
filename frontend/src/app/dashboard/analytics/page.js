'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Zap,
  Users,
  DollarSign,
  Target,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/analytics/creator';
      if (user.role === 'brand') endpoint = '/analytics/brand';
      else if (user.role === 'admin') endpoint = '/analytics/admin';

      const { data } = await api.get(endpoint);
      setStats(data);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Unable to load analytics</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-2.5"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const isCreator = user?.role === 'creator';
  const isBrand = user?.role === 'brand';
  const isAdmin = user?.role === 'admin';
  const profile = stats?.profile || user?.creatorProfile;

  // Safe monthly chart format
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyChartData = (stats?.monthlyData || []).map(d => {
    const m = d._id?.month || d.month || 1;
    const y = d._id?.year || d.year || '';
    return {
      name: monthNames[m] ? `${monthNames[m]} ${y}` : `${m}/${y}`,
      Applications: d.count || 0
    };
  });

  // Radar metrics for creator
  const radarData = isCreator && profile ? [
    { metric: 'AI Score', value: profile.aiScore || 0 },
    { metric: 'Engagement', value: Math.min(100, (profile.engagementRate || 0) * 10) },
    { metric: 'Authenticity', value: Math.max(0, 100 - (profile.fakeFollowerPercentage || 0)) },
    { metric: 'Consistency', value: profile.contentConsistency || 0 },
    { metric: 'Collabs', value: Math.min(100, (profile.collaborationCount || 0) * 5) },
  ] : [];

  // Parse audience locations
  let audienceLocations = [];
  if (profile?.audienceLocations) {
    if (Array.isArray(profile.audienceLocations)) {
      audienceLocations = profile.audienceLocations;
    } else if (typeof profile.audienceLocations === 'string') {
      try {
        audienceLocations = JSON.parse(profile.audienceLocations);
      } catch (e) {
        audienceLocations = [];
      }
    }
  }

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400">
            {isCreator && 'Deep insights into your content, audience, and earnings performance.'}
            {isBrand && 'Real-time overview of your campaigns, creator proposals, and budget allocation.'}
            {isAdmin && 'Platform-wide health metrics, users, campaigns, and overall revenue velocity.'}
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto glass hover:bg-dark-700 text-gray-300 px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isCreator && [
          { label: 'Total Applications', value: stats?.stats?.totalApplications || 0, icon: Target, color: 'text-blue-400' },
          { label: 'Success Rate', value: `${stats?.stats?.successRate || 0}%`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Completed Deals', value: stats?.stats?.completedCollabs || 0, icon: Users, color: 'text-purple-400' },
          { label: 'Total Earnings', value: `₹${(stats?.stats?.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: 'text-accent-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 hover:border-primary-500/30 transition">
            <Icon size={20} className={`${color} mb-3`} />
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
          </div>
        ))}

        {isBrand && [
          { label: 'Total Campaigns', value: stats?.stats?.totalCampaigns || 0, icon: Briefcase, color: 'text-blue-400' },
          { label: 'Active Campaigns', value: stats?.stats?.activeCampaigns || 0, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Total Proposals', value: stats?.stats?.totalApplications || 0, icon: Users, color: 'text-purple-400' },
          { label: 'Total Spend', value: `₹${(stats?.stats?.totalSpend || 0).toLocaleString()}`, icon: DollarSign, color: 'text-accent-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 hover:border-primary-500/30 transition">
            <Icon size={20} className={`${color} mb-3`} />
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
          </div>
        ))}

        {isAdmin && [
          { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
          { label: 'Active Campaigns', value: stats?.stats?.activeCampaigns || 0, icon: Briefcase, color: 'text-green-400' },
          { label: 'Completed Deals', value: stats?.stats?.completedDeals || 0, icon: CheckCircle2, color: 'text-purple-400' },
          { label: 'Platform Volume', value: `₹${(stats?.stats?.totalSpend || 0).toLocaleString()}`, icon: DollarSign, color: 'text-accent-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 hover:border-primary-500/30 transition">
            <Icon size={20} className={`${color} mb-3`} />
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Charts & Breakdown Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Applications / Trend */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" />
            {isBrand ? 'Campaign Applications Trend' : 'Monthly Application Activity'}
          </h3>
          {monthlyChartData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1A1A26', border: '1px solid #22223A', borderRadius: 8 }} />
                  <Bar dataKey="Applications" fill="#4F63FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-500 text-sm">
              Not enough monthly activity recorded yet.
            </div>
          )}
        </div>

        {/* Brand View: Recent Campaigns List */}
        {isBrand && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-primary-500" /> Recent Campaign Performance
            </h3>
            {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCampaigns.map((c) => (
                  <div
                    key={c.id || c._id}
                    className="flex items-center justify-between p-3.5 bg-dark-800/60 rounded-xl border border-dark-700/50 hover:border-primary-500/30 transition"
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className="font-medium text-sm text-white truncate">{c.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {c.views || 0} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {c.applicationCount || c.applications?.length || 0} proposals
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 text-gray-500 text-sm">
                No campaigns created yet.
              </div>
            )}
          </div>
        )}

        {/* Creator View: Radar Chart or AI Score Breakdown */}
        {isCreator && (
          profile?.aiScore > 0 ? (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={16} className="text-primary-500" /> Creator Performance Radar
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#22223A" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke="#4F63FF" fill="#4F63FF" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">AI Creator Score Breakdown</h3>
              {profile ? (
                <div className="space-y-3.5">
                  {[
                    { label: 'AI Score', value: profile.aiScore || 0, color: '#4F63FF' },
                    { label: 'Engagement Rate', value: Math.min(100, Math.round((profile.engagementRate || 0) * 10)), color: '#22c55e' },
                    { label: 'Authenticity', value: Math.max(0, Math.round(100 - (profile.fakeFollowerPercentage || 0))), color: '#a855f7' },
                    { label: 'Content Consistency', value: profile.contentConsistency || 0, color: '#f59e0b' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-semibold">{value}%</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Complete your profile and run AI analysis to see detailed metrics.</p>
              )}
            </div>
          )
        )}

        {/* Admin View: Platform Breakdown */}
        {isAdmin && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary-500" /> Platform Community Split
            </h3>
            <div className="space-y-4 pt-2">
              {[
                { label: 'Creators', count: stats?.stats?.totalCreators || 0, color: '#4F63FF' },
                { label: 'Brands', count: stats?.stats?.totalBrands || 0, color: '#a855f7' },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-white">{count} registered</span>
                  </div>
                  <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (count / ((stats?.stats?.totalUsers || 1) || 1)) * 100)}%`,
                        background: color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audience Locations for creators */}
      {isCreator && audienceLocations.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Audience Geography</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {audienceLocations.map((loc, idx) => (
              <div key={loc.country || idx} className="flex items-center gap-4">
                <span className="text-sm w-20 text-gray-400 flex-shrink-0 truncate">{loc.country}</span>
                <div className="flex-1 bg-dark-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, loc.percentage || 0))}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{loc.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

