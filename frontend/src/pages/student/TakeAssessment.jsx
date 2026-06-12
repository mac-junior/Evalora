import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { studentUser } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasSubmittedRef = useRef(false);
  const maxViolations = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, questionsRes] = await Promise.all([
          studentAPI.getAssessment(id),
          studentAPI.getQuestions(id),
        ]);
        const assessmentData = assessmentRes.data.assessment;
        const questionsData = questionsRes.data.questions || [];
        
        if (assessmentData.max_attempts) {
          const submissionsRes = await studentAPI.getSubmissions(studentUser.id);
          const attemptsUsed = (submissionsRes.data.submissions || [])
            .filter(s => s.assessment_id === id).length;
          
          if (attemptsUsed >= assessmentData.max_attempts) {
            navigate('/student/assessments');
            return;
          }
        }
        
        setAssessment(assessmentData);
        setQuestions(questionsData);
        setTimeLeft(assessmentData.duration_minutes * 60);
      } catch (error) {
        console.error('Failed to load assessment:', error);
        toast.error('Failed to load assessment');
        navigate('/student/assessments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, studentUser.id]);

  const submitAssessment = useCallback(async (isQuit = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    setSubmitting(true);
    setShowWarning(false);
    setShowQuitWarning(false);
    
    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const answersArray = questions
        .filter(q => answers[q.id])
        .map(q => ({
          question_id: q.id,
          selected_option: answers[q.id],
        }));

      const response = await studentAPI.submitAssessment({
        student_id: studentUser.id,
        assessment_id: id,
        answers: answersArray,
        time_taken: timeTaken,
      });

      if (isQuit) {
        toast.success('Assessment submitted. You lost 1 attempt.');
      } else {
        toast.success('Assessment submitted successfully!');
      }
      navigate(`/student/results/${response.data.submission.id}`);
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to submit assessment');
      hasSubmittedRef.current = false;
      setSubmitting(false);
      setQuitting(false);
    }
  }, [questions, answers, studentUser.id, id, navigate]);

  const handleSubmit = () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowWarning(true);
      return;
    }
    submitAssessment(false);
  };

  const handleQuit = () => {
    setShowQuitWarning(true);
  };

  const confirmQuit = () => {
    setQuitting(true);
    submitAssessment(true);
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || hasSubmittedRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmittedRef.current && questions.length > 0) {
      submitAssessment(false);
    }
  }, [timeLeft, questions.length, submitAssessment]);

  // Tab switch detection - anti-cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current) {
        setTabViolations(prev => {
          const newCount = prev + 1;
          
          if (newCount >= maxViolations) {
            toast.error(`You left the tab ${maxViolations} times. Assessment auto-submitted.`);
            setTimeout(() => submitAssessment(true), 500);
          } else {
            setShowTabWarning(true);
            toast.error(`Warning! Tab switch detected (${newCount}/${maxViolations}). You will lose your attempt after ${maxViolations} violations.`);
            setTimeout(() => setShowTabWarning(false), 3000);
          }
          
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitAssessment]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'a' || e.key === 'A') {
        selectAnswer(questions[currentIndex]?.id, 'A');
      } else if (e.key === 'b' || e.key === 'B') {
        selectAnswer(questions[currentIndex]?.id, 'B');
      } else if (e.key === 'c' || e.key === 'C') {
        selectAnswer(questions[currentIndex]?.id, 'C');
      } else if (e.key === 'd' || e.key === 'D') {
        selectAnswer(questions[currentIndex]?.id, 'D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions]);

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) return <LoadingSpinner />;
  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#3E2F24] mb-2">No Questions Available</h2>
        <p className="text-[#6B5A4E]">This assessment has no questions yet. Please contact your instructor.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E0D3C5] p-4 shadow-sm mb-6 sticky top-4 z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#3E2F24] truncate">{assessment?.title}</h1>
            <p className="text-sm text-[#6B5A4E]">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quit Button */}
            <button
              onClick={handleQuit}
              disabled={submitting || quitting}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              Quit
            </button>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' :
              timeLeft < 300 ? 'bg-amber-50 text-amber-600' :
              'bg-[#C17A5E]/10 text-[#C17A5E]'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-[#FAF5EF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C17A5E] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tab Switch Warning Banner */}
      {showTabWarning && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Tab Switch Detected!</p>
            <p className="text-sm text-red-700">
              You left the assessment tab. Violation {tabViolations}/{maxViolations}. 
              After {maxViolations} violations, your attempt will be forfeited.
            </p>
          </div>
        </div>
      )}

      {/* Anti-Cheat Notice */}
      <div className="bg-white rounded-2xl border border-[#E0D3C5] p-4 mb-6 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-sm text-[#6B5A4E]">
          <Eye className="w-4 h-4" />
          Do not leave this tab during the assessment. 
          <span className="font-medium text-red-600">
            Tab switches: {tabViolations}/{maxViolations}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-[#E0D3C5] p-6 shadow-sm mb-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 bg-[#C17A5E] text-white rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold">
            {currentIndex + 1}
          </div>
          <p className="text-lg text-[#3E2F24] font-medium leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => (
            <button
              key={option}
              onClick={() => selectAnswer(currentQuestion.id, option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                answers[currentQuestion.id] === option
                  ? 'border-[#C17A5E] bg-[#C17A5E]/5'
                  : 'border-[#E0D3C5] hover:border-[#C17A5E]/50 hover:bg-[#FAF5EF]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ${
                answers[currentQuestion.id] === option
                  ? 'bg-[#C17A5E] text-white'
                  : 'bg-[#FAF5EF] text-[#6B5A4E]'
              }`}>
                {option}
              </div>
              <span className="text-[#3E2F24]">{currentQuestion[`option_${option.toLowerCase()}`]}</span>
              {answers[currentQuestion.id] === option && (
                <CheckCircle className="w-5 h-5 text-[#C17A5E] ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Question Grid */}
      <div className="bg-white rounded-2xl border border-[#E0D3C5] p-4 shadow-sm mb-6">
        <p className="text-xs text-[#8B7A6E] mb-3 font-medium">QUICK NAVIGATION</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-[#C17A5E] text-white shadow-sm'
                  : answers[q.id]
                  ? 'bg-[#8FAA7B]/15 text-[#8FAA7B] border border-[#8FAA7B]/30'
                  : 'bg-[#FAF5EF] text-[#6B5A4E] border border-[#E0D3C5] hover:border-[#C17A5E]/50'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0D3C5] shadow-lg z-30 lg:left-64">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#E0D3C5] text-[#6B5A4E] hover:bg-[#FAF5EF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-[#6B5A4E] font-medium">
            {currentIndex + 1} / {questions.length}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#C17A5E] text-white hover:bg-[#A8654A] transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#8FAA7B] text-white hover:bg-[#7A9A6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Assessment
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-[#8B7A6E] pb-4">
        Keyboard shortcuts: ← → to navigate • A B C D to select answers
      </div>

      {/* Submit Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowWarning(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#3E2F24] mb-2">Unanswered Questions</h3>
                <p className="text-sm text-[#6B5A4E]">
                  You have {questions.filter(q => !answers[q.id]).length} unanswered questions.
                  Are you sure you want to submit?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-sm font-medium text-[#6B5A4E] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-xl transition-colors"
              >
                Return to Assessment
              </button>
              <button
                onClick={() => submitAssessment(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Warning Modal */}
      {showQuitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowQuitWarning(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#3E2F24] mb-2">Quit Assessment?</h3>
                <p className="text-sm text-[#6B5A4E]">
                  Are you sure you want to quit? This will count as an attempt and you will lose 1 of your remaining attempts. Your current answers will be submitted for grading.
                </p>
                {questions.filter(q => !answers[q.id]).length > 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Warning: You have {questions.filter(q => !answers[q.id]).length} unanswered questions!
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowQuitWarning(false)}
                className="px-4 py-2 text-sm font-medium text-[#6B5A4E] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-xl transition-colors"
              >
                Continue Assessment
              </button>
              <button
                onClick={confirmQuit}
                disabled={quitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {quitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Quitting...
                  </>
                ) : (
                  'Quit & Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAssessment;