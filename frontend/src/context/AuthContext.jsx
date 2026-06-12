import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI, studentAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [studentUser, setStudentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const studentToken = localStorage.getItem('studentToken');
    const savedAdmin = localStorage.getItem('adminUser');
    const savedStudent = localStorage.getItem('studentUser');

    if (adminToken && savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    if (studentToken && savedStudent) {
      try {
        setStudentUser(JSON.parse(savedStudent));
      } catch (e) {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Clear all previous auth state first
    localStorage.removeItem('adminToken');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('studentUser');
    setAdminUser(null);
    setStudentUser(null);

    try {
      const response = await adminAPI.login({ email, password });
      const { token, admin } = response.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      setAdminUser(admin);
      return { type: 'admin', user: admin };
    } catch (adminError) {
      try {
        const response = await studentAPI.login({ matricule: email, password });
        const { token, student } = response.data;
        localStorage.setItem('studentToken', token);
        localStorage.setItem('studentUser', JSON.stringify(student));
        setStudentUser(student);
        return { type: 'student', user: student };
      } catch (studentError) {
        throw new Error(studentError.response?.data?.message || 'Invalid credentials');
      }
    }
  };

  const studentRegister = async (data) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('studentUser');
    setAdminUser(null);
    setStudentUser(null);

    const response = await studentAPI.register(data);
    const { token, student } = response.data;
    localStorage.setItem('studentToken', token);
    localStorage.setItem('studentUser', JSON.stringify(student));
    setStudentUser(student);
    return student;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('studentUser');
    setAdminUser(null);
    setStudentUser(null);
  };

  const updateAdminUser = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const updateStudentUser = (userData) => {
    setStudentUser(userData);
    localStorage.setItem('studentUser', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{
      adminUser,
      studentUser,
      loading,
      login,
      studentRegister,
      logout,
      updateAdminUser,
      updateStudentUser,
      isAdminAuthenticated: !!adminUser,
      isStudentAuthenticated: !!studentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};