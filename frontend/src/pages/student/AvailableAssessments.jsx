import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Search, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssessmentCard from '../../components/student/AssessmentCard';

const AvailableAssessments = () => {
  const { studentUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentsRes, submissionsRes] = await Promise.all([
          studentAPI.getPublishedAssessments(),
          studentAPI.getSubmissions(studentUser.id),
        ]);
        setAssessments(assessmentsRes.data.assessments || []);
        setSubmissions(submissionsRes.data.submissions || []);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentUser.id]);

  const getAttemptInfo = (assessmentId) => {
    const maxAttempts = assessments.find(a => a.id === assessmentId)?.max_attempts || 1;
    const usedAttempts = submissions.filter(s => s.assessment_id === assessmentId).length;
    return {
      used: usedAttempts,
      max: maxAttempts,
      remaining: Math.max(0, maxAttempts - usedAttempts),
      canRetake: usedAttempts < maxAttempts,
    };
  };

  const filteredAssessments = assessments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2F24]">Available Assessments</h1>
          <p className="text-[#6B5A4E] mt-1">Browse and take published assessments</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A6E]" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-sm text-[#3E2F24] placeholder-[#8B7A6E]"
          />
        </div>
      </div>

      {filteredAssessments.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((assessment) => {
            const attemptInfo = getAttemptInfo(assessment.id);
            return (
              <AssessmentCard 
                key={assessment.id} 
                assessment={assessment} 
                attemptInfo={attemptInfo}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No assessments available"
          description="There are no published assessments at this time. Check back later."
        />
      )}
    </div>
  );
};

export default AvailableAssessments;