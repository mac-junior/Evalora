import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.type === 'admin') {
        toast.success('Welcome to your dashboard');
        navigate('/admin/overview');
      } else {
        toast.success(`Welcome back, ${result.user.username}!`);
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
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
            <LogIn className="w-7 h-7 text-[#C17A5E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3E2F24] mb-2">Welcome Back</h1>
          <p className="text-[#6B5A4E]">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0D3C5] shadow-sm p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Email or Matricule Number</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="admin@evalora.com or STU001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3E2F24] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B5A4E]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-[#FAF5EF] border border-[#E0D3C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C17A5E]/30 focus:border-[#C17A5E] transition-all text-[#3E2F24] placeholder-[#8B7A6E]"
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C17A5E] text-white py-2.5 rounded-xl font-medium hover:bg-[#A8654A] focus:ring-4 focus:ring-[#C17A5E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-[#6B5A4E]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#C17A5E] hover:text-[#A8654A] font-medium">
                Create one here
              </Link>
            </p>
          </div>

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

export default Login;