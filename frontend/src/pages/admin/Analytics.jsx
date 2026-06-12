import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PASS_FAIL_COLORS = ['#10b981', '#ef4444'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getAssessmentAnalytics();
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner />;

  const passFailData = analytics?.passFailDistribution
    ? [
        { name: 'Passed', value: parseInt(analytics.passFailDistribution.passed) || 0 },
        { name: 'Failed', value: parseInt(analytics.passFailDistribution.failed) || 0 },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform performance insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Average Scores per Assessment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Average Scores by Assessment</h2>
              <p className="text-sm text-gray-500">Performance across assessments</p>
            </div>
          </div>
          {analytics?.scoresByAssessment?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.scoresByAssessment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                  }}
                />
                <Bar dataKey="average_score" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Pass/Fail Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pass/Fail Distribution</h2>
              <p className="text-sm text-gray-500">Overall performance</p>
            </div>
          </div>
          {passFailData[0]?.value > 0 || passFailData[1]?.value > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PASS_FAIL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Submission Trends */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Submission Trends</h2>
              <p className="text-sm text-gray-500">Activity over time</p>
            </div>
          </div>
          {analytics?.submissionTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.submissionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                  }}
                />
                <Line type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="average_score" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Most Missed Questions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Most Missed Questions</h2>
              <p className="text-sm text-gray-500">Questions needing review</p>
            </div>
          </div>
          {analytics?.mostMissedQuestions?.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {analytics.mostMissedQuestions.map((q, index) => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50">
                  <div className="w-6 h-6 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{q.assessment_title}</span>
                      <span className="text-xs text-rose-600 font-medium">
                        {q.incorrect_count} incorrect
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;