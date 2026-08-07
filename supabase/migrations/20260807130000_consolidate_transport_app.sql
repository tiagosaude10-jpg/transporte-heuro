-- Consolidação do fluxo de transporte HEURO em nuvem.
-- Aplicada inicialmente ao projeto HEUROTransportes2 em 07/08/2026.

alter table public.transport_requests
  add column if not exists requester_contact text;

create or replace function public.accept_transport_request(
  p_request_id uuid,
  p_vehicle_id uuid default null,
  p_team_name text default null
)
returns public.transport_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_request public.transport_requests%rowtype;
  v_vehicle public.transport_vehicles%rowtype;
  v_execution public.transport_executions%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.id is null
     or v_profile.status::text <> 'aprovado'
     or v_profile.authorized_access::text not in ('executante','solicitante_executante','administrador_geral') then
    raise exception 'Acesso não autorizado.';
  end if;

  select * into v_request from public.transport_requests where id = p_request_id for update;
  if v_request.id is null then raise exception 'Solicitação não encontrada.'; end if;
  if lower(v_request.status) not in ('pendente','solicitado','aguardando','aguardando ambulância','aguardando_ambulancia') then
    raise exception 'Esta solicitação já foi aceita ou não está disponível.';
  end if;

  if p_vehicle_id is not null then
    select * into v_vehicle from public.transport_vehicles where id = p_vehicle_id and active = true;
    if v_vehicle.id is null then raise exception 'Ambulância indisponível.'; end if;
    if v_vehicle.support_type <> v_request.support_type then raise exception 'Tipo de ambulância incompatível com a solicitação.'; end if;
    if exists (
      select 1 from public.transport_executions e
      where e.vehicle_id = p_vehicle_id and e.request_id <> p_request_id
        and e.status not in ('concluido','cancelado','recusado')
    ) then raise exception 'Esta ambulância já está em uso.'; end if;
  end if;

  select * into v_execution from public.transport_executions where request_id = p_request_id for update;
  if v_execution.id is null then
    insert into public.transport_executions(
      request_id,responsible_id,responsible_name,vehicle_id,vehicle_code,team_name,status
    ) values (
      v_request.id,auth.uid(),coalesce(v_profile.display_name,v_profile.full_name,'Executante'),
      p_vehicle_id,v_vehicle.code,nullif(trim(p_team_name),''),'aceito'
    ) returning * into v_execution;
  elsif v_execution.status in ('recusado','cancelado') then
    update public.transport_executions
    set responsible_id=auth.uid(),
        responsible_name=coalesce(v_profile.display_name,v_profile.full_name,'Executante'),
        vehicle_id=p_vehicle_id,vehicle_code=v_vehicle.code,team_name=nullif(trim(p_team_name),''),
        status='aceito',accepted_at=now(),completed_at=null,cancellation_reason=null,updated_at=now()
    where id=v_execution.id returning * into v_execution;
  else
    raise exception 'Esta solicitação já possui um aceite ativo.';
  end if;

  update public.transport_requests set status='em_execucao',updated_at=now() where id=v_request.id;
  insert into public.transport_execution_events(
    request_id,execution_id,actor_id,actor_name,event_type,previous_status,new_status
  ) values (
    v_request.id,v_execution.id,auth.uid(),coalesce(v_profile.display_name,v_profile.full_name,'Executante'),
    'aceite',v_request.status,'aceito'
  );
  return v_execution;
end;
$$;

create or replace function public.unaccept_transport_request(p_request_id uuid)
returns public.transport_executions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_request public.transport_requests%rowtype;
  v_execution public.transport_executions%rowtype;
  v_previous text;
begin
  select * into v_profile from public.profiles where id=auth.uid();
  if v_profile.id is null
     or v_profile.status::text <> 'aprovado'
     or v_profile.authorized_access::text not in ('executante','solicitante_executante','administrador_geral') then
    raise exception 'Acesso não autorizado.';
  end if;

  select * into v_request from public.transport_requests where id=p_request_id for update;
  if v_request.id is null then raise exception 'Solicitação não encontrada.'; end if;
  select * into v_execution from public.transport_executions where request_id=p_request_id for update;
  if v_execution.id is null or v_execution.status in ('recusado','cancelado') then
    raise exception 'Esta solicitação não possui um aceite ativo.';
  end if;
  if v_execution.status='concluido' or v_execution.completed_at is not null then
    raise exception 'Um transporte concluído não pode voltar para pendente.';
  end if;
  if v_execution.responsible_id <> auth.uid() and v_profile.authorized_access::text <> 'administrador_geral' then
    raise exception 'Somente o responsável ou administrador pode desaceitar.';
  end if;

  v_previous := v_execution.status;
  update public.transport_executions
  set status='recusado',cancellation_reason='Aceite desfeito pelo responsável.',updated_at=now()
  where id=v_execution.id returning * into v_execution;
  update public.transport_requests set status='pendente',updated_at=now() where id=p_request_id;
  insert into public.transport_execution_events(
    request_id,execution_id,actor_id,actor_name,event_type,previous_status,new_status
  ) values (
    p_request_id,v_execution.id,auth.uid(),coalesce(v_profile.display_name,v_profile.full_name,'Executante'),
    'desaceite',v_previous,'pendente'
  );
  return v_execution;
end;
$$;

revoke all on function public.unaccept_transport_request(uuid) from public, anon;
grant execute on function public.unaccept_transport_request(uuid) to authenticated;

drop policy if exists requesters_read_own_executions on public.transport_executions;
create policy requesters_read_own_executions
on public.transport_executions for select to authenticated
using (
  exists (
    select 1 from public.transport_requests r
    where r.id=transport_executions.request_id and r.requester_id=(select auth.uid())
  )
);

drop policy if exists requesters_read_own_execution_events on public.transport_execution_events;
create policy requesters_read_own_execution_events
on public.transport_execution_events for select to authenticated
using (
  exists (
    select 1 from public.transport_requests r
    where r.id=transport_execution_events.request_id and r.requester_id=(select auth.uid())
  )
);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='transport_requests') then
    alter publication supabase_realtime add table public.transport_requests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='transport_executions') then
    alter publication supabase_realtime add table public.transport_executions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
end
$$;
