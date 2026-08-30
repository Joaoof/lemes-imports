/*  ==========================================================================
    SETUP DO BANCO

    Roda o schema.sql e semeia o catalogo com os produtos que ja estao no
    catalogo do WhatsApp da loja.

    Uso:  node --env-file=.env.local scripts/setup.mjs
    ==========================================================================  */

import { readFile } from "node:fs/promises"
import pg from "pg"

const conexao = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL

if (!conexao) {
    console.error("Falta POSTGRES_URL_NON_POOLING no ambiente. Rode: vercel env pull .env.local --yes")
    process.exit(1)
}

/*  Os produtos do catalogo atual da loja, em centavos.  */
const catalogo = [
    { nome: "AirPods MAX",     preco: 19999, ordem: 1, descricao: "Som imersivo, design premium e conforto absoluto." },
    { nome: "AirPods 3 PRO",   preco: 19999, ordem: 2, descricao: "Som puro, graves potentes e cancelamento de ruído." },
    { nome: "W68 Ultra Pro Max", preco: 22999, ordem: 3, descricao: "Smartwatch moderno com várias funções e pulseira confortável." },
    { nome: "AirPods 3",       preco: 13999, ordem: 4, descricao: "Áudio espacial com rastreamento dinâmico de cabeça." },
    { nome: "Fone Gamer",      preco: 8999,  ordem: 5, descricao: "Headset com iluminação e microfone embutido." },
    { nome: "Power Bank",      preco: 8200,  ordem: 6, descricao: "Bateria portátil para carregar em qualquer lugar." },
    { nome: "Carregadores para Android e iPhone", preco: 2999, ordem: 7, descricao: "Carregadores rápidos e originais." },
    { nome: "Pulseiras",       preco: 1499,  ordem: 8, descricao: "Pulseiras variadas para smartwatch." }
]

/*  O sslmode embutido na string do Supabase vence a opcao ssl do driver e
    faz o handshake falhar com self-signed cert. Tirando o parametro da URL,
    a opcao explicita abaixo passa a valer.  */
const url = new URL(conexao)
url.searchParams.delete("sslmode")

const cliente = new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false }
})

await cliente.connect()

const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8")
await cliente.query(schema)
console.log("✓ schema aplicado")

/*  Semeia so uma vez: se ja houver produto, nao mexe no que a dona cadastrou.  */
const { rows } = await cliente.query("select count(*)::int as total from produtos")

if (rows[0].total === 0) {
    for (const item of catalogo) {
        await cliente.query(
            "insert into produtos (nome, descricao, preco, ordem) values ($1, $2, $3, $4)",
            [ item.nome, item.descricao, item.preco, item.ordem ]
        )
    }

    console.log(`✓ ${catalogo.length} produtos semeados`)
} else {
    console.log(`· ${rows[0].total} produtos já existem, semeadura ignorada`)
}

await cliente.end()
