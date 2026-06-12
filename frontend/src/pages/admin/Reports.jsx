import { useState } from 'react';
import { adminAPI } from '../../services/api';
import {
  FileText,
  Download,
  User,
  BookOpen,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [studentId, setStudentId] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [downloading, setDownloading] = useState(null);

  const downloadReport = async (type, id = null) => {
    setDownloading(type);
    try {
      let response;
      let filename;

      if (type === 'student' && id) {
        response = await adminAPI.getStudentReport(id);
        filename = 'student_report.pdf';
      } else if (type === 'assessment' && id) {
        response = await adminAPI.getAssessmentReport(id);
        filename = 'assessment_report.pdf';
      } else if (type === 'class') {
        response = await adminAPI.getClassReport();
        filename = 'class_report.pdf';
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate downloadable PDF reports</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student Performance Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Student Performance</h2>
          <p className="text-sm text-gray-500 mb-4">
            Detailed performance report for a specific student.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all text-sm"
            />
            <button
              onClick={() => downloadReport('student', studentId)}
              disabled={!studentId || downloading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Download className="w-4 h-4" />
              {downloading === 'student' ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Assessment Summary Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Assessment Summary</h2>
          <p className="text-sm text-gray-500 mb-4">
            Summary report for a specific assessment with all student results.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter assessment ID"
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all text-sm"
            />
            <button
              onClick={() => downloadReport('assessment', assessmentId)}
              disabled={!assessmentId || downloading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Download className="w-4 h-4" />
              {downloading === 'assessment' ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Class Performance Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-sky-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Class Performance</h2>
          <p className="text-sm text-gray-500 mb-4">
            Complete class performance report with all student statistics.
          </p>
          <button
            onClick={() => downloadReport('class')}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white py-2.5 rounded-xl font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Download className="w-4 h-4" />
            {downloading === 'class' ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;