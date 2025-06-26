'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from '@/components/toast';
import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { login, type LoginActionState } from '../actions';

export const dynamic = 'force-dynamic';

export default function Page() {
  const searchParams = useSearchParams();
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast({ type: 'error', description: 'Incorrect email or password' });
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'Signed in successfully' });
      setIsSuccessful(true);
    }
  }, [state.status]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
      <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400">
        Sign in to your account with your email and password
      </p>
      <AuthForm action={formAction} defaultEmail={searchParams.get('email') ?? ''}>
        <SubmitButton isSuccessful={isSuccessful}>Sign In</SubmitButton>
        <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Sign up
          </Link>
          {' instead.'}
        </p>
      </AuthForm>
    </div>
  );
}
