import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import type { RegisterRequest } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      const { confirmPassword: _, ...registerData } = data;
      void _;
      await registerUser(registerData);
      toast.success('Đăng ký thành công!');
      navigate(ROUTES.HOME, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsSubmitting(true);
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        toast.success('Đăng ký thành công bằng Google!');
        navigate(ROUTES.HOME, { replace: true });
      } else {
        toast.error('Không nhận được thông tin xác thực từ Google');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng ký Google thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Đăng ký</h1>
        <p className="text-slate-500 mt-1">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          error={errors.name?.message}
          {...register('name', {
            required: 'Vui lòng nhập họ tên',
          })}
        />

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
          label="Số điện thoại"
          type="tel"
          placeholder="0912 345 678"
          error={errors.phone?.message}
          {...register('phone')}
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

        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Vui lòng xác nhận mật khẩu',
            validate: (value) =>
              value === password || 'Mật khẩu xác nhận không khớp',
          })}
        />
        <div className="relative my-6">
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border border-slate-200'></div>
          </div>
          <div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-slate-500'>Hoặc đăng ký bằng Google</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId="446988791872-2uplk1l2qed92h4402qb5j5runuhlhbn.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => {
                toast.error('Đăng ký bằng Google thất bại');
              }}
            />
          </GoogleOAuthProvider>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Đăng ký
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} className="text-blue-600 font-medium hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
