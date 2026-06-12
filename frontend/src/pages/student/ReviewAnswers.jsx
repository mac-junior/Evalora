import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReviewAnswers = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [allAttemptsUsed, setAllAttemptsUsed] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);

  useEffect(() => {
    const fetchReview = async () => {
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
        
        const remaining = Math.max(0, maxAttempts - usedAttempts);
        setAttemptsRemaining(remaining);
        setAllAttemptsUsed(remaining === 0);
      } catch (error) {
        console.error('Failed to load review:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [submissionId, studentUser.id]);

  if (loading) return <LoadingSpinner />;
  if (!submission) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];
  const answeredQuestions = answers.filter(a => a.selected_option);
  const unansweredQuestions = answers.filter(a => !a.selected_option);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/student/results/${submissionId}`)}
          className="inline-flex items-center gap-2 text-[#6B5A4E] hover:text-[#3E2F24] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Results</span>
        </button>
        <div className="text-sm text-[#6B5A4E]">
          Score: <span className="font-bold text-[#3E2F24]">{submission.score}/{answers.length}</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#3E2F24]">Answer Review</h1>

      {/* Attempts Warning */}
      {!allAttemptsUsed && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Correct answers are hidden</p>
            <p className="text-sm text-amber-700">
              You have {attemptsRemaining} attempt(s) remaining. Correct answers and explanations will be revealed after you use all your attempts to prevent cheating.
            </p>
          </div>
        </div>
      )}

      {/* All attempts used - show corrections */}
      {allAttemptsUsed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800 mb-1">All attempts used</p>
            <p className="text-sm text-emerald-700">
              Correct answers and explanations are now visible for all questions. Use this to learn and improve!
            </p>
          </div>
        </div>
      )}

      {/* Questions Review */}
      <div className="space-y-4">
        {answers.map((answer, index) => {
          const isAnswered = !!answer.selected_option;
          const showCorrectAnswer = allAttemptsUsed;
          
          return (
            <div key={index} className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full p-5 flex items-start gap-4 text-left hover:bg-[#FAF5EF] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  !isAnswered
                    ? 'bg-gray-100 text-gray-400'
                    : answer.is_correct
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}>
                  {!isAnswered ? (
                    <span className="text-sm font-bold">-</span>
                  ) : answer.is_correct ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#3E2F24] font-medium pr-8">
                    <span className="text-[#8B7A6E] mr-2">Q{index + 1}.</span>
                    {answer.question}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {isAnswered ? (
                      <span className={`text-sm font-medium ${
                        answer.is_correct ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        Your answer: {answer.selected_option}
                      </span>
                    ) : (
                      <span className="text-sm text-[#8B7A6E] italic">Not answered</span>
                    )}
                    {!isAnswered && showCorrectAnswer && (
                      <span className="text-sm font-medium text-emerald-600">
                        Correct: {answer.correct_answer}
                      </span>
                    )}
                    {isAnswered && !answer.is_correct && showCorrectAnswer && (
                      <span className="text-sm font-medium text-emerald-600">
                        Correct: {answer.correct_answer}
                      </span>
                    )}
                    {!showCorrectAnswer && (
                      <Lock className="w-3.5 h-3.5 text-[#8B7A6E]" />
                    )}
                  </div>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#8B7A6E] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8B7A6E] flex-shrink-0" />
                )}
              </button>

              {expandedIndex === index && (
                <div className="px-5 pb-5 border-t border-[#E0D3C5]">
                  <div className="mt-4 space-y-2">
                    {optionLabels.map((label) => {
                      const optionKey = `option_${label.toLowerCase()}`;
                      const isSelected = answer.selected_option === label;
                      const isCorrectAnswer = answer.correct_answer === label;
                      
                      let optionClass = 'border-[#E0D3C5] bg-white';
                      if (showCorrectAnswer && isCorrectAnswer) {
                        optionClass = 'border-emerald-300 bg-emerald-50';
                      } else if (isSelected && !isCorrectAnswer && showCorrectAnswer) {
                        optionClass = 'border-rose-300 bg-rose-50';
                      } else if (isSelected) {
                        optionClass = 'border-[#C17A5E] bg-[#C17A5E]/5';
                      }

                      return (
                        <div key={label} className={`p-3 rounded-xl border-2 flex items-center gap-3 ${optionClass}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                            showCorrectAnswer && isCorrectAnswer
                              ? 'bg-emerald-600 text-white'
                              : isSelected && showCorrectAnswer && !isCorrectAnswer
                              ? 'bg-rose-600 text-white'
                              : isSelected
                              ? 'bg-[#C17A5E] text-white'
                              : 'bg-[#FAF5EF] text-[#6B5A4E]'
                          }`}>
                            {label}
                          </div>
                          <span className="text-sm text-[#3E2F24]">{answer[optionKey]}</span>
                          {showCorrectAnswer && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                          {isSelected && !isCorrectAnswer && showCorrectAnswer && <XCircle className="w-4 h-4 text-rose-600 ml-auto" />}
                          {isSelected && !showCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-[#C17A5E] ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation - only shown when all attempts used */}
                  {showCorrectAnswer && answer.explanation && (
                    <div className="mt-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-sky-900 mb-1">Explanation</p>
                          <p className="text-sm text-sky-700 leading-relaxed">{answer.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showCorrectAnswer && answer.explanation && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <Lock className="w-5 h-5 text-[#8B7A6E] mx-auto mb-2" />
                      <p className="text-sm text-[#8B7A6E]">
                        Explanation locked until all attempts are used
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewAnswers;