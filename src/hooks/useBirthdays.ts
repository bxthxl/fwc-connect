import { useMemo } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { Profile } from '@/types/database';
import { format, isSameMonth, isSameDay, addDays, startOfDay, getMonth, getDate } from 'date-fns';

export interface BirthdayMember {
  profile: Profile;
  /** The birthday date adjusted to the current year for comparison */
  nextBirthday: Date;
  isToday: boolean;
}

export function useBirthdays() {
  const { data: members, isLoading, error } = useMembers();

  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();

  const birthdayMembers = useMemo(() => {
    if (!members) return [];

    return members
      .map((member) => {
        const bday = new Date(member.birthday);
        // Create a date in the current year with the member's birth month/day
        const nextBirthday = new Date(currentYear, getMonth(bday), getDate(bday));

        // If the birthday has already passed this year, use next year
        if (nextBirthday < today) {
          nextBirthday.setFullYear(currentYear + 1);
        }

        const isToday = isSameDay(nextBirthday, today);

        return { profile: member, nextBirthday, isToday } as BirthdayMember;
      })
      .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
  }, [members, currentYear]);

  const todaysBirthdays = useMemo(
    () => birthdayMembers.filter((m) => m.isToday),
    [birthdayMembers]
  );

  const upcomingBirthdays = useMemo(
    () => birthdayMembers.filter((m) => !m.isToday).slice(0, 5),
    [birthdayMembers]
  );

  const monthlyBirthdays = useMemo(() => {
    if (!members) return [];
    const currentMonth = today.getMonth();
    return members
      .filter((m) => {
        const bday = new Date(m.birthday);
        return getMonth(bday) === currentMonth;
      })
      .sort((a, b) => {
        const dayA = getDate(new Date(a.birthday));
        const dayB = getDate(new Date(b.birthday));
        return dayA - dayB;
      });
  }, [members]);

  return {
    todaysBirthdays,
    upcomingBirthdays,
    monthlyBirthdays,
    allBirthdays: birthdayMembers,
    isLoading,
    error,
  };
}
