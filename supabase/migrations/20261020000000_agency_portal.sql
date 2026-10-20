-- Sensitive application data is accessed through authorized server handlers only.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null default '',
  full_name text not null default '',
  role text not null default 'CLIENT' check (role in ('CLIENT','ADMIN','TEAM_MEMBER')),
  avatar_url text, phone text, company text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.password_resets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index password_resets_token_hash_idx on public.password_resets(token_hash);

create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  name text not null, email text not null, company text not null default '',
  service text not null, budget text not null, timeline text not null, description text not null,
  status text not null default 'new' check (status in ('new','reviewing','proposal_sent','accepted','declined','archived')),
  admin_notes text not null default '', submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id, client_id)
);
create table public.project_request_attachments (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.project_requests(id) on delete cascade,
  storage_path text not null, filename text not null, mime_type text not null, size_bytes bigint not null check (size_bytes >= 0),
  uploaded_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now()
);
create table public.proposals (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.project_requests(id) on delete restrict,
  client_id uuid not null references public.profiles(id) on delete restrict, created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null, description text not null default '', total_price_paise bigint not null check (total_price_paise >= 0),
  version integer not null default 1 check (version > 0), status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  expires_at timestamptz, accepted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id, client_id),
  foreign key (request_id, client_id) references public.project_requests(id, client_id) on delete restrict
);
create table public.proposal_versions (
  id uuid primary key default gen_random_uuid(), proposal_id uuid not null references public.proposals(id) on delete cascade,
  version integer not null check (version > 0), snapshot jsonb not null,
  created_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now(),
  unique (proposal_id, version)
);
create table public.proposal_milestones (
  id uuid primary key default gen_random_uuid(), proposal_id uuid not null references public.proposals(id) on delete cascade,
  sort_order integer not null check (sort_order > 0), title text not null, description text not null default '',
  price_paise bigint not null check (price_paise >= 0), due_date date, created_at timestamptz not null default now(),
  unique (proposal_id, sort_order)
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), proposal_id uuid unique references public.proposals(id) on delete restrict,
  request_id uuid references public.project_requests(id) on delete restrict,
  client_id uuid not null references public.profiles(id) on delete restrict,
  name text not null, description text not null default '',
  status text not null default 'planning' check (status in ('planning','active','on_hold','completed','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100), total_price_paise bigint not null check (total_price_paise >= 0),
  start_date date, expected_completion_date date, completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (expected_completion_date is null or start_date is null or expected_completion_date >= start_date),
  unique (id, client_id),
  foreign key (proposal_id, client_id) references public.proposals(id, client_id) on delete restrict,
  foreign key (request_id, client_id) references public.project_requests(id, client_id) on delete restrict
);
create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  membership_role text not null default 'TEAM_MEMBER' check (membership_role in ('CLIENT','TEAM_MEMBER')),
  added_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now(),
  primary key (project_id, profile_id)
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null check (sort_order > 0), title text not null, description text not null default '',
  price_paise bigint not null check (price_paise >= 0), paid_paise bigint not null default 0 check (paid_paise >= 0 and paid_paise <= price_paise),
  work_status text not null default 'not_started' check (work_status in ('not_started','in_progress','completed','blocked')),
  work_percent integer not null default 0 check (work_percent between 0 and 100),
  approval_status text not null default 'not_submitted' check (approval_status in ('not_submitted','pending','approved','revision_requested')),
  due_date date, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (project_id, sort_order)
);
create table public.project_files (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null, uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique, filename text not null, mime_type text not null,
  size_bytes bigint not null check (size_bytes between 0 and 52428800),
  category text not null default 'deliverable' check (category in ('brief','reference','deliverable','invoice','receipt','other')),
  client_visible boolean not null default true, created_at timestamptz not null default now()
);
create table public.file_upload_intents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade, storage_path text not null unique,
  filename text not null, mime_type text not null, size_bytes bigint not null check (size_bytes between 1 and 52428800),
  category text not null, client_visible boolean not null default false,
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.milestone_deliverables (
  id uuid primary key default gen_random_uuid(), milestone_id uuid not null references public.milestones(id) on delete cascade,
  file_id uuid references public.project_files(id) on delete set null, title text not null, description text not null default '',
  created_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now()
);
create table public.project_updates (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null, author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null, body text not null, visibility text not null default 'client' check (visibility in ('client','internal')),
  created_at timestamptz not null default now()
);
create table public.project_comments (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null, author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 5000),
  visibility text not null default 'client' check (visibility in ('client','internal')),
  comment_type text not null default 'comment' check (comment_type in ('comment','revision_request','approval')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payments (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete restrict,
  client_id uuid not null references public.profiles(id) on delete restrict, amount_paise bigint not null check (amount_paise > 0),
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  method text not null default 'bank_transfer' check (method in ('bank_transfer','upi','cash','other')),
  reference text not null default '', note text not null default '', receipt_file_id uuid references public.project_files(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete restrict, reviewed_at timestamptz, admin_note text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (project_id, client_id) references public.projects(id, client_id) on delete restrict
);
create table public.milestone_payment_allocations (
  id uuid primary key default gen_random_uuid(), payment_id uuid not null references public.payments(id) on delete restrict,
  milestone_id uuid not null references public.milestones(id) on delete restrict, amount_paise bigint not null check (amount_paise > 0),
  created_at timestamptz not null default now(), unique (payment_id, milestone_id)
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete restrict,
  client_id uuid not null references public.profiles(id) on delete restrict, invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft','issued','partially_paid','paid','void')),
  subtotal_paise bigint not null check (subtotal_paise >= 0), tax_paise bigint not null default 0 check (tax_paise >= 0),
  total_paise bigint not null check (total_paise = subtotal_paise + tax_paise), due_date date, issued_at timestamptz, storage_path text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (project_id, client_id) references public.projects(id, client_id) on delete restrict
);
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null, description text not null, quantity integer not null default 1 check (quantity > 0),
  unit_price_paise bigint not null check (unit_price_paise >= 0), total_paise bigint not null check (total_paise = quantity * unit_price_paise),
  created_at timestamptz not null default now()
);
create table public.invoice_payment_allocations (
  invoice_id uuid not null references public.invoices(id) on delete restrict, payment_id uuid not null references public.payments(id) on delete restrict,
  amount_paise bigint not null check (amount_paise > 0), created_at timestamptz not null default now(), primary key (invoice_id, payment_id)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade, event_type text not null, title text not null,
  body text not null default '', href text, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, description text not null,
  category text not null, technologies text[] not null default '{}', thumbnail_path text, demo_url text,
  is_demo boolean not null default true, is_published boolean not null default false, sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, subject text not null, message text not null,
  status text not null default 'new' check (status in ('new','read','replied','archived')), created_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('agency-project-files', 'agency-project-files', false, 52428800,
      array['application/pdf','image/png','image/jpeg','image/webp','text/plain','application/zip','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;

create index project_requests_client_created_idx on public.project_requests(client_id, created_at desc);
create index project_requests_status_created_idx on public.project_requests(status, created_at desc);
create index proposals_client_status_idx on public.proposals(client_id, status);
create index projects_client_status_idx on public.projects(client_id, status);
create index milestones_project_order_idx on public.milestones(project_id, sort_order);
create index project_updates_project_created_idx on public.project_updates(project_id, created_at desc);
create index project_comments_project_created_idx on public.project_comments(project_id, created_at desc);
create index project_files_project_created_idx on public.project_files(project_id, created_at desc);
create index file_upload_intents_expiry_idx on public.file_upload_intents(expires_at);
create index payments_project_created_idx on public.payments(project_id, created_at desc);
create unique index payments_reference_per_project_idx on public.payments(project_id, lower(reference)) where reference <> '';
create index invoices_client_status_idx on public.invoices(client_id, status, due_date);
create index notifications_profile_unread_idx on public.notifications(profile_id, created_at desc) where read_at is null;
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index contact_messages_created_idx on public.contact_messages(created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','project_requests','proposals','projects','milestones','project_comments','payments','invoices','portfolio_projects'] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.refresh_project_progress()
returns trigger language plpgsql as $$
declare target_project_id uuid; next_progress integer; milestone_count integer;
begin
  target_project_id := coalesce(new.project_id, old.project_id);
  select count(*), coalesce(round(sum(work_percent * greatest(price_paise, 1))::numeric / nullif(sum(greatest(price_paise, 1)), 0)), 0)::integer
  into milestone_count, next_progress from public.milestones where project_id = target_project_id;
  update public.projects
  set progress = case when milestone_count = 0 then 0 else next_progress end,
      status = case when milestone_count > 0 and not exists (select 1 from public.milestones where project_id = target_project_id and work_status <> 'completed') then 'completed'
                    when status = 'planning' and exists (select 1 from public.milestones where project_id = target_project_id and work_status = 'in_progress') then 'active'
                    else status end,
      completed_at = case when milestone_count > 0 and not exists (select 1 from public.milestones where project_id = target_project_id and work_status <> 'completed') then coalesce(completed_at, now()) else completed_at end
  where id = target_project_id;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create trigger milestones_refresh_progress after insert or update of work_status, work_percent or delete on public.milestones for each row execute function public.refresh_project_progress();

create or replace function public.create_project_with_milestones(
  p_client_id uuid, p_request_id uuid, p_name text, p_description text, p_total_price_paise bigint,
  p_start_date date, p_expected_completion_date date, p_created_by uuid, p_milestones jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_project_id uuid; item jsonb; position integer := 0; milestone_sum bigint := 0;
begin
  if jsonb_typeof(p_milestones) <> 'array' or jsonb_array_length(p_milestones) < 1 then raise exception 'At least one milestone is required'; end if;
  select coalesce(sum((value ->> 'pricePaise')::bigint), 0) into milestone_sum from jsonb_array_elements(p_milestones);
  if milestone_sum <> p_total_price_paise then raise exception 'Milestone prices do not match project total'; end if;
  if not exists (select 1 from public.profiles where id = p_client_id and role = 'CLIENT') then raise exception 'Client account was not found'; end if;
  insert into public.projects(client_id, request_id, name, description, total_price_paise, start_date, expected_completion_date, created_by)
  values (p_client_id, p_request_id, p_name, p_description, p_total_price_paise, p_start_date, p_expected_completion_date, p_created_by)
  returning id into new_project_id;
  insert into public.project_members(project_id, profile_id, membership_role, added_by) values (new_project_id, p_client_id, 'CLIENT', p_created_by);
  for item in select value from jsonb_array_elements(p_milestones) loop
    position := position + 1;
    insert into public.milestones(project_id, sort_order, title, description, price_paise, due_date)
    values (new_project_id, position, item ->> 'title', coalesce(item ->> 'description',''), (item ->> 'pricePaise')::bigint, nullif(item ->> 'dueDate','')::date);
  end loop;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_created_by, 'project.created', 'project', new_project_id, jsonb_build_object('client_id', p_client_id, 'total_price_paise', p_total_price_paise));
  if p_request_id is not null then update public.project_requests set status = 'accepted' where id = p_request_id and client_id = p_client_id; end if;
  return new_project_id;
end;
$$;

create or replace function public.accept_proposal(p_proposal_id uuid, p_client_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare selected public.proposals%rowtype; new_project_id uuid; item record; position integer := 0;
begin
  select * into selected from public.proposals where id = p_proposal_id for update;
  if not found or selected.client_id <> p_client_id then raise exception 'Proposal was not found'; end if;
  select id into new_project_id from public.projects where proposal_id = p_proposal_id;
  if new_project_id is not null then return new_project_id; end if;
  if selected.status <> 'sent' or (selected.expires_at is not null and selected.expires_at < now()) then raise exception 'Proposal is no longer available'; end if;
  insert into public.projects(proposal_id, request_id, client_id, name, description, total_price_paise, created_by)
  values (selected.id, selected.request_id, selected.client_id, selected.title, selected.description, selected.total_price_paise, selected.created_by)
  returning id into new_project_id;
  insert into public.project_members(project_id, profile_id, membership_role, added_by) values (new_project_id, selected.client_id, 'CLIENT', selected.created_by);
  for item in select * from public.proposal_milestones where proposal_id = p_proposal_id order by sort_order loop
    position := position + 1;
    insert into public.milestones(project_id, sort_order, title, description, price_paise, due_date)
    values (new_project_id, position, item.title, item.description, item.price_paise, item.due_date);
  end loop;
  update public.proposals set status = 'accepted', accepted_at = now() where id = p_proposal_id;
  update public.project_requests set status = 'accepted' where id = selected.request_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_client_id, 'proposal.accepted', 'proposal', p_proposal_id, jsonb_build_object('project_id', new_project_id));
  insert into public.notifications(profile_id, project_id, event_type, title, body, href)
  values (selected.created_by, new_project_id, 'proposal.accepted', 'Proposal accepted', 'The client accepted the project proposal.', '/admin/projects/' || new_project_id::text);
  return new_project_id;
end;
$$;

create or replace function public.create_proposal_with_milestones(
  p_request_id uuid, p_admin_id uuid, p_title text, p_description text,
  p_total_price_paise bigint, p_expires_at timestamptz, p_milestones jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare request_row public.project_requests%rowtype; proposal_id uuid; item jsonb; position integer := 0; milestone_sum bigint := 0; snapshot jsonb;
begin
  select * into request_row from public.project_requests where id = p_request_id for update;
  if not found then raise exception 'Request was not found'; end if;
  if request_row.status in ('accepted','declined','archived') then raise exception 'Request is closed'; end if;
  if jsonb_typeof(p_milestones) <> 'array' or jsonb_array_length(p_milestones) < 1 then raise exception 'At least one milestone is required'; end if;
  select coalesce(sum((value ->> 'pricePaise')::bigint), 0) into milestone_sum from jsonb_array_elements(p_milestones);
  if milestone_sum <> p_total_price_paise then raise exception 'Milestone prices do not match proposal total'; end if;
  insert into public.proposals(request_id, client_id, created_by, title, description, total_price_paise, status, expires_at, version)
  values (request_row.id, request_row.client_id, p_admin_id, p_title, p_description, p_total_price_paise, 'sent', p_expires_at, 1)
  returning id into proposal_id;
  for item in select value from jsonb_array_elements(p_milestones) loop
    position := position + 1;
    insert into public.proposal_milestones(proposal_id, sort_order, title, description, price_paise, due_date)
    values (proposal_id, position, item ->> 'title', coalesce(item ->> 'description',''), (item ->> 'pricePaise')::bigint, nullif(item ->> 'dueDate','')::date);
  end loop;
  select jsonb_build_object('title', p_title, 'description', p_description, 'total_price_paise', p_total_price_paise,
    'milestones', jsonb_agg(jsonb_build_object('sort_order', sort_order, 'title', title, 'description', description, 'price_paise', price_paise, 'due_date', due_date) order by sort_order))
    into snapshot from public.proposal_milestones where proposal_milestones.proposal_id = proposal_id;
  insert into public.proposal_versions(proposal_id, version, snapshot, created_by) values (proposal_id, 1, snapshot, p_admin_id);
  update public.project_requests set status = 'proposal_sent' where id = request_row.id;
  insert into public.notifications(profile_id, event_type, title, body, href)
  values (request_row.client_id, 'proposal.sent', 'A proposal is ready', 'Review the project scope, milestone plan, and price.', '/dashboard/proposals');
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_admin_id, 'proposal.sent', 'proposal', proposal_id, jsonb_build_object('request_id', p_request_id, 'total_price_paise', p_total_price_paise));
  return proposal_id;
end;
$$;

create or replace function public.review_payment(p_payment_id uuid, p_admin_id uuid, p_status text, p_admin_note text)
returns void language plpgsql security definer set search_path = public as $$
declare payment_row public.payments%rowtype; project_row public.projects%rowtype; already_paid bigint; remaining bigint; milestone_row record; allocation bigint; invoice_row record; invoice_due bigint;
begin
  if p_status not in ('verified','rejected') then raise exception 'Invalid payment status'; end if;
  select * into payment_row from public.payments where id = p_payment_id for update;
  if not found or payment_row.status <> 'pending' then raise exception 'Payment is no longer pending'; end if;
  select * into project_row from public.projects where id = payment_row.project_id for update;
  if p_status = 'verified' then
    select coalesce(sum(amount_paise),0) into already_paid from public.payments where project_id = project_row.id and status = 'verified';
    if payment_row.amount_paise > project_row.total_price_paise - already_paid then raise exception 'Verified payments cannot exceed the outstanding balance'; end if;
    remaining := payment_row.amount_paise;
    for milestone_row in select id, price_paise, paid_paise from public.milestones where project_id = project_row.id order by sort_order for update loop
      exit when remaining = 0;
      allocation := least(remaining, milestone_row.price_paise - milestone_row.paid_paise);
      if allocation > 0 then
        update public.milestones set paid_paise = paid_paise + allocation where id = milestone_row.id;
        insert into public.milestone_payment_allocations(payment_id, milestone_id, amount_paise) values (payment_row.id, milestone_row.id, allocation);
        remaining := remaining - allocation;
      end if;
    end loop;
    if remaining <> 0 then raise exception 'Payment could not be allocated to milestones'; end if;
    remaining := payment_row.amount_paise;
    for invoice_row in
      select i.id, i.total_paise - coalesce((select sum(a.amount_paise) from public.invoice_payment_allocations a where a.invoice_id = i.id),0) as due_paise
      from public.invoices i
      where i.project_id = project_row.id and i.status in ('issued','partially_paid')
      order by i.created_at for update
    loop
      exit when remaining = 0;
      invoice_due := least(remaining, invoice_row.due_paise);
      if invoice_due > 0 then
        insert into public.invoice_payment_allocations(invoice_id, payment_id, amount_paise)
        values (invoice_row.id, payment_row.id, invoice_due) on conflict (invoice_id,payment_id) do nothing;
        update public.invoices i set status = case when coalesce((select sum(a.amount_paise) from public.invoice_payment_allocations a where a.invoice_id = i.id),0) >= i.total_paise then 'paid' else 'partially_paid' end where i.id = invoice_row.id;
        remaining := remaining - invoice_due;
      end if;
    end loop;
  end if;
  update public.payments set status = p_status, reviewed_by = p_admin_id, reviewed_at = now(), admin_note = coalesce(p_admin_note,'') where id = p_payment_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_admin_id, 'payment.' || p_status, 'payment', p_payment_id, jsonb_build_object('amount_paise', payment_row.amount_paise));
  insert into public.notifications(profile_id, project_id, event_type, title, body, href)
  values (payment_row.client_id, payment_row.project_id, 'payment.' || p_status, 'Payment ' || p_status,
    case when p_status = 'verified' then 'Your manual payment was verified.' else 'Your manual payment was rejected. Check the payment note or contact the agency.' end,
    '/dashboard/payments');
end;
$$;

create or replace function public.create_invoice(p_project_id uuid, p_admin_id uuid, p_due_date date, p_milestone_ids uuid[])
returns uuid language plpgsql security definer set search_path = public as $$
declare project_row public.projects%rowtype; invoice_id uuid; subtotal bigint; invoice_no text; item record;
begin
  select * into project_row from public.projects where id = p_project_id for update;
  if not found then raise exception 'Project was not found'; end if;
  select coalesce(sum(m.price_paise - m.paid_paise),0) into subtotal
  from public.milestones m where m.project_id = p_project_id and m.price_paise > m.paid_paise
    and (coalesce(cardinality(p_milestone_ids),0) = 0 or m.id = any(p_milestone_ids))
    and not exists (select 1 from public.invoice_items ii join public.invoices old_invoice on old_invoice.id = ii.invoice_id where ii.milestone_id = m.id and old_invoice.status <> 'void');
  if subtotal <= 0 then raise exception 'No unbilled balance is available for the selected milestones'; end if;
  invoice_no := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.invoices(project_id, client_id, invoice_number, status, subtotal_paise, tax_paise, total_paise, due_date, issued_at, created_by)
  values (p_project_id, project_row.client_id, invoice_no, 'issued', subtotal, 0, subtotal, p_due_date, now(), p_admin_id) returning id into invoice_id;
  for item in select m.id, m.title, m.price_paise - m.paid_paise as amount_paise from public.milestones m
    where m.project_id = p_project_id and m.price_paise > m.paid_paise
      and (coalesce(cardinality(p_milestone_ids),0) = 0 or m.id = any(p_milestone_ids))
      and not exists (select 1 from public.invoice_items ii join public.invoices old_invoice on old_invoice.id = ii.invoice_id where ii.milestone_id = m.id and old_invoice.status <> 'void')
    order by m.sort_order loop
    insert into public.invoice_items(invoice_id, milestone_id, description, quantity, unit_price_paise, total_paise)
    values (invoice_id, item.id, item.title, 1, item.amount_paise, item.amount_paise);
  end loop;
  insert into public.notifications(profile_id, project_id, event_type, title, body, href)
  values (project_row.client_id, project_row.id, 'invoice.issued', 'A new invoice is available', invoice_no, '/dashboard/invoices');
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_admin_id, 'invoice.issued', 'invoice', invoice_id, jsonb_build_object('project_id', p_project_id, 'total_paise', subtotal));
  return invoice_id;
end;
$$;

create or replace function public.revise_proposal(
  p_proposal_id uuid, p_admin_id uuid, p_title text, p_description text,
  p_total_price_paise bigint, p_expires_at timestamptz, p_milestones jsonb
) returns integer language plpgsql security definer set search_path = public as $$
declare selected public.proposals%rowtype; next_version integer; item jsonb; position integer := 0; milestone_sum bigint := 0; snapshot jsonb;
begin
  select * into selected from public.proposals where id = p_proposal_id for update;
  if not found or selected.status in ('accepted','rejected','expired') then raise exception 'Proposal cannot be revised'; end if;
  if jsonb_typeof(p_milestones) <> 'array' or jsonb_array_length(p_milestones) < 1 then raise exception 'At least one milestone is required'; end if;
  select coalesce(sum((value ->> 'pricePaise')::bigint), 0) into milestone_sum from jsonb_array_elements(p_milestones);
  if milestone_sum <> p_total_price_paise then raise exception 'Milestone prices do not match proposal total'; end if;
  next_version := selected.version + 1;
  update public.proposals set title = p_title, description = p_description, total_price_paise = p_total_price_paise,
    version = next_version, status = 'sent', expires_at = p_expires_at where id = p_proposal_id;
  delete from public.proposal_milestones where proposal_id = p_proposal_id;
  for item in select value from jsonb_array_elements(p_milestones) loop
    position := position + 1;
    insert into public.proposal_milestones(proposal_id, sort_order, title, description, price_paise, due_date)
    values (p_proposal_id, position, item ->> 'title', coalesce(item ->> 'description',''), (item ->> 'pricePaise')::bigint, nullif(item ->> 'dueDate','')::date);
  end loop;
  select jsonb_build_object('title', p_title, 'description', p_description, 'total_price_paise', p_total_price_paise,
    'milestones', jsonb_agg(jsonb_build_object('sort_order', sort_order, 'title', title, 'description', description, 'price_paise', price_paise, 'due_date', due_date) order by sort_order))
    into snapshot from public.proposal_milestones where proposal_milestones.proposal_id = p_proposal_id;
  insert into public.proposal_versions(proposal_id, version, snapshot, created_by) values (p_proposal_id, next_version, snapshot, p_admin_id);
  insert into public.notifications(profile_id, event_type, title, body, href)
  values (selected.client_id, 'proposal.revised', 'A proposal was revised', 'Review the latest project scope, milestones, and price.', '/dashboard/proposals');
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_admin_id, 'proposal.revised', 'proposal', p_proposal_id, jsonb_build_object('version', next_version, 'total_price_paise', p_total_price_paise));
  return next_version;
end;
$$;

-- Explicitly no RLS or policies are enabled/created. Data API roles have no table privileges.
revoke all on table public.profiles, public.password_resets, public.project_requests, public.project_request_attachments, public.proposals,
  public.proposal_versions, public.proposal_milestones, public.projects, public.project_members, public.milestones,
  public.project_files, public.file_upload_intents, public.milestone_deliverables, public.project_updates, public.project_comments, public.payments,
  public.milestone_payment_allocations, public.invoices, public.invoice_items, public.invoice_payment_allocations,
  public.notifications, public.audit_logs, public.portfolio_projects, public.contact_messages from public, anon, authenticated;
grant all on table public.profiles, public.password_resets, public.project_requests, public.project_request_attachments, public.proposals,
  public.proposal_versions, public.proposal_milestones, public.projects, public.project_members, public.milestones,
  public.project_files, public.file_upload_intents, public.milestone_deliverables, public.project_updates, public.project_comments, public.payments,
  public.milestone_payment_allocations, public.invoices, public.invoice_items, public.invoice_payment_allocations,
  public.notifications, public.audit_logs, public.portfolio_projects, public.contact_messages to service_role;
revoke all on function public.create_project_with_milestones(uuid,uuid,text,text,bigint,date,date,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.accept_proposal(uuid,uuid) from public, anon, authenticated;
revoke all on function public.create_proposal_with_milestones(uuid,uuid,text,text,bigint,timestamptz,jsonb) from public, anon, authenticated;
revoke all on function public.review_payment(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function public.create_invoice(uuid,uuid,date,uuid[]) from public, anon, authenticated;
revoke all on function public.revise_proposal(uuid,uuid,text,text,bigint,timestamptz,jsonb) from public, anon, authenticated;
grant execute on function public.create_project_with_milestones(uuid,uuid,text,text,bigint,date,date,uuid,jsonb) to service_role;
grant execute on function public.accept_proposal(uuid,uuid) to service_role;
grant execute on function public.create_proposal_with_milestones(uuid,uuid,text,text,bigint,timestamptz,jsonb) to service_role;
grant execute on function public.review_payment(uuid,uuid,text,text) to service_role;
grant execute on function public.create_invoice(uuid,uuid,date,uuid[]) to service_role;
grant execute on function public.revise_proposal(uuid,uuid,text,text,bigint,timestamptz,jsonb) to service_role;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.refresh_project_progress() from public, anon, authenticated;


