-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Issues RLS policies
CREATE POLICY "Citizens can view their own issues"
  ON public.issues FOR SELECT
  USING (citizen_id = auth.uid());

CREATE POLICY "Citizens can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "Authorities can view assigned issues"
  ON public.issues FOR SELECT
  USING (assigned_authority_id = auth.uid());

CREATE POLICY "Authorities can update assigned issues"
  ON public.issues FOR UPDATE
  USING (assigned_authority_id = auth.uid());

CREATE POLICY "Admins can view all issues"
  ON public.issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all issues"
  ON public.issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Status logs RLS policies
CREATE POLICY "Users can view status logs for their issues"
  ON public.status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.issues 
      WHERE issues.id = status_logs.issue_id 
      AND (issues.citizen_id = auth.uid() OR issues.assigned_authority_id = auth.uid())
    )
  );

CREATE POLICY "Authorities can create status logs"
  ON public.status_logs FOR INSERT
  WITH CHECK (changed_by = auth.uid());

CREATE POLICY "Admins can view all status logs"
  ON public.status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications RLS policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
