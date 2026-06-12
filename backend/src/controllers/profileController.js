import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const updateAdminProfile = async (req, res) => {
  try {
    const { fullname, username, currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (fullname) {
      updates.push(`fullname = $${paramCount}`);
      params.push(fullname);
      paramCount++;
    }

    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM admins WHERE username = $1 AND id != $2',
        [username, adminId]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      
      updates.push(`username = $${paramCount}`);
      params.push(username);
      paramCount++;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      const admin = await pool.query('SELECT password FROM admins WHERE id = $1', [adminId]);
      const isValid = await bcrypt.compare(currentPassword, admin.rows[0].password);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push(`password = $${paramCount}`);
      params.push(hashedPassword);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(adminId);
    const result = await pool.query(
      `UPDATE admins SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} 
       RETURNING id, email, fullname, username, profile_pic, created_at, updated_at`,
      params
    );

    res.json({
      success: true,
      admin: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (fullname) {
      updates.push(`fullname = $${paramCount}`);
      params.push(fullname);
      paramCount++;
    }

    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM students WHERE username = $1 AND id != $2',
        [username, id]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      
      updates.push(`username = $${paramCount}`);
      params.push(username);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE students SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} 
       RETURNING id, fullname, matricule, username, profile_pic, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userType = req.params.type;
    const userId = req.params.id;
    const profilePicUrl = `/uploads/${req.file.filename}`;

    if (!['admin', 'student'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be admin or student.'
      });
    }

    const table = userType === 'admin' ? 'admins' : 'students';
    
    const result = await pool.query(
      `UPDATE ${table} SET profile_pic = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [profilePicUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${userType} not found`
      });
    }

    res.json({
      success: true,
      profile_pic: profilePicUrl,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Upload profile pic error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};