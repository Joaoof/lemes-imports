<script setup lang="ts">
/*  ==========================================================================
    LINK NA BIO  —  BY KAROLINNY  (MODA FEMININA)

    Marca diferente da loja principal (Lemes/iPhones): preto sobre bege claro,
    tipografia serifada. Convive na mesma app so pelo dominio; visualmente e
    outra loja.

    Numeros de WhatsApp ainda sao placeholder ("#") — trocar em `zap` e
    `grupoVip` quando a Karolinny mandar. O catalogo tambem e mockup ate
    ela enviar as fotos reais das pecas.
    ==========================================================================  */

useHead({
    title: "By Karolinny — Moda Feminina",
    meta: [
        { name: "description", content: "Peças selecionadas de moda feminina. Compre pelo WhatsApp." },
        { name: "theme-color", content: "#EFEDE9" }
    ]
})

/*  Sobrescreve o dark-mode global da Lemes so nesta pagina.  */
useColorMode().preference = "light"

const zap = "#"
const grupoVip = "#"

function pedir(nome: string, preco: number) {
    const msg = encodeURIComponent(`Oi Karolinny! Tenho interesse na peça: ${nome} (R$ ${preco.toFixed(2).replace(".", ",")})`)
    return zap === "#" ? "#" : `${zap}?text=${msg}`
}

/*  8 pecas placeholder com imagens de placehold.co (servico livre) na
    paleta da marca. Trocar quando a Karolinny enviar fotos reais.  */
const produtos = [
    { nome: "Vestido Midi Floral",       preco: 189.00 },
    { nome: "Blusa Cropped Ribana",      preco:  79.00 },
    { nome: "Saia Midi Plissada",        preco: 149.00 },
    { nome: "Calça Wide Leg",            preco: 199.00 },
    { nome: "Conjunto Blazer + Short",   preco: 289.00 },
    { nome: "Body Manga Longa",          preco:  99.00 },
    { nome: "Vestido Longo Casual",      preco: 229.00 },
    { nome: "Camisa Social Feminina",    preco: 139.00 }
].map(p => ({
    ...p,
    imagem: `https://placehold.co/600x750/EFEDE9/1a1a1a/png?text=${encodeURIComponent(p.nome.replace(/ /g, "+"))}&font=lora`
}))

function emReais(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
</script>

<template>
    <div class="karolinny min-h-dvh bg-[#EFEDE9] text-[#1A1A1A]">
        <div class="mx-auto w-full max-w-[540px] px-5 pb-16 pt-10">

            <!--  Marca  —  a logo ja tem "By Karolinny / Moda Feminina" e um
                  coracao. Nao repito o nome em texto embaixo, ficaria ruido.  -->
            <header class="sobe text-center">
                <img
                    src="/karolinny/logo.jpeg"
                    alt="By Karolinny — Moda Feminina"
                    class="mx-auto h-auto w-full max-w-[320px]"
                >
            </header>

            <!--  Bio curta  —  uma linha, para nao empurrar os botoes pra
                  baixo do scroll no celular.  -->
            <p
                class="sobe mt-4 text-center text-[13.5px] leading-relaxed text-[#5A5750]"
                style="--atraso:60ms"
            >
                Peças selecionadas · Envio pra todo Brasil · Pagamento no pix ou cartão
            </p>

            <!--  Os dois botoes  —  o primeiro e a acao principal (conversa
                  direta), o segundo e comunidade (retornado, promocoes). Ficam
                  antes do catalogo porque quem chega do Instagram ja veio
                  querendo falar.  -->
            <div class="sobe mt-7 grid gap-3" style="--atraso:120ms">
                <a
                    :href="zap"
                    target="_blank"
                    rel="noopener"
                    class="botao flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 text-[15px] font-semibold text-white shadow-sm"
                >
                    <UIcon name="i-fa6-brands-whatsapp" class="text-xl" />
                    Chamar no WhatsApp
                </a>

                <a
                    :href="grupoVip"
                    target="_blank"
                    rel="noopener"
                    class="botao flex items-center justify-center gap-2.5 rounded-2xl border border-[#1A1A1A] bg-[#1A1A1A] py-4 text-[15px] font-semibold text-white shadow-sm"
                >
                    <UIcon name="i-fa6-solid-crown" class="text-base text-[#C9A96A]" />
                    Entrar no Grupo VIP
                </a>
            </div>

            <!--  Catalogo  —  grid de duas colunas porque a tela do celular
                  segura sem ficar apertado, e permite ver mais peca sem rolar
                  tanto. Cada card abre WhatsApp com nome + preco escritos.  -->
            <section class="mt-10">
                <h2 class="etiqueta mb-4 text-center text-[#7A776F]">
                    Coleção
                </h2>

                <div class="grid grid-cols-2 gap-3">
                    <a
                        v-for="(produto, i) in produtos"
                        :key="produto.nome"
                        :href="pedir(produto.nome, produto.preco)"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe overflow-hidden rounded-2xl bg-white"
                        :style="`--atraso:${200 + i * 40}ms`"
                    >
                        <div class="aspect-[4/5] w-full bg-[#EFEDE9]">
                            <img
                                :src="produto.imagem"
                                :alt="produto.nome"
                                loading="lazy"
                                class="h-full w-full object-cover"
                            >
                        </div>
                        <div class="p-3">
                            <p class="line-clamp-1 text-[13.5px] font-medium">
                                {{ produto.nome }}
                            </p>
                            <p class="valor mt-1 text-[15px] text-[#1A1A1A]">
                                {{ emReais(produto.preco) }}
                            </p>
                        </div>
                    </a>
                </div>
            </section>

            <!--  Assinatura discreta no rodape.  -->
            <footer class="sobe mt-12 text-center text-[11px] uppercase tracking-widest text-[#9A978F]" style="--atraso:600ms">
                By Karolinny · Moda Feminina
            </footer>
        </div>
    </div>
</template>

<style scoped>
/*  Forca o body a acompanhar o fundo bege desta pagina  —  sem isso o
    dark global vaza nas bordas em telas altas onde o container nao ocupa
    100% da altura.  */
.karolinny { --tw-prose-body: #1A1A1A }
</style>
