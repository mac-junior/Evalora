import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { useState } from 'react';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF5EF]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-40 transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <StudentSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-[#E0D3C5] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#FAF5EF] transition-colors"
          >
            <svg className="w-6 h-6 text-[#5C4B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-[#5C4B3A]">Evalora</span>
          <div className="w-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;