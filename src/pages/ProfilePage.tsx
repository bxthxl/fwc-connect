import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PageLoader } from '@/components/common/LoadingSpinner';

export default function ProfilePage() {
  const { profile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading || !profile) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>

        {/* Avatar Upload Section */}
        <AvatarUpload />

        {isEditing ? (
          <ProfileEditForm
            profile={profile}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
        )}

        <PasswordChangeForm />
      </div>
    </DashboardLayout>
  );
}
