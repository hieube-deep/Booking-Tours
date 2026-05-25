import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { ROUTES } from '@/utils/constants';
import type { ChangePasswordRequest } from '@/types/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordRequest & { confirmPassword: string }>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordRequest) => {
    try {
      setIsSubmitting(true);
      await authApi.changePassword(data);
      toast.success('Đổi mật khẩu thành công!');
      navigate(ROUTES.PROFILE);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Đổi mật khẩu</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword', {
              required: 'Vui lòng nhập mật khẩu hiện tại',
            })}
          />

          <Input
            label="Mật khẩu mới"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'Vui lòng nhập mật khẩu mới',
              minLength: {
                value: 6,
                message: 'Mật khẩu ít nhất 6 ký tự',
              },
            })}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu mới',
              validate: (value) =>
                value === newPassword || 'Mật khẩu xác nhận không khớp',
            })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              Đổi mật khẩu
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.PROFILE)}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
