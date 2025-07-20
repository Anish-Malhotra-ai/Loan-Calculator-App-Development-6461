import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import Header from '../components/Header';

const AdminPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="LoanPro Calculator Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ display: 'none' }}>
                  LP
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">LoanPro Calculator</div>
                <div className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} All rights reserved.
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Powered and supported with</span>
              <span className="text-red-500 mx-1">❤</span>
              <span>by</span>
              <span className="font-semibold text-primary-600 ml-1">BPA Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;