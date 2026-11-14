create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin()
  then
    raise exception 'Only an admin can change a profile role.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger prevent_non_admin_profile_role_change
before update of role on public.profiles
for each row execute function public.prevent_non_admin_role_change();
