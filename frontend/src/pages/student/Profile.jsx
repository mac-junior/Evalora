import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import {
  User,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Mail,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { studentUser, updateStudentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentAPI.getProfile();
        const profileData = response.data.student;
        setProfile(profileData);
        setFormData({
          fullname: profileData.fullname || '',
          username: profileData.username || '',
        });
        setProfilePicPreview(profileData.profile_pic || null);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
      
      // Upload immediately
      uploadProfilePic(file);
    }
  };

  const uploadProfilePic = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('profile_pic', file);
    try {
      const response = await studentAPI.uploadProfilePic(studentUser.id, formDataUpload);
      setProfilePicPreview(response.data.profile_pic);
      updateStudentUser({ ...studentUser, profile_pic: response.data.profile_pic });
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await studentAPI.updateProfile(studentUser.id, formData);
      updateStudentUser({ ...studentUser, ...response.data.student });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Both fields are required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await studentAPI.updateProfile(studentUser.id, passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Upload a photo</p>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Hash className="w-4 h-4" />
              Matricule: <span className="font-medium text-gray-900">{profile?.matricule}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all bg-white"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all bg-white"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;