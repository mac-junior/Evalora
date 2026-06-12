import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { Clock, HelpCircle, Target, AlertCircle, ArrowLeft, Play, BookOpen } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await studentAPI.getAssessment(id);
        setAssessment(response.data.assessment);
      } catch (error) {
        console.error('Failed to load assessment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!assessment) return null;

  const instructions = [
    'Read each question carefully before selecting an answer.',
    'You must answer all questions before submitting the assessment.',
    'Once submitted, your answers cannot be modified.',
    'Ensure you have a stable internet connection throughout the assessment.',
    'Monitor the countdown timer and manage your time effectively.',
    'You can navigate between questions using the Previous and Next buttons.',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/student/assessments" className="inline-flex items-center gap-2 text-[#6B5A4E] hover:text-[#3E2F24] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Assessments</span>
      </Link>

      <div className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[#C17A5E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#3E2F24]">{assessment.title}</h1>
            <p className="text-[#6B5A4E] text-sm mt-1">{assessment.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#FAF5EF] rounded-xl p-4 text-center border border-[#E0D3C5]">
            <HelpCircle className="w-5 h-5 text-[#C17A5E] mx-auto mb-2" />
            <div className="text-lg font-bold text-[#3E2F24]">{assessment.question_count || 0}</div>
            <div className="text-xs text-[#6B5A4E]">Questions</div>
          </div>
          <div className="bg-[#FAF5EF] rounded-xl p-4 text-center border border-[#E0D3C5]">
            <Clock className="w-5 h-5 text-[#C17A5E] mx-auto mb-2" />
            <div className="text-lg font-bold text-[#3E2F24]">{assessment.duration_minutes}</div>
            <div className="text-xs text-[#6B5A4E]">Minutes</div>
          </div>
          <div className="bg-[#FAF5EF] rounded-xl p-4 text-center border border-[#E0D3C5]">
            <Target className="w-5 h-5 text-[#C17A5E] mx-auto mb-2" />
            <div className="text-lg font-bold text-[#3E2F24]">{assessment.passing_score}%</div>
            <div className="text-xs text-[#6B5A4E]">Pass Score</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-[#D4A853]" />
          <h2 className="text-lg font-semibold text-[#3E2F24]">Important Instructions</h2>
        </div>
        <ul className="space-y-3">
          {instructions.map((instruction, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-[#6B5A4E]">
              <div className="w-5 h-5 rounded-full bg-[#C17A5E]/10 text-[#C17A5E] flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                {index + 1}
              </div>
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#E0D3C5] text-[#C17A5E] focus:ring-[#C17A5E]"
          />
          <span className="text-sm text-[#6B5A4E]">
            I have read and understood all the instructions. I am ready to begin the assessment.
          </span>
        </label>

        <button
          onClick={() => navigate(`/student/assessments/${id}/take`)}
          disabled={!acknowledged}
          className="w-full mt-4 bg-[#C17A5E] text-white py-3 rounded-xl font-medium hover:bg-[#A8654A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start Assessment
        </button>
      </div>
    </div>
  );
};

export default Instructions;