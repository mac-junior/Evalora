import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Logo from '../common/Logo';

const AdminSidebar = ({ onClose }) => {
  const { adminUser, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const navItems = [
    { to: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/assessments', icon: BookOpen, label: 'Assessments' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/results', icon: ClipboardList, label: 'Results' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className={`h-full flex flex-col transition-all duration-300 border-r ${
      collapsed ? 'w-20' : 'w-64'
    }`} style={{ backgroundColor: '#FFF8EE', borderColor: '#E0D3C5' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b" style={{ borderColor: '#E0D3C5' }}>
        <Logo to="/admin/overview" size="default" showText={!collapsed} />
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block hover:opacity-80 transition-colors"
            style={{ color: '#7A6B5D' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden hover:opacity-80 transition-colors"
            style={{ color: '#7A6B5D' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
                          (item.to !== '/admin/overview' && 
                           item.to !== '/admin/profile' && 
                           location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={{
                backgroundColor: isActive ? 'rgba(193,122,94,0.1)' : 'transparent',
                color: isActive ? '#C17A5E' : '#7A6B5D',
                fontWeight: isActive ? '500' : '400',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'rgba(193,122,94,0.05)';
                  e.target.style.color = '#5C4B3A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#7A6B5D';
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && adminUser && (
        <div className="px-3 py-4 border-t" style={{ borderColor: '#E0D3C5' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: 'rgba(193,122,94,0.15)' }}
            >
              {adminUser.profile_pic ? (
                <img src={adminUser.profile_pic} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold" style={{ color: '#C17A5E' }}>
                  {adminUser.fullname?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#5C4B3A' }}>{adminUser.fullname || 'Admin'}</p>
              <p className="text-xs truncate" style={{ color: '#7A6B5D' }}>{adminUser.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: '#7A6B5D' }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(220,100,80,0.1)';
            e.target.style.color = '#D4694A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#7A6B5D';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;