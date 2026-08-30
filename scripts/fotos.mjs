/*  ==========================================================================
    FOTOS DOS PRODUTOS

    Baixa uma foto por produto e envia para o bucket `produtos`.

    As imagens vem do Unsplash, cuja licenca permite uso comercial. Sao
    fotos genericas da categoria, nao do estoque real  —  servem para a
    loja nao nascer vazia. O ideal e a dona trocar por fotos dos proprios
    produtos pelo painel.

    O corte e a conversao para WebP acontecem no CDN do Unsplash, via
    parametros de URL: nada de processar imagem aqui.

    Uso:  node --env-file=.env.local scripts/fotos.mjs
    ==========================================================================  */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
)

/*  Uma foto por produto, escolhida entre os resultados da busca.  */
const fotos = {
    "AirPods MAX":                        "photo-1625245488459-ee9051a7030f",
    "AirPods 3 PRO":                      "photo-1588423771073-b8903fbb85b5",
    "AirPods 3":                          "photo-1600294037681-c80b4cb5b434",
    "W68 Ultra Pro Max":                  "photo-1617043983671-adaadcaa2460",
    "Fone Gamer":                         "photo-1610041321327-b794c052db27",
    "Power Bank":                         "photo-1614399113305-a127bb2ca893",
    "Carregadores para Android e iPhone": "photo-1573868388390-2739872961e6",
    "Pulseiras":                          "photo-1535449425-adc6f5faa71c"
}

const { data: produtos, error } = await supabase.from("produtos").select("id, nome")

if (error) {
    console.error("Falha ao ler produtos:", error.message)
    process.exit(1)
}

for (const produto of produtos) {
    const id = fotos[produto.nome]

    if (!id) {
        console.log(`·  ${produto.nome} — sem foto mapeada, pulando`)
        continue
    }

    const origem = `https://images.unsplash.com/${id}?fit=crop&w=800&h=800&q=78&fm=webp`
    const resposta = await fetch(origem)

    if (!resposta.ok) {
        console.log(`✗  ${produto.nome} — download falhou (${resposta.status})`)
        continue
    }

    const bytes = new Uint8Array(await resposta.arrayBuffer())
    const caminho = `${produto.id}.webp`

    const { error: erroUpload } = await supabase.storage
        .from("produtos")
        .upload(caminho, bytes, { contentType: "image/webp", upsert: true })

    if (erroUpload) {
        console.log(`✗  ${produto.nome} — upload falhou: ${erroUpload.message}`)
        continue
    }

    const publica = supabase.storage.from("produtos").getPublicUrl(caminho).data.publicUrl

    const { error: erroUpdate } = await supabase
        .from("produtos")
        .update({ imagem_url: publica })
        .eq("id", produto.id)

    if (erroUpdate) {
        console.log(`✗  ${produto.nome} — não deu para gravar a URL: ${erroUpdate.message}`)
        continue
    }

    console.log(`✓  ${produto.nome} — ${Math.round(bytes.length / 1024)} kB`)
}
