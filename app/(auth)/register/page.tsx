'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { register, type RegisterActionState } from '../actions';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (hasShownToast) return;

    if (state.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
      setHasShownToast(true);
    } else if (state.status === 'failed') {
      toast({ type: 'error', description: 'Failed to create account!' });
      setHasShownToast(true);
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
      setHasShownToast(true);
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'アカウントが作成されました！' });
      setIsSuccessful(true);
      setHasShownToast(true);

      updateSession().then(() => {
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 500);
      });
    }
  }, [state.status, router, updateSession, hasShownToast]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    setHasShownToast(false);
    formAction(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
      <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400">
        Create an account with your email and password
      </p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
        <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          {'Already have an account? '}
          <Link
            href="/login"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Sign in
          </Link>
          {' instead.'}
        </p>
      </AuthForm>
    </div>
  );
}
