import { Link } from 'react-router-dom';
import { BookOpen, Clock, HelpCircle, Target, ArrowRight, RotateCcw, Lock } from 'lucide-react';

const AssessmentCard = ({ assessment, attemptInfo }) => {
  const canTake = attemptInfo ? attemptInfo.canRetake : true;
  const remaining = attemptInfo?.remaining || 0;
  const max = attemptInfo?.max || 1;

  return (
    <div className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      <div className="p-6 flex-1">
        <div className="w-12 h-12 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#C17A5E]/20 transition-colors">
          <BookOpen className="w-6 h-6 text-[#C17A5E]" />
        </div>

        <h3 className="text-lg font-semibold text-[#3E2F24] mb-2 line-clamp-2">
          {assessment.title}
        </h3>
        
        <p className="text-sm text-[#6B5A4E] line-clamp-2 mb-4">
          {assessment.description || 'No description available'}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
            <HelpCircle className="w-4 h-4 text-[#8B7A6E] flex-shrink-0" />
            <span>{assessment.question_count || 0} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
            <Clock className="w-4 h-4 text-[#8B7A6E] flex-shrink-0" />
            <span>{assessment.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
            <Target className="w-4 h-4 text-[#8B7A6E] flex-shrink-0" />
            <span>Pass: {assessment.passing_score}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B5A4E]">
            <RotateCcw className="w-4 h-4 text-[#8B7A6E] flex-shrink-0" />
            <span>{remaining}/{max} left</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#E0D3C5] flex gap-2">
        <Link
          to={`/student/assessments/${assessment.id}/instructions`}
          className="flex-1 text-center text-sm font-medium text-[#C17A5E] bg-[#C17A5E]/10 hover:bg-[#C17A5E]/20 py-2.5 rounded-xl transition-colors"
        >
          Instructions
        </Link>
        {canTake ? (
          <Link
            to={`/student/assessments/${assessment.id}/instructions`}
            className="flex-1 text-center text-sm font-medium text-white bg-[#C17A5E] hover:bg-[#A8654A] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            Start
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 text-center text-sm font-medium text-[#8B7A6E] bg-[#FAF5EF] py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            No attempts left
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentCard;