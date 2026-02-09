
-- Add 'birthday' to the notification_type enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'birthday';

-- Create the notify_birthdays function
CREATE OR REPLACE FUNCTION public.notify_birthdays()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert birthday notifications for all other members
  -- Uses idempotency check: only inserts if no birthday notification exists for the same person today
  INSERT INTO public.notifications (user_id, type, title, body, reference_id)
  SELECT 
    recipient.id,
    'birthday'::notification_type,
    'Happy Birthday ' || birthday_person.full_name || '! 🎂',
    birthday_person.full_name || ' is celebrating their birthday today. Wish them well!',
    birthday_person.id
  FROM public.profiles birthday_person
  CROSS JOIN public.profiles recipient
  WHERE 
    -- Match birthday month and day to today
    EXTRACT(MONTH FROM birthday_person.birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM birthday_person.birthday) = EXTRACT(DAY FROM CURRENT_DATE)
    -- Don't notify the birthday person about their own birthday
    AND recipient.id != birthday_person.id
    -- Idempotency: skip if notification already sent today for this birthday person to this recipient
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = recipient.id
        AND n.type = 'birthday'
        AND n.reference_id = birthday_person.id
        AND n.created_at::date = CURRENT_DATE
    );
END;
$$;
