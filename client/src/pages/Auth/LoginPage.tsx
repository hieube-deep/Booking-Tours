import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import type { LoginRequest } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login } = useAuth();
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
