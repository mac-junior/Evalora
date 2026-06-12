import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Results = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsId, setDetailsId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await adminAPI.getSubmissions();
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    setDetailsId(id);
    setDetailsLoading(true);
    try {
      const response = await adminAPI.getSubmissionDetails(id);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s =>
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-gray-500 mt-1">View all student submissions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student, matricule, or assessment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all bg-white text-sm"
          />
        </div>
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Student</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Matricule</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Assessment</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Score</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Time</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{submission.student_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{submission.matricule}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{submission.assessment_name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">
                        {parseFloat(submission.percentage).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({submission.score})</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        submission.passed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {submission.passed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {submission.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor((submission.time_taken || 0) / 60)}m
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewDetails(submission.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No submissions yet"
          description="Student submissions will appear here once assessments are taken."
        />
      )}

      {/* Details Modal */}
      {detailsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setDetailsId(null); setDetails(null); }} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Submission Details - {details?.submission?.assessment_name}
            </h2>
            {detailsLoading ? (
              <LoadingSpinner />
            ) : details ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Student</p>
                    <p className="text-sm font-medium text-gray-900">{details.submission.student_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-sm font-bold text-gray-900">
                      {parseFloat(details.submission.percentage).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`text-sm font-medium ${details.submission.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {details.submission.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {details.answers?.map((answer, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      answer.is_correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          answer.is_correct ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {answer.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{answer.question}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Student answer: <span className={answer.is_correct ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{answer.selected_option || 'N/A'}</span>
                            {!answer.is_correct && (
                              <span className="text-emerald-600 font-medium ml-2">
                                Correct: {answer.correct_answer}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;