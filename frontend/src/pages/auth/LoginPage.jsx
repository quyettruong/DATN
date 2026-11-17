import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogIn, User, Lock, Loader2, Hospital, PhoneCall, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showResetHelp, setShowResetHelp] = useState(false);
  const { login, isLoading, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectAfterAuth = (role) => {
    const redirectTarget = searchParams.get('redirect');
    if (redirectTarget && redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    switch (role) {
      case 'ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'DOCTOR':
        navigate('/doctor', { replace: true });
        break;
      case 'STAFF':
        navigate('/staff', { replace: true });
        break;
      case 'LAB_TECHNICIAN':
        navigate('/lab', { replace: true });
        break;
      case 'PATIENT':
      default:
        navigate('/patient', { replace: true });
        break;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterAuth(user.role);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      const success = await login(username.trim(), password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          redirectAfterAuth(currentUser.role);
        }
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra trong quá trình đăng nhập');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 border border-blue-100 rounded-2xl mb-4">
          <Hospital className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập Hệ thống MediCare</h2>
        <p className="text-slate-500 text-sm mt-1.5">Cổng điều phối khám chữa bệnh & Hồ sơ bệnh án điện tử</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên đăng nhập
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
              placeholder="VD: doctor1, staff1, patient1..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600">
              Duy trì phiên làm việc
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowResetHelp(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-500">
        Bệnh nhân lần đầu đặt khám?{' '}
        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
          Đăng ký hồ sơ ngay
        </Link>
      </div>

      {showResetHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Hướng dẫn cấp lại mật khẩu an toàn
              </h3>
              <button
                type="button"
                onClick={() => setShowResetHelp(false)}
                className="p-1 hover:bg-white/15 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-slate-700">
                <p className="font-bold text-blue-900 mb-1">1. Đối với Bệnh nhân</p>
                <p>Để bảo vệ dữ liệu hồ sơ bệnh án điện tử, vui lòng liên hệ Tổng đài CSKH hoặc xuất trình CCCD tại Quầy Tiếp Nhận để nhân viên xác minh và đặt lại mật khẩu.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700">
                <p className="font-bold text-slate-900 mb-1">2. Đối với Bác sĩ & Nhân viên Y tế</p>
                <p>Liên hệ Quản trị viên CNTT (Admin) để cấp lại mật khẩu khởi tạo tại phân hệ <strong>Quản lý Người dùng</strong>.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <a
                  href="tel:19001234"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Tổng đài: 1900 1234
                </a>
                <button
                  type="button"
                  onClick={() => setShowResetHelp(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
