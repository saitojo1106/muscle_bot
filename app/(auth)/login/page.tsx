'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // トースト重複防止

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: 'idle' },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (hasShownToast) return; // 既にトーストを表示済みなら何もしない

    if (state.status === 'failed') {
      toast({ type: 'error', description: 'Invalid credentials!' });
      setHasShownToast(true);
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
      setHasShownToast(true);
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'ログインしました！' });
      setIsSuccessful(true);
      setHasShownToast(true);

      // セッション更新後に自動リダイレクト
      updateSession().then(() => {
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 500); // 少し遅延させてトーストを見せる
      });
    }
  }, [state.status, router, updateSession, hasShownToast]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    setHasShownToast(false); // 新しい送信時にリセット
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
