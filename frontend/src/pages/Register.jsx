import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Hash, Lock, Eye, EyeOff, UserPlus, Camera, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    matricule: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { studentRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullname || !formData.username || !formData.matricule || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const student = await studentRegister(formData);
      
      if (profilePic && student.id) {
        const formDataUpload = new FormData();
        formDataUpload.append('profile_pic', profilePic);
        try {
          await fetch(`/api/profile/upload-pic/student/${student.id}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
            },
            body: formDataUpload,
          });
        } catch (uploadError) {
          console.error('Profile pic upload failed:', uploadError);
        }
      }
      
      toast.success(`Welcome ${student.username}!`);
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#C17A5E] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3E2F24]">Evalora</span>
          </Link>
          <div className="w-14 h-14 bg-[#C17A5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C17A5E]/20">
            <UserPlus className="w-7 h-7 text-[#C17A5E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3E2F24] mb-2">Create Your Account</h1>
          <p className="text-[#6B5A4E]">Join and start your assessment journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-8 space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#FAF5EF] border-2 border-dashed border-[#E0D3C5] flex items-center justify-center overflow-hidden">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-[#8B7A6E]" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#C17A5E] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#A8654A] transition-colors shadow-sm">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-[#8B7A6E] mt-2">Optional profile picture</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="Mac Shadow"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="johndoe"
              />
            </div>
          </div>

          {/* Matricule */}
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Matricule Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="STU001"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5A4E] hover:text-[#3E2F24]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C17A5E] text-white py-2.5 rounded-xl font-medium hover:bg-[#A8654A] focus:ring-4 focus:ring-[#C17A5E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-[#6B5A4E]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#C17A5E] hover:text-[#A8654A] font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <p className="text-center text-sm text-[#8B7A6E]">
            <Link to="/" className="hover:text-[#C17A5E] transition-colors">
              Back to Home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;