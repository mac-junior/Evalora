import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BookOpen, ClipboardList, TrendingUp, Award, Clock,
  CheckCircle2, XCircle, ArrowRight, BarChart3, Target,
  Sun, Moon, Sunrise,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sunrise };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sun };
  return { text: 'Good Evening', icon: Moon };
};

const Dashboard = () => {
  const { studentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, submissionsRes] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getSubmissions(studentUser.id),
        ]);
        setProfile(profileRes.data.student);
        setSubmissions(submissionsRes.data.submissions || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentUser.id]);

  if (loading) return <LoadingSpinner />;

  const stats = {
    totalAssessments: profile?.assessments_taken || 0,
    averageScore: profile?.average_score || 0,
    passedCount: submissions.filter(s => s.passed).length,
    failedCount: submissions.filter(s => !s.passed).length,
    bestScore: submissions.length > 0 ? Math.max(...submissions.map(s => s.percentage)) : 0,
  };

  const chartData = submissions.slice().reverse().map((s, i) => ({
    name: `#${i + 1}`,
    score: parseFloat(s.percentage),
  }));

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-[#C17A5E] to-[#D48C6C] rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <greeting.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {greeting.text}, {profile?.username || 'Student'}
              </h1>
              <p className="text-white/80 mt-1">Here's your learning overview for today</p>
            </div>
          </div>
          <Link
            to="/student/assessments"
            className="bg-white text-[#3E2F24] px-5 py-2.5 rounded-xl font-medium hover:bg-[#FAF5EF] transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Take Assessment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center border border-[#C17A5E]/20">
              <BookOpen className="w-5 h-5 text-[#C17A5E]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats.totalAssessments}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Total Assessments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#8FAA7B]/10 rounded-xl flex items-center justify-center border border-[#8FAA7B]/20">
              <Target className="w-5 h-5 text-[#8FAA7B]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats.averageScore}%</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Average Score</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#8FAA7B]/10 rounded-xl flex items-center justify-center border border-[#8FAA7B]/20">
              <CheckCircle2 className="w-5 h-5 text-[#8FAA7B]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats.passedCount}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Assessments Passed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#D4694A]/10 rounded-xl flex items-center justify-center border border-[#D4694A]/20">
              <XCircle className="w-5 h-5 text-[#D4694A]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#3E2F24]">{stats.failedCount}</div>
          <p className="text-sm text-[#6B5A4E] mt-1">Need Improvement</p>
        </div>
      </div>

      {/* Chart & Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3E2F24]">Performance Trend</h2>
              <p className="text-sm text-[#6B5A4E]">Your score progression over time</p>
            </div>
            {stats.bestScore > 0 && (
              <div className="flex items-center gap-2 bg-[#8FAA7B]/10 text-[#8FAA7B] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#8FAA7B]/20">
                <Award className="w-4 h-4" />
                Best: {stats.bestScore}%
              </div>
            )}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D3C5" />
                <XAxis dataKey="name" stroke="#6B5A4E" fontSize={12} />
                <YAxis stroke="#6B5A4E" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E0D3C5', borderRadius: '12px', padding: '10px 14px', color: '#3E2F24' }} />
                <Line type="monotone" dataKey="score" stroke="#C17A5E" strokeWidth={2.5} dot={{ fill: '#C17A5E', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B5A4E]">
              <BarChart3 className="w-12 h-12 mb-3" />
              <p className="text-sm">Complete assessments to see your trend</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#3E2F24] mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => (
              <Link
                key={submission.id}
                to={`/student/results/${submission.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FAF5EF] transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  submission.passed ? 'bg-[#8FAA7B]/10' : 'bg-[#D4694A]/10'
                }`}>
                  {submission.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#8FAA7B]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#D4694A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3E2F24] truncate group-hover:text-[#C17A5E] transition-colors">
                    {submission.assessment_name}
                  </p>
                  <span className="text-xs text-[#6B5A4E]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className={`text-sm font-semibold ${submission.passed ? 'text-[#8FAA7B]' : 'text-[#D4694A]'}`}>
                  {submission.percentage}%
                </div>
              </Link>
            ))}
            {submissions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-[#6B5A4E]">
                <ClipboardList className="w-12 h-12 mb-3" />
                <p className="text-sm">No assessments taken yet</p>
                <Link to="/student/assessments" className="text-[#C17A5E] text-sm font-medium mt-2 hover:text-[#A8654A] flex items-center gap-1">
                  Start your first assessment
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
          {submissions.length > 5 && (
            <Link to="/student/my-results" className="flex items-center justify-center gap-1 text-sm text-[#C17A5E] font-medium mt-4 hover:text-[#A8654A] transition-colors">
              View all results
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;