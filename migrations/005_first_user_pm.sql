-- Make the handle_new_user trigger set the first user as PM
-- (subsequent users get 'viewonly' by default)
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  user_count int;
begin
  select count(*) into user_count from profiles;
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case when user_count = 0 then 'pm' else 'viewonly' end
  );
  return new;
end;
$$;
