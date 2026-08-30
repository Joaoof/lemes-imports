/*  ==========================================================================
    CRIA A CONTA DA DONA DA LOJA

    Duas coisas acontecem aqui, e as duas sao necessarias:

    1.  Cria o usuario no Supabase Auth ja com e-mail confirmado. Sem
        email_confirm o login fica travado esperando um clique em link.
    2.  Registra o id dele na tabela `donos`. E isso que libera escrita:
        as politicas de RLS exigem presenca nessa tabela, nao apenas estar
        autenticado  —  senao qualquer cadastro publico viraria admin.

    Uso:  node --env-file=.env.local scripts/criar-admin.mjs [email]
    ==========================================================================  */

import { createClient } from "@supabase/supabase-js"
import { randomBytes } from "node:crypto"

const url = process.env.SUPABASE_URL
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !chave) {
    console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Rode: vercel env pull .env.local --yes")
    process.exit(1)
}

const email = process.argv[2] || "contato@lemesimports.com.br"

/*  base64url de 18 bytes  —  24 caracteres, forte e ainda digitavel no
    celular, que e onde ela vai entrar.  */
const senha = randomBytes(18).toString("base64url")

const admin = createClient(url, chave, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const { data: lista, error: erroLista } = await admin.auth.admin.listUsers()

if (erroLista) {
    console.error("Falha ao listar usuários:", erroLista.message)
    process.exit(1)
}

const existente = lista?.users?.find((u) => u.email === email)
let idUsuario

if (existente) {
    const { error } = await admin.auth.admin.updateUserById(existente.id, { password: senha })

    if (error) {
        console.error("Falha ao redefinir a senha:", error.message)
        process.exit(1)
    }

    idUsuario = existente.id
    console.log("Conta já existia — senha redefinida.")
} else {
    const { data, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true
    })

    if (error) {
        console.error("Falha ao criar a conta:", error.message)
        process.exit(1)
    }

    idUsuario = data.user.id
    console.log("Conta criada.")
}

/*  O service role passa por cima do RLS, entao este insert funciona mesmo
    com a tabela fechada para todo mundo.  */
const { error: erroDono } = await admin
    .from("donos")
    .upsert({ id: idUsuario }, { onConflict: "id" })

if (erroDono) {
    console.error("Falha ao registrar em donos:", erroDono.message)
    process.exit(1)
}

console.log("Registrada em `donos` — permissão de escrita liberada.")
console.log("")
console.log("  painel:  /admin")
console.log("  e-mail:  " + email)
console.log("  senha:   " + senha)
console.log("")
console.log("Guarde agora: a senha não fica salva em lugar nenhum e não dá para recuperá-la depois.")
