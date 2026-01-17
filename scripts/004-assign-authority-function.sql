-- Function to auto-assign authority based on category
CREATE OR REPLACE FUNCTION public.get_department_for_category(cat issue_category)
RETURNS department
LANGUAGE plpgsql
AS $$
BEGIN
  CASE cat
    WHEN 'road_pothole' THEN RETURN 'road';
    WHEN 'water_supply' THEN RETURN 'water';
    WHEN 'garbage' THEN RETURN 'sanitation';
    WHEN 'streetlight' THEN RETURN 'electrical';
    WHEN 'sanitation' THEN RETURN 'sanitation';
    ELSE RETURN 'general';
  END CASE;
END;
$$;

-- Function to auto-assign issue to an available authority
CREATE OR REPLACE FUNCTION public.auto_assign_authority()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dept department;
  authority_id UUID;
BEGIN
  -- Get department for this category
  dept := get_department_for_category(NEW.category);
  
  -- Find an active authority for this department
  SELECT id INTO authority_id
  FROM public.profiles
  WHERE role = 'authority' 
    AND department = dept 
    AND is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- If no specific department authority, find any active authority
  IF authority_id IS NULL THEN
    SELECT id INTO authority_id
    FROM public.profiles
    WHERE role = 'authority' 
      AND is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  NEW.assigned_authority_id := authority_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_issue_created ON public.issues;

CREATE TRIGGER on_issue_created
  BEFORE INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_authority();
