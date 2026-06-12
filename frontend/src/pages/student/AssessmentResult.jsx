import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  Award,
  Target,
  Clock,
  Eye,
  ArrowLeft,
  RotateCcw,
  Lock,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AssessmentResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await studentAPI.getSubmissionDetails(submissionId);
        setSubmission(response.data.submission);
        setAnswers(response.data.answers || []);

        // Check remaining attempts
        const assessmentId = response.data.submission.assessment_id;
        const [assessmentRes, submissionsRes] = await Promise.all([
          studentAPI.getAssessment(assessmentId),
          studentAPI.getSubmissions(studentUser.id),
        ]);
        
        const maxAttempts = assessmentRes.data.assessment.max_attempts || 1;
        const usedAttempts = (submissionsRes.data.submissions || [])
          .filter(s => s.assessment_id === assessmentId).length;
        
        setAttemptsRemaining(Math.max(0, maxAttempts - usedAttempts));
      } catch (error) {
        console.error('Failed to load result:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId, studentUser.id]);

  if (loading) return <LoadingSpinner />;
  if (!submission) return null;

  const correctCount = answers.filter(a => a.is_correct).length;
  const incorrectCount = answers.filter(a => !a.is_correct).length;
  const answeredCount = answers.filter(a => a.selected_option).length;
  const unansweredCount = answers.filter(a => !a.selected_option).length;
  const percentage = parseFloat(submission.percentage).toFixed(1);
  const passed = submission.passed;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/my-results')}
        className="inline-flex items-center gap-2 text-[#6B5A4E] hover:text-[#3E2F24] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Results</span>
      </button>

      {/* Result Summary */}
      <div className={`bg-white rounded-2xl border-2 p-8 text-center shadow-sm ${
        passed ? 'border-emerald-200' : 'border-rose-200'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          passed ? 'bg-emerald-100' : 'bg-rose-100'
        }`}>
          {passed ? (
            <Award className="w-10 h-10 text-emerald-600" />
          ) : (
            <XCircle className="w-10 h-10 text-rose-600" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-[#3E2F24] mb-2">
          {passed ? 'Congratulations!' : 'Keep Trying!'}
        </h1>
        <p className="text-[#6B5A4E] mb-6">
          {passed
            ? 'You passed the assessment. Great work!'
            : 'You did not meet the passing score. Review your answers below.'}
        </p>

        <div className="text-5xl font-bold mb-2">
          <span className={passed ? 'text-emerald-600' : 'text-rose-600'}>
            {percentage}%
          </span>
        </div>
        <p className="text-sm text-[#6B5A4E]">
          {submission.score} / {answers.length} correct
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E0D3C5] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#3E2F24]">{correctCount}</div>
              <div className="text-xs text-[#6B5A4E]">Correct</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0D3C5] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#3E2F24]">{incorrectCount}</div>
              <div className="text-xs text-[#6B5A4E]">Incorrect</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0D3C5] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#3E2F24]">{answeredCount}/{answers.length}</div>
              <div className="text-xs text-[#6B5A4E]">Answered</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0D3C5] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#3E2F24]">
                {Math.floor((submission.time_taken || 0) / 60)}m {(submission.time_taken || 0) % 60}s
              </div>
              <div className="text-xs text-[#6B5A4E]">Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unanswered Warning */}
      {unansweredCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-700">
            You left {unansweredCount} question(s) unanswered. These were marked as incorrect.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/student/results/${submissionId}/review`}
          className="flex-1 bg-[#C17A5E] text-white py-3 rounded-xl font-medium hover:bg-[#A8654A] transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          Review Answers
        </Link>
        
        {attemptsRemaining > 0 ? (
          <Link
            to="/student/assessments"
            className="flex-1 bg-white text-[#6B5A4E] py-3 rounded-xl font-medium border border-[#E0D3C5] hover:bg-[#FAF5EF] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Take Another ({attemptsRemaining} left)
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 bg-[#FAF5EF] text-[#8B7A6E] py-3 rounded-xl font-medium border border-[#E0D3C5] flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-5 h-5" />
            No attempts left
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentResult;