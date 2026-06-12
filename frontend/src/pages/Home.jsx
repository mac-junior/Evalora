import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart3, Clock, Zap, CheckCircle, TrendingUp, UserPlus, Search, Award, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/common/Logo';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF]">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#E0D3C5] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo to="/" size="default" showText={true} />

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-[#6B5A4E] hover:text-[#C17A5E] font-medium transition-colors text-sm">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-[#6B5A4E] hover:text-[#C17A5E] font-medium transition-colors text-sm">
                How It Works
              </button>
              <button onClick={() => scrollToSection('stats')} className="text-[#6B5A4E] hover:text-[#C17A5E] font-medium transition-colors text-sm">
                Statistics
              </button>
              <Link to="/login" className="text-[#6B5A4E] hover:text-[#C17A5E] font-medium transition-colors text-sm">
                Sign In
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/register"
                className="bg-[#C17A5E] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#A8654A] transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#FAF5EF] transition-colors"
              style={{ color: '#5C4B3A' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E0D3C5] shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2.5 text-[#5C4B3A] hover:bg-[#FAF5EF] rounded-xl font-medium transition-colors text-sm"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-4 py-2.5 text-[#5C4B3A] hover:bg-[#FAF5EF] rounded-xl font-medium transition-colors text-sm"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className="block w-full text-left px-4 py-2.5 text-[#5C4B3A] hover:bg-[#FAF5EF] rounded-xl font-medium transition-colors text-sm"
              >
                Statistics
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[#5C4B3A] hover:bg-[#FAF5EF] rounded-xl font-medium transition-colors text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-[#C17A5E] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#A8654A] transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#3E2F24]/85 via-[#3E2F24]/70 to-[#3E2F24]/40" />
          <div className="absolute inset-0 bg-[#C17A5E]/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 sm:mb-8 border border-white/20 backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              Intelligent Assessment Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              Assess Smarter.
              <br />
              <span className="text-[#E8B89D]">Grade Faster.</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-10 leading-relaxed max-w-xl">
              Take MCQ assessments, get instant results with detailed explanations,
              and track your academic progress with powerful analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-[#C17A5E] text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-[#A8654A] transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg shadow-[#C17A5E]/30"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Floating Stats - Hidden on mobile */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-48">
              <BookOpen className="w-5 h-5 text-[#E8B89D] mb-2" />
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-sm text-white/70">Assessments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-48 ml-8">
              <CheckCircle className="w-5 h-5 text-[#8FAA7B] mb-2" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-white/70">Instant Feedback</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-48 ml-4">
              <TrendingUp className="w-5 h-5 text-[#E8B89D] mb-2" />
              <div className="text-2xl font-bold text-white">Detailed</div>
              <div className="text-sm text-white/70">Progress Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3E2F24] mb-4">How It Works</h2>
          <p className="text-[#6B5A4E] text-base sm:text-lg max-w-2xl mx-auto">
            Get started in three simple steps and begin your learning journey today.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            { step: '01', icon: UserPlus, title: 'Create Your Account', description: 'Register with your full name, matricule number, and create a unique username. Upload a profile picture to personalize your experience.' },
            { step: '02', icon: Search, title: 'Browse Assessments', description: 'Explore available assessments tailored to your learning needs. Read instructions carefully before starting each assessment.' },
            { step: '03', icon: Award, title: 'Take & Get Results', description: 'Complete timed MCQ assessments and receive instant grading with detailed explanations for every question.' },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-all duration-300 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C17A5E] rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold mx-auto mb-4 sm:mb-5">
                  {item.step}
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#C17A5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#C17A5E]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#3E2F24] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[#6B5A4E] text-sm leading-relaxed">{item.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#E0D3C5]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section id="stats" className="bg-white border-t border-b border-[#E0D3C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3E2F24] mb-4">Platform Statistics</h2>
            <p className="text-[#6B5A4E] text-base sm:text-lg max-w-2xl mx-auto">
              Trusted by students worldwide for reliable and instant assessment grading.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: BookOpen, label: 'Assessments Available', value: '150+' },
              { icon: CheckCircle, label: 'Instant Feedback Rate', value: '100%' },
              { icon: Clock, label: 'Average Grading Time', value: '< 1s' },
              { icon: TrendingUp, label: 'Student Satisfaction', value: '98%' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#C17A5E] mx-auto mb-3 sm:mb-4" />
                <div className="text-2xl sm:text-3xl font-bold text-[#3E2F24] mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[#6B5A4E]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3E2F24] mb-4">Everything you need to excel</h2>
          <p className="text-[#6B5A4E] text-base sm:text-lg max-w-2xl mx-auto">
            Take assessments, get instant results, and track your progress all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: BookOpen, title: 'Diverse Assessments', description: 'Access a wide range of MCQ-based assessments with detailed explanations for every question.' },
            { icon: Zap, title: 'Instant Grading', description: 'Receive your results immediately after submission. See correct answers with detailed explanations.' },
            { icon: BarChart3, title: 'Performance Analytics', description: 'Track your progress over time with detailed charts. Identify your strengths and areas for improvement.' },
            { icon: Clock, title: 'Timed Practice', description: 'Build exam confidence with timed assessments. A visual countdown timer helps manage your time.' },
            { icon: TrendingUp, title: 'Progress Tracking', description: 'Monitor your improvement across multiple attempts. See your highest, lowest, and average scores.' },
            { icon: CheckCircle, title: 'Learning Reinforcement', description: 'Every question comes with a detailed explanation. Learn from mistakes and reinforce understanding.' },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E0D3C5] shadow-sm hover:shadow-md hover:border-[#C17A5E] transition-all duration-300 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C17A5E]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#C17A5E]/20 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C17A5E]" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#3E2F24] mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-[#6B5A4E] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#E0D3C5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3E2F24] mb-4">Ready to get started?</h2>
          <p className="text-[#6B5A4E] text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Join thousands of students who are already assessing smarter and grading faster.
          </p>
          <Link
            to="/register"
            className="bg-[#C17A5E] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg hover:bg-[#A8654A] transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-[#C17A5E]/20"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E0D3C5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Logo to="/" size="small" showText={true} />
            <p className="text-xs sm:text-sm text-[#6B5A4E]">Assess Smarter. Grade Faster.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;