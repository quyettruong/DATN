import React from 'react';
import { Outlet } from 'react-router-dom';
import { Hospital } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-2xl shadow-lg inline-flex items-center justify-center">
            <Hospital className="h-12 w-12 text-teal-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Hệ thống Y tế MediCare
        </h2>
        <p className="mt-2 text-center text-sm text-teal-100">
          Chăm sóc sức khỏe toàn diện - Nhanh chóng & Tiện lợi
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400"></div>
          
          <Outlet />
        </div>
        <div className="mt-8 text-center text-sm text-teal-100">
          <p>&copy; {new Date().getFullYear()} MediCare. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
