/*  ==========================================================================
    VERIFICACAO DE SEGURANCA

    Confere na pratica o que as politicas prometem. Roda contra o banco
    real, com a chave publica  —  exatamente o que um visitante teria.

    Uso:  node --env-file=.env.local scripts/verificar-seguranca.mjs
    ==========================================================================  */

import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const publica = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
const servico = process.env.SUPABASE_SERVICE_ROLE_KEY

const anon = createClient(url, publica, { auth: { persistSession: false } })
const admin = createClient(url, servico, { auth: { persistSession: false } })

const resultados = []

function checa(nome, passou, detalhe = "") {
    resultados.push({ nome, passou, detalhe })
}

/*  1.  Visitante consegue ler o catalogo  */
{
    const { data, error } = await anon.from("produtos").select("id, nome, preco")
    checa("visitante lê o catálogo", !error && (data?.length ?? 0) > 0, error?.message || `${data?.length} produtos`)
}

/*  2.  Visitante consegue ler o perfil da loja  */
{
    const { data, error } = await anon.from("perfil").select("nome, whatsapp").single()
    checa("visitante lê o perfil", !error && Boolean(data?.nome), error?.message || data?.nome)
}

/*  3.  Visitante NAO consegue inserir produto  */
{
    const { error } = await anon.from("produtos").insert({ nome: "invasao", preco: 1 })
    checa("visitante NÃO cria produto", Boolean(error), error?.message ?? "INSERIU — falha de segurança")
}

/*  4.  Visitante NAO consegue apagar produto  */
{
    const { data: alvo } = await anon.from("produtos").select("id").limit(1).single()
    const { error, count } = await anon.from("produtos").delete({ count: "exact" }).eq("id", alvo.id)
    checa("visitante NÃO apaga produto", Boolean(error) || count === 0, error?.message ?? `linhas afetadas: ${count}`)
}

/*  5.  Visitante NAO consegue editar o perfil  */
{
    const { error, count } = await anon.from("perfil").update({ nome: "invadido" }, { count: "exact" }).eq("id", 1)
    checa("visitante NÃO edita o perfil", Boolean(error) || count === 0, error?.message ?? `linhas afetadas: ${count}`)
}

/*  6.  Produto inativo nao aparece para o visitante  */
{
    const { data: criado } = await admin
        .from("produtos")
        .insert({ nome: "__teste_inativo__", preco: 100, ativo: false })
        .select("id")
        .single()

    const { data } = await anon.from("produtos").select("id").eq("id", criado.id)
    checa("produto inativo fica oculto", (data?.length ?? 0) === 0, `${data?.length} visíveis`)

    await admin.from("produtos").delete().eq("id", criado.id)
}

/*  7.  Usuario autenticado que NAO esta em `donos` nao escreve.
        Simula o cenario de alguem se cadastrar sozinho pela API.  */
{
    const email = `teste_${Date.now()}@exemplo.invalid`
    const { data: novo, error: erroCriar } = await admin.auth.admin.createUser({
        email, password: "SenhaDeTeste!123", email_confirm: true
    })

    if (erroCriar) {
        checa("intruso autenticado NÃO escreve", false, "não foi possível criar usuário de teste: " + erroCriar.message)
    } else {
        const intruso = createClient(url, publica, { auth: { persistSession: false } })
        const { error: erroLogin } = await intruso.auth.signInWithPassword({ email, password: "SenhaDeTeste!123" })

        if (erroLogin) {
            checa("intruso autenticado NÃO escreve", false, "login de teste falhou: " + erroLogin.message)
        } else {
            const { error } = await intruso.from("produtos").insert({ nome: "invasao autenticada", preco: 1 })
            checa("intruso autenticado NÃO escreve", Boolean(error), error?.message ?? "INSERIU — falha de segurança")
        }

        await admin.auth.admin.deleteUser(novo.user.id)
    }
}

console.log("")
let falhou = false

for (const r of resultados) {
    const marca = r.passou ? "✓" : "✗"

    if (!r.passou) falhou = true

    console.log(`  ${marca}  ${r.nome}${r.detalhe ? `  —  ${r.detalhe}` : ""}`)
}

console.log("")
process.exit(falhou ? 1 : 0)
