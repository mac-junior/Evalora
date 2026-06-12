import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, Trash2, Eye, Users, BookOpen, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StudentProgressModal from '../../components/admin/StudentProgressModal';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [progressId, setProgressId] = useState(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteStudent(deleteId);
      toast.success('Student deleted');
      setDeleteId(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2F24]">Students</h1>
          <p className="text-[#6B5A4E] mt-1">Manage registered students</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7A6E]" />
          <input type="text" placeholder="Search by name, matricule, or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E] text-sm" />
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0D3C5]">
                  <th className="text-left text-xs font-medium text-[#6B5A4E] uppercase tracking-wider px-6 py-4">Student</th>
                  <th className="text-left text-xs font-medium text-[#6B5A4E] uppercase tracking-wider px-6 py-4">Matricule</th>
                  <th className="text-center text-xs font-medium text-[#6B5A4E] uppercase tracking-wider px-6 py-4">Assessments</th>
                  <th className="text-center text-xs font-medium text-[#6B5A4E] uppercase tracking-wider px-6 py-4">Avg Score</th>
                  <th className="text-right text-xs font-medium text-[#6B5A4E] uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D3C5]">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FAF5EF] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C17A5E]/10 flex items-center justify-center overflow-hidden shrink-0">
                          {student.profile_pic ? <img src={student.profile_pic} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-semibold text-[#C17A5E]">{student.fullname?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3E2F24]">{student.fullname}</p>
                          <p className="text-xs text-[#6B5A4E]">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-[#6B5A4E]">{student.matricule}</span></td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 text-sm text-[#6B5A4E]"><BookOpen className="w-3.5 h-3.5" />{student.assessments_taken || 0}</span></td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${parseFloat(student.average_score) >= 70 ? 'text-[#8FAA7B]' : parseFloat(student.average_score) >= 50 ? 'text-[#D4A853]' : 'text-[#D4694A]'}`}>
                        <TrendingUp className="w-3.5 h-3.5" />{parseFloat(student.average_score).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setProgressId(student.id)} className="p-2 text-[#6B5A4E] hover:text-[#C17A5E] hover:bg-[#C17A5E]/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(student.id)} className="p-2 text-[#6B5A4E] hover:text-[#D4694A] hover:bg-[#D4694A]/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={Users} title="No students found" description={searchTerm ? 'Try a different search term.' : 'No students registered yet.'} />
      )}

      <StudentProgressModal studentId={progressId} onClose={() => setProgressId(null)} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Student" message="Are you sure you want to delete this student? This will remove all their submissions and data." confirmLabel="Delete" type="danger" />
    </div>
  );
};

export default Students;