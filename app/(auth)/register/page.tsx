'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Calendar, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { register, type RegisterActionState } from '../actions';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false); // トースト重複防止

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const { data: session, update: updateSession } = useSession();

  useEffect(() => {
    if (hasShownToast) return; // 既にトーストを表示済みなら何もしない

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

  const handleChatNavigation = () => {
    router.push('/chat');
  };

  const handleProgressNavigation = () => {
    router.push('/progress');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Muscle Bot
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your Ultimate Fitness Companion
          </p>
          {session?.user && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back, {session.user.email || 'User'}!
            </p>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700">
            <CardContent className="p-6" onClick={handleChatNavigation}>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Chat with Muscle Bot
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get personalized fitness advice and training tips
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-700">
            <CardContent className="p-6" onClick={handleProgressNavigation}>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Track My Progress
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Log workouts, photos, and track your fitness journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Profile Access */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
            className="text-sm"
          >
            Edit Profile Settings
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
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
    </div>
  );
}
