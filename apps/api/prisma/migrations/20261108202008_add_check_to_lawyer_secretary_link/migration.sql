ALTER TABLE lawyer_secretary_links
ADD CONSTRAINT check_link_dates
CHECK (
  end_date IS NULL
  OR
  end_date >= start_date
);