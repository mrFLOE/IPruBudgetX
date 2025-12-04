/*
  # Add Theme Preference to Users

  Adds theme preference field to support light/dark mode toggle in IpruBudgetX.

  ## Changes
  
  1. Add theme column to users table
     - `theme` (text, default 'light'): User's preferred theme (light or dark)
  
  2. No RLS policy changes needed (existing policies apply)

  ## Notes
  - Default theme is 'light'
  - Existing users will automatically get 'light' theme
  - Users can change this in their settings page
*/

-- Add theme column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'theme'
  ) THEN
    ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'light';
  END IF;
END $$;