import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  X,
  User,
  Hash,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentProgressModal = ({ studentId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await adminAPI.getStudentProgress(studentId);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load student progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [studentId]);

  if (!studentId) return null;

  const { student, stats, attempts } = data || {};

  const chartData = attempts
    ? [...attempts].reverse().map((a, i) => ({
        name: `#${i + 1}`,
        score: parseFloat(a.percentage),
        assessment: a.assessment_name,
      }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#3E2F24]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E0D3C5]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6B5A4E] hover:text-[#3E2F24] hover:bg-[#FAF5EF] rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#E0D3C5]">
              <div className="w-16 h-16 rounded-full bg-[#C17A5E]/10 flex items-center justify-center overflow-hidden shrink-0 border border-[#C17A5E]/20">
                {student?.profile_pic ? (
                  <img src={student.profile_pic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#C17A5E]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3E2F24]">{student?.fullname}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-[#6B5A4E]">
                  <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{student?.matricule}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{stats?.total_assessments || 0} assessments</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#C17A5E]/5 rounded-xl p-4 text-center border border-[#C17A5E]/10">
                <BookOpen className="w-5 h-5 text-[#C17A5E] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3E2F24]">{stats?.total_assessments || 0}</div>
                <div className="text-xs text-[#6B5A4E]">Total Taken</div>
              </div>
              <div className="bg-[#8FAA7B]/5 rounded-xl p-4 text-center border border-[#8FAA7B]/10">
                <TrendingUp className="w-5 h-5 text-[#8FAA7B] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3E2F24]">{stats?.highest_score || 0}%</div>
                <div className="text-xs text-[#6B5A4E]">Highest Score</div>
              </div>
              <div className="bg-[#D4694A]/5 rounded-xl p-4 text-center border border-[#D4694A]/10">
                <Target className="w-5 h-5 text-[#D4694A] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3E2F24]">{stats?.lowest_score || 0}%</div>
                <div className="text-xs text-[#6B5A4E]">Lowest Score</div>
              </div>
              <div className="bg-[#D4A853]/5 rounded-xl p-4 text-center border border-[#D4A853]/10">
                <Award className="w-5 h-5 text-[#D4A853] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3E2F24]">{stats?.average_score || 0}%</div>
                <div className="text-xs text-[#6B5A4E]">Average Score</div>
              </div>
            </div>

            {/* Pass Rate */}
            <div className="flex items-center gap-4 bg-[#FAF5EF] rounded-xl p-4 border border-[#E0D3C5]">
              <div className="text-sm text-[#6B5A4E]">Pass Rate:</div>
              <div className="text-lg font-bold text-[#3E2F24]">{stats?.pass_rate || 0}%</div>
              <div className="flex-1 h-2 bg-[#E0D3C5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8FAA7B] rounded-full transition-all"
                  style={{ width: `${stats?.pass_rate || 0}%` }}
                />
              </div>
            </div>

            {/* Chart */}
            <div>
              <h3 className="text-lg font-semibold text-[#3E2F24] mb-4">Performance Trend</h3>
              {chartData.length > 0 ? (
                <div className="bg-[#FAF5EF] rounded-xl border border-[#E0D3C5] p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0D3C5" />
                      <XAxis dataKey="name" stroke="#6B5A4E" fontSize={12} />
                      <YAxis stroke="#6B5A4E" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #E0D3C5',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          color: '#3E2F24',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#C17A5E"
                        strokeWidth={2.5}
                        dot={{ fill: '#C17A5E', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-[#6B5A4E] text-center py-8">No assessment data available</p>
              )}
            </div>

            {/* Recent Attempts */}
            <div>
              <h3 className="text-lg font-semibold text-[#3E2F24] mb-4">Recent Attempts</h3>
              {attempts && attempts.length > 0 ? (
                <div className="space-y-2">
                  {attempts.slice(0, 10).map((attempt) => (
                    <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#FAF5EF] border border-[#E0D3C5]">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        attempt.passed ? 'bg-[#8FAA7B]/10' : 'bg-[#D4694A]/10'
                      }`}>
                        {attempt.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#8FAA7B]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#D4694A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3E2F24] truncate">{attempt.assessment_name}</p>
                        <p className="text-xs text-[#6B5A4E] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(attempt.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${attempt.passed ? 'text-[#8FAA7B]' : 'text-[#D4694A]'}`}>
                        {parseFloat(attempt.percentage).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B5A4E] text-center py-8">No attempts yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgressModal;