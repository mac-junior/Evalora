import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { BookOpen, Users, ClipboardList, TrendingUp, Award } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getOverviewStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3E2F24]">Overview</h1>
        <p className="text-[#6B5A4E] mt-1">Platform statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center border border-[#C17A5E]/20">
              <BookOpen className="w-5 h-5 text-[#C17A5E]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats?.total_assessments || 0}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Total Assessments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#8FAA7B]/10 rounded-xl flex items-center justify-center border border-[#8FAA7B]/20">
              <Users className="w-5 h-5 text-[#8FAA7B]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats?.total_students || 0}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Total Students</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#D4A853]/10 rounded-xl flex items-center justify-center border border-[#D4A853]/20">
              <ClipboardList className="w-5 h-5 text-[#D4A853]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats?.total_submissions || 0}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Total Submissions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#8B6F5E]/10 rounded-xl flex items-center justify-center border border-[#8B6F5E]/20">
              <Award className="w-5 h-5 text-[#8B6F5E]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats?.pass_rate || 0}%</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Pass Rate</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#C17A5E] to-[#D48C6C] rounded-2xl p-8 text-center shadow-md">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Average Score</h2>
        <div className="text-5xl font-bold text-white">{stats?.average_score || 0}%</div>
        <p className="text-white/80 mt-2">Across all submissions</p>
      </div>
    </div>
  );
};

export default Overview;