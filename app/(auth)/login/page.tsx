'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Calendar, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

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
      </div>
    </div>
  );
}
