import { useState } from 'react';
import { adminAPI } from '../../services/api';
import { Upload, Download, X, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BulkQuestionUpload = ({ assessmentId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseCSV = (text) => {
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one question');
    }

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/^"(.*)"$/, '$1'));
    const requiredHeaders = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const questions = [];
    const skippedRows = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseLine(lines[i]).map(v => v.replace(/^"(.*)"$/, '$1'));
        const question = {};
        headers.forEach((header, index) => {
          question[header] = (values[index] || '').trim();
        });
        
        if (!question.question || !question.option_a || !question.option_b || 
            !question.option_c || !question.option_d || !question.correct_answer) {
          skippedRows.push({ row: i + 1, reason: 'Missing required fields' });
          continue;
        }

        const validAnswers = ['A', 'B', 'C', 'D'];
        if (!validAnswers.includes(question.correct_answer.toUpperCase())) {
          skippedRows.push({ row: i + 1, reason: 'Correct answer must be A, B, C, or D' });
          continue;
        }

        question.correct_answer = question.correct_answer.toUpperCase();
        questions.push(question);
      } catch (e) {
        skippedRows.push({ row: i + 1, reason: 'Failed to parse row' });
      }
    }

    if (questions.length === 0) {
      throw new Error('No valid questions found in CSV file. Check your data and try again.');
    }

    return { questions, skippedRows };
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const { questions, skippedRows } = parseCSV(text);

      const response = await adminAPI.bulkUploadQuestions(assessmentId, questions);
      
      const fullResult = {
        ...response.data,
        skippedRows: [...skippedRows, ...(response.data.errorDetails || [])],
      };
      
      setResult(fullResult);
      
      if (fullResult.errors === 0 && skippedRows.length === 0) {
        toast.success(fullResult.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const totalIssues = (fullResult.errors || 0) + (fullResult.skippedRows?.length || 0);
        toast(`${fullResult.inserted} imported, ${totalIssues} skipped`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'question,option_a,option_b,option_c,option_d,correct_answer,explanation',
      '"What is the capital of France?","Berlin","Madrid","Paris","Rome","C","Paris is the capital and largest city of France"',
      '"What does HTML stand for?","Hyper Text Markup Language","High Tech Modern Language","Home Tool Markup Language","Hyper Transfer Markup Language","A","HTML stands for HyperText Markup Language"',
      '"Which is a JavaScript framework?","Django","React","Laravel","Flask","B","React is developed by Facebook"',
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#3E2F24]">Import Questions</h2>
            <p className="text-sm text-[#6B5A4E] mt-1">Upload questions in bulk using CSV format</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#FAF5EF] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B5A4E]" />
          </button>
        </div>

        {/* Template Download */}
        <div className="bg-[#FAF5EF] rounded-xl p-4 mb-6 border border-[#E0D3C5]">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#C17A5E] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[#3E2F24] mb-1">CSV Template</h3>
              <p className="text-xs text-[#6B5A4E] mb-3">
                Download the template, fill in your questions in Excel or Google Sheets, export as CSV, and upload it here.
                Make sure correct_answer column contains A, B, C, or D.
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-[#C17A5E] font-medium hover:text-[#A8654A] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer ${
            file 
              ? 'border-[#8FAA7B] bg-[#8FAA7B]/5' 
              : 'border-[#E0D3C5] hover:border-[#C17A5E] bg-[#FAF5EF]/50'
          }`}
          onClick={() => document.getElementById('csv-upload-input').click()}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload-input"
          />
          <Upload className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-[#8FAA7B]' : 'text-[#8B7A6E]'}`} />
          {file ? (
            <div>
              <p className="text-sm font-medium text-[#3E2F24]">{file.name}</p>
              <p className="text-xs text-[#6B5A4E] mt-1">{(file.size / 1024).toFixed(1)} KB - Click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-[#3E2F24]">Click to select CSV file</p>
              <p className="text-xs text-[#6B5A4E] mt-1">or drag and drop here</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-xl p-4 mb-6 ${
            result.errors === 0 && (!result.skippedRows || result.skippedRows.length === 0)
              ? 'bg-[#8FAA7B]/10 border border-[#8FAA7B]/30' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors === 0 && (!result.skippedRows || result.skippedRows.length === 0) ? (
                <CheckCircle className="w-5 h-5 text-[#8FAA7B] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <span className="font-medium text-[#3E2F24]">
                {result.inserted} of {result.total} questions imported successfully
              </span>
            </div>
            
            {result.skippedRows && result.skippedRows.length > 0 && (
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                <p className="text-xs font-medium text-amber-700 mb-1">Skipped rows:</p>
                {result.skippedRows.map((err, i) => (
                  <p key={i} className="text-xs text-amber-600 ml-2">
                    Row {err.row}: {err.reason || err.message}
                  </p>
                ))}
              </div>
            )}

            {result.errorDetails && result.errorDetails.length > 0 && (
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                {result.errorDetails.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 ml-2">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B5A4E] bg-[#FAF5EF] hover:bg-[#E0D3C5] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C17A5E] hover:bg-[#A8654A] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkQuestionUpload;