--  ==========================================================================
--  ESQUEMA  —  catalogo de link na bio
--
--  Tres tabelas:
--    donos     quem pode administrar. E a chave da autorizacao.
--    perfil    linha unica com os dados da loja
--    produtos  o catalogo
--  ==========================================================================

create extension if not exists "pgcrypto";

--  --------------------------------------------------------------------------
--  DONOS
--
--  Existe por um motivo de seguranca concreto: o Supabase aceita cadastro
--  publico por padrao. Se as politicas de escrita dissessem apenas
--  "TO authenticated", qualquer pessoa criaria uma conta pela API e
--  passaria a editar o catalogo. Aqui escrita exige estar nesta tabela,
--  que so o service role popula.
--  --------------------------------------------------------------------------
create table if not exists donos (
    id        uuid primary key references auth.users (id) on delete cascade,
    criado_em timestamptz not null default now()
);

--  --------------------------------------------------------------------------
--  PERFIL  —  sempre uma linha so. O check em id garante isso.
--  --------------------------------------------------------------------------
create table if not exists perfil (
    id            int primary key default 1 check (id = 1),
    nome          text not null default 'Lemes Imports',
    arroba        text not null default 'lemes.importss',
    chamada       text not null default 'iPhones 100% americanos',
    bio           text[] not null default array[
        'Loja online',
        'Entregamos em todo o Brasil',
        'Garantia e suporte'
    ],
    whatsapp      text not null default '5563992981463',
    instagram     text not null default 'https://instagram.com/lemes.importss',
    logo_url      text,
    atualizado_em timestamptz not null default now()
);

insert into perfil (id) values (1) on conflict (id) do nothing;

--  --------------------------------------------------------------------------
--  PRODUTOS
--
--  preco em centavos (integer), nao numeric: evita erro de arredondamento
--  e simplifica a formatacao para BRL no front.
--  --------------------------------------------------------------------------
create table if not exists produtos (
    id         uuid primary key default gen_random_uuid(),
    nome       text not null,
    descricao  text,
    preco      int not null check (preco >= 0),
    imagem_url text,
    ativo      boolean not null default true,
    ordem      int not null default 0,
    criado_em  timestamptz not null default now()
);

create index if not exists produtos_vitrine_idx
    on produtos (ativo, ordem, criado_em desc);

--  ==========================================================================
--  ACESSO A DATA API
--
--  Criar a tabela por SQL nao a expoe sozinha: sem GRANT, anon e
--  authenticated levam "permission denied" mesmo com RLS liberando a linha.
--  GRANT abre a tabela; RLS, logo abaixo, decide quais linhas aparecem.
--  ==========================================================================
grant usage on schema public to anon, authenticated;

grant select                 on perfil   to anon, authenticated;
grant update                 on perfil   to authenticated;
grant select                 on produtos to anon, authenticated;
grant insert, update, delete on produtos to authenticated;
grant select                 on donos    to authenticated;

--  ==========================================================================
--  RLS
--  ==========================================================================
alter table donos    enable row level security;
alter table perfil   enable row level security;
alter table produtos enable row level security;

--  --------------------------------------------------------------------------
--  LIMPEZA
--
--  Politicas de RLS sao permissivas e combinadas por OU: basta uma antiga
--  e frouxa sobrar para anular todas as restritas. Uma versao anterior
--  deste arquivo deixou "produtos_escrita_dona" com check(true) e qualquer
--  autenticado passou a escrever  —  o drop nominal nao pegou porque o
--  nome havia mudado.
--
--  Entao aqui nao se dropa por nome: apaga-se tudo que nao esta na lista
--  desejada. O arquivo passa a descrever o estado final, nao um delta.
--  --------------------------------------------------------------------------
do $$
declare
    p record;
begin
    for p in
        select schemaname, tablename, policyname
        from pg_policies
        where (schemaname = 'public' and tablename in ('donos', 'perfil', 'produtos'))
           or (schemaname = 'storage' and tablename = 'objects' and policyname like 'fotos\_%')
    loop
        execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    end loop;
end $$;

--  A dona precisa enxergar a propria linha, senao o exists() das politicas
--  abaixo roda sob RLS e devolve falso para ela mesma.
drop policy if exists donos_ve_a_si on donos;
create policy donos_ve_a_si
    on donos for select
    to authenticated
    using (id = (select auth.uid()));

--  --------------------------------------------------------------------------
--  PERFIL
--  --------------------------------------------------------------------------
drop policy if exists perfil_leitura_publica on perfil;
create policy perfil_leitura_publica
    on perfil for select
    to anon, authenticated
    using (true);

--  UPDATE exige USING e WITH CHECK: sem o WITH CHECK a linha poderia ser
--  gravada num estado que a propria politica nao permitiria ler de volta.
drop policy if exists perfil_escrita_dona on perfil;
create policy perfil_escrita_dona
    on perfil for update
    to authenticated
    using      (exists (select 1 from donos d where d.id = (select auth.uid())))
    with check (exists (select 1 from donos d where d.id = (select auth.uid())));

--  --------------------------------------------------------------------------
--  PRODUTOS
--
--  Produto inativo some da leitura publica: e assim que ela tira um item
--  do ar sem apagar o historico. A dona continua vendo todos.
--  --------------------------------------------------------------------------
drop policy if exists produtos_leitura_publica on produtos;
create policy produtos_leitura_publica
    on produtos for select
    to anon
    using (ativo = true);

drop policy if exists produtos_leitura_dona on produtos;
create policy produtos_leitura_dona
    on produtos for select
    to authenticated
    using (exists (select 1 from donos d where d.id = (select auth.uid())));

drop policy if exists produtos_insercao_dona on produtos;
create policy produtos_insercao_dona
    on produtos for insert
    to authenticated
    with check (exists (select 1 from donos d where d.id = (select auth.uid())));

drop policy if exists produtos_atualizacao_dona on produtos;
create policy produtos_atualizacao_dona
    on produtos for update
    to authenticated
    using      (exists (select 1 from donos d where d.id = (select auth.uid())))
    with check (exists (select 1 from donos d where d.id = (select auth.uid())));

drop policy if exists produtos_remocao_dona on produtos;
create policy produtos_remocao_dona
    on produtos for delete
    to authenticated
    using (exists (select 1 from donos d where d.id = (select auth.uid())));

--  ==========================================================================
--  STORAGE  —  bucket das fotos de produto
--
--  Leitura publica (as fotos aparecem no catalogo). Para a dona: INSERT,
--  SELECT e UPDATE  —  os tres. So com INSERT o upsert falha calado quando
--  ela troca a foto de um produto que ja existe.
--  ==========================================================================
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists fotos_leitura_publica on storage.objects;
create policy fotos_leitura_publica
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'produtos');

drop policy if exists fotos_envio_dona on storage.objects;
create policy fotos_envio_dona
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'produtos' and exists (select 1 from donos d where d.id = (select auth.uid())));

drop policy if exists fotos_troca_dona on storage.objects;
create policy fotos_troca_dona
    on storage.objects for update
    to authenticated
    using      (bucket_id = 'produtos' and exists (select 1 from donos d where d.id = (select auth.uid())))
    with check (bucket_id = 'produtos' and exists (select 1 from donos d where d.id = (select auth.uid())));

drop policy if exists fotos_remocao_dona on storage.objects;
create policy fotos_remocao_dona
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'produtos' and exists (select 1 from donos d where d.id = (select auth.uid())));
