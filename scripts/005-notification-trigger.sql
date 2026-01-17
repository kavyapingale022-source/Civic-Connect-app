-- Function to create notification on status change
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  issue_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get issue details
  SELECT * INTO issue_record FROM public.issues WHERE id = NEW.issue_id;
  
  -- Set notification content based on new status
  CASE NEW.new_status
    WHEN 'in_progress' THEN
      notification_title := 'Issue Update';
      notification_message := 'Your reported issue is now being worked on.';
    WHEN 'resolved' THEN
      notification_title := 'Issue Resolved';
      notification_message := 'Your reported issue has been resolved.';
    ELSE
      notification_title := 'Issue Update';
      notification_message := 'Your issue status has been updated.';
  END CASE;
  
  -- Create notification for citizen
  INSERT INTO public.notifications (user_id, issue_id, title, message)
  VALUES (issue_record.citizen_id, NEW.issue_id, notification_title, notification_message);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_status_log_created ON public.status_logs;

CREATE TRIGGER on_status_log_created
  AFTER INSERT ON public.status_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_status_change();
