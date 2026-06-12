import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const registerStudent = async (req, res) => {
  try {
    const { fullname, username, password, matricule } = req.body;

    if (!fullname || !username || !password || !matricule) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: fullname, username, password, matricule'
      });
    }

    const existingUsername = await pool.query(
      'SELECT id FROM students WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const existingMatricule = await pool.query(
      'SELECT id FROM students WHERE matricule = $1',
      [matricule]
    );

    if (existingMatricule.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Matricule number already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO students (fullname, username, password, matricule) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, fullname, username, matricule, profile_pic, created_at`,
      [fullname, username, hashedPassword, matricule]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, username: result.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: `Welcome ${username}! Your account has been created.`,
      token,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { matricule, password } = req.body;

    if (!matricule || !password) {
      return res.status(400).json({
        success: false,
        message: 'Matricule number and password are required'
      });
    }

    const result = await pool.query(
      'SELECT * FROM students WHERE matricule = $1',
      [matricule]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid matricule number or password'
      });
    }

    const student = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, student.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid matricule number or password'
      });
    }

    const token = jwt.sign(
      { id: student.id, username: student.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: `Welcome back, ${student.username}!`,
      token,
      student: {
        id: student.id,
        fullname: student.fullname,
        username: student.username,
        matricule: student.matricule,
        profile_pic: student.profile_pic,
        created_at: student.created_at
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT s.id, s.fullname, s.matricule, s.username, s.profile_pic, s.created_at,
        COUNT(DISTINCT sub.id) as assessments_taken,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score
      FROM students s
      LEFT JOIN submissions sub ON s.id = sub.student_id
    `;
    
    const params = [];
    
    if (search) {
      query += ` WHERE s.fullname ILIKE $1 OR s.matricule ILIKE $1 OR s.username ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY s.id ORDER BY s.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      students: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getStudentProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const studentResult = await pool.query(
      'SELECT id, fullname, matricule, username, profile_pic, created_at FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_assessments,
        COALESCE(MAX(percentage), 0) as highest_score,
        COALESCE(MIN(percentage), 0) as lowest_score,
        COALESCE(ROUND(AVG(percentage)::numeric, 1), 0) as average_score,
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND((SUM(CASE WHEN passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100)::numeric, 1)
          ELSE 0 
        END as pass_rate
       FROM submissions
       WHERE student_id = $1`,
      [id]
    );

    const attemptsResult = await pool.query(
      `SELECT sub.*, a.title as assessment_name, a.duration_minutes
       FROM submissions sub
       JOIN assessments a ON sub.assessment_id = a.id
       WHERE sub.student_id = $1
       ORDER BY sub.submitted_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      student: studentResult.rows[0],
      stats: statsResult.rows[0],
      attempts: attemptsResult.rows
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, fullname, matricule, username, profile_pic, created_at FROM students WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING id, fullname, username',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: `Student ${result.rows[0].username} deleted successfully`
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.fullname, s.matricule, s.username, s.profile_pic, s.created_at,
        COUNT(DISTINCT sub.id) as assessments_taken,
        COALESCE(ROUND(AVG(sub.percentage)::numeric, 1), 0) as average_score
       FROM students s
       LEFT JOIN submissions sub ON s.id = sub.student_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [req.student.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};