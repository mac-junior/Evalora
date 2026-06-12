import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Plus, Edit, Trash2, ArrowLeft, HelpCircle, CheckCircle2, Search, Upload } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BulkQuestionUpload from '../../components/admin/BulkQuestionUpload';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const Questions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [assessmentRes, questionsRes] = await Promise.all([adminAPI.getAssessment(id), adminAPI.getQuestions(id)]);
      setAssessment(assessmentRes.data.assessment);
      setQuestions(questionsRes.data.questions || []);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...formData, assessment_id: id };
      if (editingId) {
        await adminAPI.updateQuestion(editingId, data);
        toast.success('Question updated');
      } else {
        await adminAPI.addQuestion(data);
        toast.success('Question added');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    setFormData({ question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer, explanation: q.explanation || '' });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteQuestion(deleteId);
      toast.success('Question deleted');
      setDeleteId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredQuestions = questions.filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/assessments')} className="text-[#6B5A4E] hover:text-[#3E2F24] transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-[#3E2F24]">{assessment?.title}</h1>
            <p className="text-[#6B5A4E] mt-1">{questions.length} questions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A6E]" />
            <input type="text" placeholder="Search questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E] text-sm" />
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 bg-[#8FAA7B] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#7A9A6A] transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button onClick={() => { setEditingId(null); setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' }); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#C17A5E] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#A8654A] transition-colors text-sm">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-3">
          {filteredQuestions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#C17A5E]/10 text-[#C17A5E] rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#3E2F24] font-medium mb-3">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${q.correct_answer === opt ? 'bg-[#8FAA7B]/10 text-[#8FAA7B]' : 'bg-[#FAF5EF] text-[#6B5A4E]'}`}>
                        <span className="font-bold">{opt}.</span>
                        <span className="truncate">{q[`option_${opt.toLowerCase()}`]}</span>
                        {q.correct_answer === opt && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-xs text-[#6B5A4E] mt-3 truncate">{q.explanation}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(q)} className="p-2 text-[#6B5A4E] hover:text-[#C17A5E] hover:bg-[#C17A5E]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(q.id)} className="p-2 text-[#6B5A4E] hover:text-[#D4694A] hover:bg-[#D4694A]/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={HelpCircle} title="No questions yet" description="Add your first question to this assessment." />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#3E2F24]/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#E0D3C5]">
            <h2 className="text-xl font-bold text-[#3E2F24] mb-4">{editingId ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Question</label>
                <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} required rows={3}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] resize-none" placeholder="Enter your question" />
              </div>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt}>
                  <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Option {opt}</label>
                  <input type="text" value={formData[`option_${opt.toLowerCase()}`]} onChange={(e) => setFormData({ ...formData, [`option_${opt.toLowerCase()}`]: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24]" placeholder={`Option ${opt}`} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Correct Answer</label>
                <select value={formData.correct_answer} onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24]">
                  {['A', 'B', 'C', 'D'].map((opt) => (<option key={opt} value={opt}>Option {opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Explanation</label>
                <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] resize-none" placeholder="Explain why this is the correct answer" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-[#6B5A4E] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-[#C17A5E] hover:bg-[#A8654A] rounded-xl transition-colors disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkQuestionUpload
          assessmentId={id}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={fetchData}
        />
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Question" message="Are you sure you want to delete this question?" confirmLabel="Delete" type="danger" />
    </div>
  );
};

export default Questions;