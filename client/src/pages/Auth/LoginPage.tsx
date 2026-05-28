import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import type { LoginRequest } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"


export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsSubmitting(true);
      await login(data);
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsSubmitting(true);
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        toast.success('Đăng nhập thành công bằng Google!');
        navigate(from, { replace: true });
      } else {
        toast.error('Không nhận được thông tin xác thực từ Google');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
        <p className="text-slate-500 mt-1">Chào mừng bạn quay trở lại</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Vui lòng nhập email',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Email không hợp lệ',
            },
          })}
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Vui lòng nhập mật khẩu',
            minLength: {
              value: 6,
              message: 'Mật khẩu ít nhất 6 ký tự',
            },
          })}
        />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Hoặc đăng nhập bằng</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleOAuthProvider clientId="446988791872-2uplk1l2qed92h4402qb5j5runuhlhbn.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => {
                toast.error('Đăng nhập bằng Google thất bại');
              }}
            />
          </GoogleOAuthProvider>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Đăng nhập
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.REGISTER} className="text-blue-600 font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
