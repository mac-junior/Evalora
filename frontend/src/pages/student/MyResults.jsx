import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, XCircle, Clock, Eye, ChevronRight, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyResults = () => {
  const { studentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await studentAPI.getSubmissions(studentUser.id);
        setSubmissions(response.data.submissions || []);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [studentUser.id]);

  const filteredSubmissions = submissions.filter(s =>
    s.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2F24]">My Results</h1>
          <p className="text-[#6B5A4E] mt-1">View your assessment history and performance</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A6E]" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E] text-sm"
          />
        </div>
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm hover:shadow-md transition-all duration-200 p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  submission.passed ? 'bg-[#8FAA7B]/10' : 'bg-[#D4694A]/10'
                }`}>
                  {submission.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-[#8FAA7B]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-[#D4694A]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#3E2F24] truncate">{submission.assessment_name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-[#6B5A4E] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-sm text-[#6B5A4E]">
                      {Math.floor((submission.time_taken || 0) / 60)}m {(submission.time_taken || 0) % 60}s
                    </span>
                  </div>
                </div>

                <div className="text-center shrink-0">
                  <div className={`text-2xl font-bold ${submission.passed ? 'text-[#8FAA7B]' : 'text-[#D4694A]'}`}>
                    {parseFloat(submission.percentage).toFixed(0)}%
                  </div>
                  <div className="text-xs text-[#6B5A4E]">{submission.score} pts</div>
                </div>

                <Link
                  to={`/student/results/${submission.id}`}
                  className="shrink-0 flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#C17A5E] bg-[#C17A5E]/10 hover:bg-[#C17A5E]/20 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No results yet"
          description="You haven't taken any assessments. Start your first assessment to see results here."
          actionLabel="Take Assessment"
          actionLink="/student/assessments"
        />
      )}
    </div>
  );
};

export default MyResults;