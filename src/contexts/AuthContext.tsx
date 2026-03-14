import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, UserWithRoles } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canTakeAttendance: boolean;
  canManageMinutes: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const isAdmin = roles.includes('admin');
  const canTakeAttendance = isAdmin || roles.includes('attendance_taker');
  const canManageMinutes = isAdmin || roles.includes('minutes_taker');

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profileData) {
        setIsNewUser(true);
        return null;
      }

      setIsNewUser(false);
      return profileData as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchRoles = async (profileId: string) => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileId);

      if (rolesError) {
        // User might not have any roles yet (regular member)
        console.log('No roles found or error:', rolesError.message);
        return [];
      }

      return (rolesData?.map(r => r.role) || []) as AppRole[];
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      return [];
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    const profileData = await fetchProfile(user.id);
    setProfile(profileData);

    if (profileData) {
      const userRoles = await fetchRoles(profileData.id);
      setRoles(userRoles);
    } else {
      setRoles([]);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setIsNewUser(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);

            if (profileData) {
              const userRoles = await fetchRoles(profileData.id);
              setRoles(userRoles);
            }
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsNewUser(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!currentSession) {
        setIsLoading(false);
      }
      // Auth state change will handle the rest
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isAdmin,
        canTakeAttendance,
        canManageMinutes,
        isLoading,
        isNewUser,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
