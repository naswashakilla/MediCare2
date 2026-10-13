create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id_user, nama_user, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_user', 'Pengguna'),
    new.email,
    'pasien'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();