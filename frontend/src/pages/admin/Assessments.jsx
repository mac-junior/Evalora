import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Target,
  Search,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [resetId, setResetId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 70,
    max_attempts: 1,
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await adminAPI.getAssessments();
      setAssessments(response.data.assessments || []);
    } catch (error) {
      console.error('Failed to load assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.duration_minutes || formData.duration_minutes < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }
    if (!formData.passing_score || formData.passing_score < 1 || formData.passing_score > 100) {
      toast.error('Passing score must be between 1 and 100');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updateData = {
          ...formData,
          published: false,
        };
        await adminAPI.updateAssessment(editingId, updateData);
        toast.success('Assessment updated. All attempts reset. Publish when ready.');
      } else {
        await adminAPI.createAssessment(formData);
        toast.success('Assessment created successfully');
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ title: '', description: '', duration_minutes: 30, passing_score: 70, max_attempts: 1 });
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (assessment) => {
    setFormData({
      title: assessment.title,
      description: assessment.description || '',
      duration_minutes: assessment.duration_minutes,
      passing_score: assessment.passing_score,
      max_attempts: assessment.max_attempts || 1,
    });
    setEditingId(assessment.id);
    setShowCreate(true);
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteAssessment(deleteId);
      toast.success('Assessment deleted successfully');
      setDeleteId(null);
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete assessment');
    }
  };

  const handleReset = async () => {
    setResettingId(resetId);
    try {
      const response = await adminAPI.resetAttempts(resetId);
      toast.success(response.data.message);
      setResetId(null);
      fetchAssessments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset attempts');
    } finally {
      setResettingId(null);
      setResetId(null);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const response = await adminAPI.togglePublish(id);
      const updatedAssessment = response.data.assessment;
      
      setAssessments(prev => 
        prev.map(a => a.id === id ? { ...a, published: updatedAssessment.published } : a)
      );
      
      toast.success(
        updatedAssessment.published 
          ? 'Assessment is now LIVE - students can see it' 
          : 'Assessment is now DRAFT - hidden from students'
      );
    } catch (error) {
      console.error('Toggle failed:', error);
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredAssessments = assessments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2F24]">Assessments</h1>
          <p className="text-[#6B5A4E] mt-1">Create and manage MCQ assessments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A6E]" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-sm text-[#3E2F24] placeholder-[#8B7A6E]"
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', description: '', duration_minutes: 30, passing_score: 70, max_attempts: 1 });
              setShowCreate(true);
            }}
            className="flex items-center gap-2 bg-[#C17A5E] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#A8654A] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Assessment
          </button>
        </div>
      </div>

      {filteredAssessments.length > 0 ? (
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm hover:shadow-md transition-all duration-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-[#C17A5E]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-base font-semibold text-[#3E2F24] truncate">
                      {assessment.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      assessment.published
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {assessment.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  {assessment.description && (
                    <p className="text-sm text-[#6B5A4E] line-clamp-1 mb-2">{assessment.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-[#6B5A4E] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8B7A6E]" />
                      {assessment.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-[#8B7A6E]" />
                      Pass: {assessment.passing_score}%
                    </span>
                    <span className="text-[#8B7A6E]">
                      {assessment.question_count || 0} questions
                    </span>
                    <span className="text-[#8B7A6E]">
                      {assessment.submission_count || 0} submissions
                    </span>
                    <span className="text-[#8B7A6E]">
                      {assessment.max_attempts || 1} attempt(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => handleToggle(assessment.id)}
                    disabled={togglingId === assessment.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      assessment.published
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingId === assessment.id ? (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ...
                      </span>
                    ) : assessment.published ? (
                      'Published'
                    ) : (
                      'Publish'
                    )}
                  </button>
                  
                  <Link
                    to={`/admin/assessments/${assessment.id}/questions`}
                    className="px-3 py-1.5 text-xs font-medium text-[#5C4B3A] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-lg transition-colors border border-[#E0D3C5]"
                  >
                    Questions
                  </Link>

                  {(assessment.submission_count > 0) && (
                    <button
                      onClick={() => setResetId(assessment.id)}
                      disabled={resettingId === assessment.id}
                      className="p-1.5 text-[#6B5A4E] hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Reset all attempts for this assessment"
                    >
                      {resettingId === assessment.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(assessment)}
                    className="p-1.5 text-[#6B5A4E] hover:text-[#C17A5E] hover:bg-[#FAF5EF] rounded-lg transition-colors"
                    title="Edit assessment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setDeleteId(assessment.id)}
                    className="p-1.5 text-[#6B5A4E] hover:text-[#D4694A] hover:bg-[#FAF5EF] rounded-lg transition-colors"
                    title="Delete assessment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No assessments yet"
          description="Create your first assessment to get started."
          actionLabel="Create Assessment"
          onAction={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', duration_minutes: 30, passing_score: 70, max_attempts: 1 });
            setShowCreate(true);
          }}
        />
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#3E2F24] mb-4">
              {editingId ? 'Edit Assessment' : 'Create Assessment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                  placeholder="e.g., JavaScript Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E] resize-none"
                  placeholder="Brief description of the assessment"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Duration (min) *</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Pass Score (%) *</label>
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    max="100"
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Max Attempts</label>
                  <input
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#6B5A4E] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#C17A5E] hover:bg-[#A8654A] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update & Reset Attempts' : 'Create Assessment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This action cannot be undone and will remove all associated questions and submissions."
        confirmLabel="Delete Assessment"
        type="danger"
      />

      {/* Reset Attempts Confirmation */}
      <ConfirmDialog
        isOpen={!!resetId}
        onClose={() => setResetId(null)}
        onConfirm={handleReset}
        title="Reset All Attempts"
        message="This will delete all student submissions for this assessment. All students will be able to retake it with fresh attempts. This action cannot be undone."
        confirmLabel="Reset Attempts"
        type="warning"
      />
    </div>
  );
};

export default Assessments;