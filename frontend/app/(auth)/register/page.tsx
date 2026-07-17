'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/components/forms/schemas';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { roleDashboardPath } from '@/lib/auth';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register: registerUser, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    const user = await registerUser({
      name: values.fullName,
      email: values.email,
      password: values.password,
    }).catch(() => null);
    if (!user) return;
    const redirect = params.get('redirect');
    router.push(redirect ?? roleDashboardPath[user.role]);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
      <Input label="Full name" placeholder="Jane Wafula" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
      <Input
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-500/10" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
        Create account
      </Button>
    </form>
  );
}

// Public self-registration always creates a LEARNER account. Admins create
// TRAINER/ADMIN accounts from the admin user-management screen instead.
export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">Start Building Your Digital Future</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">Take control of your learning journey.</p>

      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline dark:text-iris-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
