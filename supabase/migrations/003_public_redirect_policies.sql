-- Permitir leitura pública dos grupos ativos para o fluxo de redirect
create policy "Public can view active groups"
on redirect.groups
for select
to anon
using (is_active = true);

-- Permitir leitura pública dos números ativos de grupos ativos
create policy "Public can view active numbers from active groups"
on redirect.whatsapp_numbers
for select
to anon
using (
  is_active = true
  and group_id in (
    select id
    from redirect.groups
    where is_active = true
  )
);

