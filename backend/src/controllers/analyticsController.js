import pool from '../config/database.js';

export const getOverviewStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM assessments) as total_assessments,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COALESCE(ROUND(AVG(percentage)::numeric, 1), 0) FROM submissions) as average_score,
        (SELECT 
          CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND((SUM(CASE WHEN passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100)::numeric, 1)
            ELSE 0 
          END 
         FROM submissions) as pass_rate
    `);

    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAssessmentAnalytics = async (req, res) => {
  try {
    // Average scores per assessment
    const scoresByAssessment = await pool.query(`
      SELECT 
        a.title,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score,
        COUNT(sub.id) as total_submissions
      FROM assessments a
      LEFT JOIN submissions sub ON a.id = sub.assessment_id
      GROUP BY a.id, a.title
      ORDER BY average_score DESC
    `);

    // Pass vs Fail distribution
    const passFailDistribution = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN passed THEN 1 ELSE 0 END), 0) as passed,
        COALESCE(SUM(CASE WHEN NOT passed THEN 1 ELSE 0 END), 0) as failed,
        COUNT(*) as total
      FROM submissions
    `);

    // Submission trends over time
    const submissionTrends = await pool.query(`
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*) as submissions,
        COALESCE(ROUND(AVG(percentage)::numeric, 1), 0) as average_score
      FROM submissions
      GROUP BY DATE(submitted_at)
      ORDER BY date
    `);

    // Most missed questions
    const mostMissedQuestions = await pool.query(`
      SELECT 
        q.id,
        q.question,
        a.title as assessment_title,
        COUNT(*) as times_attempted,
        SUM(CASE WHEN ans.is_correct = false THEN 1 ELSE 0 END) as incorrect_count
      FROM answers ans
      JOIN questions q ON ans.question_id = q.id
      JOIN assessments a ON q.assessment_id = a.id
      GROUP BY q.id, q.question, a.title
      HAVING SUM(CASE WHEN ans.is_correct = false THEN 1 ELSE 0 END) > 0
      ORDER BY incorrect_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      analytics: {
        scoresByAssessment: scoresByAssessment.rows,
        passFailDistribution: passFailDistribution.rows[0],
        submissionTrends: submissionTrends.rows,
        mostMissedQuestions: mostMissedQuestions.rows
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};