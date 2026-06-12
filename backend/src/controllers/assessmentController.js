import pool from '../config/database.js';

export const createAssessment = async (req, res) => {
  try {
    const { title, description, duration_minutes, passing_score, max_attempts } = req.body;

    const result = await pool.query(
      `INSERT INTO assessments (title, description, duration_minutes, passing_score, max_attempts)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, duration_minutes, passing_score, max_attempts || 1]
    );

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment: result.rows[0]
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllAssessments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT s.id) as submission_count
       FROM assessments a
       LEFT JOIN questions q ON a.id = q.assessment_id
       LEFT JOIN submissions s ON a.id = s.assessment_id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      success: true,
      assessments: result.rows
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPublishedAssessments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        COUNT(DISTINCT q.id) as question_count
       FROM assessments a
       LEFT JOIN questions q ON a.id = q.assessment_id
       WHERE a.published = true
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      success: true,
      assessments: result.rows
    });
  } catch (error) {
    console.error('Get published assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, 
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT s.id) as submission_count
       FROM assessments a
       LEFT JOIN questions q ON a.id = q.assessment_id
       LEFT JOIN submissions s ON a.id = s.assessment_id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      assessment: result.rows[0]
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateAssessment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { title, description, duration_minutes, passing_score, published, max_attempts } = req.body;

    // If admin is updating the assessment, reset all previous attempts
    // This gives students fresh attempts after an update
    await client.query(
      `DELETE FROM answers WHERE submission_id IN 
       (SELECT id FROM submissions WHERE assessment_id = $1)`,
      [id]
    );
    
    await client.query(
      'DELETE FROM submissions WHERE assessment_id = $1',
      [id]
    );

    const result = await client.query(
      `UPDATE assessments 
       SET title = $1, description = $2, duration_minutes = $3, 
           passing_score = $4, published = $5, max_attempts = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, duration_minutes, passing_score, published, max_attempts || 1, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Assessment updated successfully. All previous attempts have been reset.',
      assessment: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE assessments 
       SET published = NOT published, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      message: `Assessment ${result.rows[0].published ? 'published' : 'unpublished'} successfully`,
      assessment: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM assessments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetAttempts = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assessment exists
    const assessmentCheck = await pool.query(
      'SELECT id, title FROM assessments WHERE id = $1',
      [id]
    );

    if (assessmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Delete all submissions and answers for this assessment
    await pool.query(
      `DELETE FROM answers WHERE submission_id IN 
       (SELECT id FROM submissions WHERE assessment_id = $1)`,
      [id]
    );
    
    const result = await pool.query(
      'DELETE FROM submissions WHERE assessment_id = $1 RETURNING id',
      [id]
    );

    const deletedCount = result.rows.length;

    res.json({
      success: true,
      message: `Reset successful. ${deletedCount} submission(s) deleted. All students can now retake this assessment.`,
      deletedCount
    });
  } catch (error) {
    console.error('Reset attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};