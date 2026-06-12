import pool from '../config/database.js';

export const addQuestion = async (req, res) => {
  try {
    const { assessment_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation } = req.body;

    const result = await pool.query(
      `INSERT INTO questions (assessment_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [assessment_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation]
    );

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getQuestionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const result = await pool.query(
      'SELECT * FROM questions WHERE assessment_id = $1 ORDER BY created_at',
      [assessmentId]
    );

    res.json({
      success: true,
      questions: result.rows
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_answer, explanation } = req.body;

    const result = await pool.query(
      `UPDATE questions 
       SET question = $1, option_a = $2, option_b = $3, option_c = $4, 
           option_d = $5, correct_answer = $6, explanation = $7
       WHERE id = $8
       RETURNING *`,
      [question, option_a, option_b, option_c, option_d, correct_answer, explanation, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const bulkUploadQuestions = async (req, res) => {
  try {
    const { assessment_id, questions } = req.body;

    if (!assessment_id || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID and questions array are required'
      });
    }

    const errors = [];
    const inserted = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const rowNum = i + 2; // +2 because row 1 is header, and 0-indexed

      // Validate required fields
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        errors.push({ row: rowNum, message: 'Missing required fields' });
        continue;
      }

      // Validate correct_answer
      const validAnswers = ['A', 'B', 'C', 'D'];
      if (!validAnswers.includes(q.correct_answer.toUpperCase())) {
        errors.push({ row: rowNum, message: 'Correct answer must be A, B, C, or D' });
        continue;
      }

      try {
        const result = await pool.query(
          `INSERT INTO questions (assessment_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, question`,
          [
            assessment_id,
            q.question.trim(),
            q.option_a.trim(),
            q.option_b.trim(),
            q.option_c.trim(),
            q.option_d.trim(),
            q.correct_answer.toUpperCase(),
            q.explanation?.trim() || ''
          ]
        );
        inserted.push(result.rows[0]);
      } catch (dbError) {
        errors.push({ row: rowNum, message: 'Database error: ' + dbError.message });
      }
    }

    res.json({
      success: true,
      total: questions.length,
      inserted: inserted.length,
      errors: errors.length,
      errorDetails: errors,
      message: `${inserted.length} questions imported successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};