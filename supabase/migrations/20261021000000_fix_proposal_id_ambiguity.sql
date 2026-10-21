create or replace function public.create_proposal_with_milestones(
  p_request_id uuid, p_admin_id uuid, p_title text, p_description text,
  p_total_price_paise bigint, p_expires_at timestamptz, p_milestones jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  request_row public.project_requests%rowtype;
  created_proposal_id uuid;
  item jsonb;
  position integer := 0;
  milestone_sum bigint := 0;
  snapshot jsonb;
begin
  select * into request_row
  from public.project_requests
  where id = p_request_id
  for update;

  if not found then raise exception 'Request was not found'; end if;
  if request_row.status in ('accepted','declined','archived') then raise exception 'Request is closed'; end if;
  if jsonb_typeof(p_milestones) <> 'array' or jsonb_array_length(p_milestones) < 1 then
    raise exception 'At least one milestone is required';
  end if;

  select coalesce(sum((value ->> 'pricePaise')::bigint), 0)
  into milestone_sum
  from jsonb_array_elements(p_milestones);

  if milestone_sum <> p_total_price_paise then
    raise exception 'Milestone prices do not match proposal total';
  end if;

  insert into public.proposals(request_id, client_id, created_by, title, description, total_price_paise, status, expires_at, version)
  values (request_row.id, request_row.client_id, p_admin_id, p_title, p_description, p_total_price_paise, 'sent', p_expires_at, 1)
  returning id into created_proposal_id;

  for item in select value from jsonb_array_elements(p_milestones) loop
    position := position + 1;
    insert into public.proposal_milestones(proposal_id, sort_order, title, description, price_paise, due_date)
    values (created_proposal_id, position, item ->> 'title', coalesce(item ->> 'description',''), (item ->> 'pricePaise')::bigint, nullif(item ->> 'dueDate','')::date);
  end loop;

  select jsonb_build_object(
    'title', p_title,
    'description', p_description,
    'total_price_paise', p_total_price_paise,
    'milestones', jsonb_agg(jsonb_build_object(
      'sort_order', sort_order,
      'title', title,
      'description', description,
      'price_paise', price_paise,
      'due_date', due_date
    ) order by sort_order)
  )
  into snapshot
  from public.proposal_milestones
  where proposal_milestones.proposal_id = created_proposal_id;

  insert into public.proposal_versions(proposal_id, version, snapshot, created_by)
  values (created_proposal_id, 1, snapshot, p_admin_id);

  update public.project_requests
  set status = 'proposal_sent'
  where id = request_row.id;

  insert into public.notifications(profile_id, event_type, title, body, href)
  values (request_row.client_id, 'proposal.sent', 'A proposal is ready', 'Review the project scope, milestone plan, and price.', '/dashboard/proposals');

  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (p_admin_id, 'proposal.sent', 'proposal', created_proposal_id, jsonb_build_object('request_id', p_request_id, 'total_price_paise', p_total_price_paise));

  return created_proposal_id;
end;
$$;
