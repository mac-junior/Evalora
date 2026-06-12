import pool from '../config/database.js';

export const submitAssessment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { student_id, assessment_id, answers, time_taken } = req.body;

    if (!student_id || !assessment_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission data'
      });
    }

    // Get all questions with correct answers
    const questionsResult = await client.query(
      'SELECT * FROM questions WHERE assessment_id = $1',
      [assessment_id]
    );

    const questions = questionsResult.rows;
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment has no questions'
      });
    }

    // Create submission
    const submissionResult = await client.query(
      `INSERT INTO submissions (student_id, assessment_id, score, percentage, time_taken, passed)
       VALUES ($1, $2, 0, 0, $3, false)
       RETURNING *`,
      [student_id, assessment_id, time_taken]
    );

    const submission = submissionResult.rows[0];
    let correctCount = 0;

    // Process each answer
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      
      if (!question) continue;

      const isCorrect = question.correct_answer === answer.selected_option;
      
      if (isCorrect) correctCount++;

      await client.query(
        `INSERT INTO answers (submission_id, question_id, selected_option, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [submission.id, answer.question_id, answer.selected_option, isCorrect]
      );
    }

    // Calculate final score
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    
    const assessmentResult = await client.query(
      'SELECT passing_score FROM assessments WHERE id = $1',
      [assessment_id]
    );
    
    const passingScore = assessmentResult.rows[0]?.passing_score || 0;
    const passed = percentage >= passingScore;

    // Update submission with final results
    await client.query(
      `UPDATE submissions 
       SET score = $1, percentage = $2, passed = $3
       WHERE id = $4`,
      [correctCount, percentage, passed, submission.id]
    );

    await client.query('COMMIT');

    // Fetch detailed results
    const detailedResults = await client.query(
      `SELECT 
        q.id,
        q.question,
        q.correct_answer,
        q.explanation,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        a.selected_option,
        a.is_correct
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.submission_id = $1
       ORDER BY q.created_at`,
      [submission.id]
    );

    res.json({
      success: true,
      submission: {
        id: submission.id,
        score: correctCount,
        total: totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        time_taken,
        submitted_at: submission.submitted_at
      },
      results: detailedResults.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        sub.*,
        s.fullname as student_name,
        s.matricule,
        a.title as assessment_name
       FROM submissions sub
       JOIN students s ON sub.student_id = s.id
       JOIN assessments a ON sub.assessment_id = a.id
       ORDER BY sub.submitted_at DESC`
    );

    res.json({
      success: true,
      submissions: result.rows
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const submissionResult = await pool.query(
      `SELECT 
        sub.*,
        s.fullname as student_name,
        s.matricule,
        a.title as assessment_name
       FROM submissions sub
       JOIN students s ON sub.student_id = s.id
       JOIN assessments a ON sub.assessment_id = a.id
       WHERE sub.id = $1`,
      [id]
    );

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const answersResult = await pool.query(
      `SELECT 
        q.question,
        q.correct_answer,
        q.explanation,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        a.selected_option,
        a.is_correct
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.submission_id = $1
       ORDER BY q.created_at`,
      [id]
    );

    res.json({
      success: true,
      submission: submissionResult.rows[0],
      answers: answersResult.rows
    });
  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await pool.query(
      `SELECT 
        sub.*,
        a.title as assessment_name,
        a.passing_score,
        a.duration_minutes
       FROM submissions sub
       JOIN assessments a ON sub.assessment_id = a.id
       WHERE sub.student_id = $1
       ORDER BY sub.submitted_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      submissions: result.rows
    });
  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};