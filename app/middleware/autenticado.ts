/*  Guarda do painel.

    Roda so no cliente: a sessao do Supabase vive no localStorage do
    navegador, entao no servidor ela nunca existiria e todo acesso cairia
    no login mesmo com a dona logada.

    Isso e conveniencia de navegacao, nao seguranca  —  quem protege os
    dados sao as politicas de RLS. Mesmo que alguem force a rota, o banco
    nao devolve nem aceita nada sem estar na tabela `donos`.  */

export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.server) return

    const supabase = useSupabase()
    const { data } = await supabase.auth.getSession()

    if (!data.session) return navigateTo("/admin/login")
})
