import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EmailPasswordAuthForm } from '@/components/auth/EmailPasswordAuthForm';
import { OnboardingForm } from '@/components/auth/OnboardingForm';
import { PageLoader } from '@/components/common/LoadingSpinner';

export default function AuthPage() {
  const { user, profile, isLoading, isNewUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && profile && !isNewUser) {
      navigate('/dashboard');
    }
  }, [user, profile, isNewUser, navigate]);

  if (isLoading) {
    return <PageLoader />;
  }

  // User is authenticated but needs to complete profile
  if (user && isNewUser) {
    return <OnboardingForm onComplete={() => navigate('/dashboard')} />;
  }

  // Show email/password auth form
  return <EmailPasswordAuthForm onAuthSuccess={() => {}} />;
}
