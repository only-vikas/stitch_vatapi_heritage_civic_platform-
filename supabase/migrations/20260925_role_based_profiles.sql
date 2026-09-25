-- =========================================================
-- VATAPI ROLE-BASED PROFILE SYSTEM - 7 DEMO PERSONAS
-- =========================================================

-- STEP 1: Update the role check constraint to include the new roles
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('citizen', 'volunteer', 'official', 'investor', 'artisan', 'admin'));

-- STEP 2: Add extra columns to profiles for role-specific data
alter table public.profiles 
  add column if not exists organization text,
  add column if not exists jurisdiction text,
  add column if not exists bio text;

-- STEP 3: Update the trigger to accept role and metadata from signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, role, organization, jurisdiction, bio)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    new.raw_user_meta_data->>'organization',
    new.raw_user_meta_data->>'jurisdiction',
    new.raw_user_meta_data->>'bio'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role),
    organization = coalesce(excluded.organization, profiles.organization),
    jurisdiction = coalesce(excluded.jurisdiction, profiles.jurisdiction),
    bio = coalesce(excluded.bio, profiles.bio);
  return new;
end;
$$ language plpgsql security definer;

-- STEP 4: Updates for the 7 Demo Personas
-- (Matches when users are created in Supabase Auth or when username matches email)

update public.profiles set 
  full_name = 'Arjun Sharma', 
  role = 'citizen', 
  organization = 'Tourist',
  bio = 'Heritage traveler exploring Bagalkote.'
where username = 'arjun@vatapi.demo' or username = 'arjun';

update public.profiles set 
  full_name = 'Dr. Basavaraj Hiremath', 
  role = 'official', 
  organization = 'ASI Dharwad Circle',
  jurisdiction = 'Badami Taluk',
  bio = 'Superintending Archaeologist. 22 years in Chalukyan conservation.'
where username = 'asi.officer@vatapi.demo' or username = 'asi.officer';

update public.profiles set 
  full_name = 'Priya Kulkarni', 
  role = 'volunteer', 
  organization = 'Eco-Sena Bagalkote',
  jurisdiction = 'Badami & Hungund',
  bio = 'Volunteer coordinator for weekend cleanup drives.'
where username = 'volunteer@vatapi.demo' or username = 'volunteer';

update public.profiles set 
  full_name = 'R. Gaddigoudar', 
  role = 'investor', 
  organization = 'Malaprabha Heritage Ventures',
  bio = 'Looking for tourism PPP opportunities in North Karnataka.'
where username = 'investor@vatapi.demo' or username = 'investor';

update public.profiles set 
  full_name = 'Kasturbai Ilkal', 
  role = 'artisan', 
  organization = 'Ilkal Weavers Colony',
  bio = 'National Awardee. 5th generation Kasuti weaver.'
where username = 'weaver@vatapi.demo' or username = 'weaver';

update public.profiles set 
  full_name = 'Anjanadevi T.', 
  role = 'official', 
  organization = 'Dept. of Tourism, Bagalkote',
  jurisdiction = 'District-wide',
  bio = 'Deputy Director (I/C), managing sustainable tourism.'
where username = 'tourism.officer@vatapi.demo' or username = 'tourism.officer';

update public.profiles set 
  full_name = 'District Commissioner', 
  role = 'admin', 
  organization = 'Bagalkote District Administration',
  jurisdiction = 'Bagalkote District',
  bio = 'Overseeing all civic and heritage operations.'
where username = 'dc@vatapi.demo' or username = 'dc';
