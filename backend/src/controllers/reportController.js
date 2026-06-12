import PDFDocument from 'pdfkit';
import pool from '../config/database.js';

export const generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentResult = await pool.query(
      `SELECT s.*,
        COUNT(sub.id) as total_assessments,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score
       FROM students s
       LEFT JOIN submissions sub ON s.id = sub.student_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const submissionsResult = await pool.query(
      `SELECT sub.*, a.title as assessment_name
       FROM submissions sub
       JOIN assessments a ON sub.assessment_id = a.id
       WHERE sub.student_id = $1
       ORDER BY sub.submitted_at DESC`,
      [studentId]
    );

    const student = studentResult.rows[0];
    const submissions = submissionsResult.rows;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${student.fullname.replace(/\s+/g, '_')}_report.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Evalora', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Student Performance Report', { align: 'center' });
    doc.moveDown();

    // Student Info
    doc.fontSize(14).font('Helvetica-Bold').text('Student Information');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Name: ${student.fullname}`);
    doc.text(`Matricule: ${student.matricule}`);
    doc.text(`Total Assessments Taken: ${student.total_assessments}`);
    doc.text(`Average Score: ${student.average_score}%`);
    doc.moveDown();

    // Assessment History
    doc.fontSize(14).font('Helvetica-Bold').text('Assessment History');
    doc.moveDown(0.5);
    
    submissions.forEach((sub, index) => {
      doc.fontSize(11).font('Helvetica');
      doc.text(`${index + 1}. ${sub.assessment_name}`);
      doc.text(`   Score: ${sub.score} | Percentage: ${sub.percentage}% | Status: ${sub.passed ? 'PASSED' : 'FAILED'}`);
      doc.text(`   Date: ${new Date(sub.submitted_at).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Generate student report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateAssessmentReport = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessmentResult = await pool.query(
      `SELECT a.*,
        COUNT(sub.id) as total_submissions,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score
       FROM assessments a
       LEFT JOIN submissions sub ON a.id = sub.assessment_id
       WHERE a.id = $1
       GROUP BY a.id`,
      [assessmentId]
    );

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const submissionsResult = await pool.query(
      `SELECT sub.*, s.fullname, s.matricule
       FROM submissions sub
       JOIN students s ON sub.student_id = s.id
       WHERE sub.assessment_id = $1
       ORDER BY sub.percentage DESC`,
      [assessmentId]
    );

    const assessment = assessmentResult.rows[0];
    const submissions = submissionsResult.rows;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${assessment.title.replace(/\s+/g, '_')}_report.pdf`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('Evalora', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Assessment Summary Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Assessment Details');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Title: ${assessment.title}`);
    doc.text(`Description: ${assessment.description || 'N/A'}`);
    doc.text(`Total Submissions: ${assessment.total_submissions}`);
    doc.text(`Average Score: ${assessment.average_score}%`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Student Results');
    doc.moveDown(0.5);
    
    submissions.forEach((sub, index) => {
      doc.fontSize(11).font('Helvetica');
      doc.text(`${index + 1}. ${sub.fullname} (${sub.matricule})`);
      doc.text(`   Score: ${sub.score} | Percentage: ${sub.percentage}% | Status: ${sub.passed ? 'PASSED' : 'FAILED'}`);
      doc.text(`   Date: ${new Date(sub.submitted_at).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Generate assessment report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateClassReport = async (req, res) => {
  try {
    const studentsResult = await pool.query(
      `SELECT s.*,
        COUNT(sub.id) as total_assessments,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score,
        SUM(CASE WHEN sub.passed THEN 1 ELSE 0 END) as passed_count
       FROM students s
       LEFT JOIN submissions sub ON s.id = sub.student_id
       GROUP BY s.id
       ORDER BY s.fullname`
    );

    const overallStats = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id) as total_students,
        COUNT(sub.id) as total_submissions,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as class_average
      FROM students s
      LEFT JOIN submissions sub ON s.id = sub.student_id
    `);

    const students = studentsResult.rows;
    const stats = overallStats.rows[0];

    const doc = new PDFDocument({ margin: 50, layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=class_performance_report.pdf');
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('Evalora', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Class Performance Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Students: ${stats.total_students}`);
    doc.text(`Total Submissions: ${stats.total_submissions}`);
    doc.text(`Class Average: ${stats.class_average}%`);
    doc.moveDown();

    // Table
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Student Name', 50, doc.y, { width: 200 });
    doc.text('Matricule', 250, doc.y - 12, { width: 100 });
    doc.text('Assessments', 350, doc.y - 12, { width: 80 });
    doc.text('Avg Score', 430, doc.y - 12, { width: 80 });
    doc.text('Passed', 510, doc.y - 12, { width: 80 });
    doc.moveDown();

    students.forEach((student) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(student.fullname, 50, doc.y, { width: 200 });
      doc.text(student.matricule, 250, doc.y - 12, { width: 100 });
      doc.text(student.total_assessments.toString(), 350, doc.y - 12, { width: 80 });
      doc.text(`${student.average_score}%`, 430, doc.y - 12, { width: 80 });
      doc.text(student.passed_count.toString(), 510, doc.y - 12, { width: 80 });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Generate class report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};