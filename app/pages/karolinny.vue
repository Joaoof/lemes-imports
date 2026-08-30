<script setup lang="ts">
/*  ==========================================================================
    LINK NA BIO  —  BY KAROLINNY  (MODA FEMININA)

    Mesmo pattern da home da Lemes, adaptado em paleta cream/nude/preto e
    tipografia Poppins (mesma fonte do resto do app). Dois caminhos de
    conversa: WhatsApp direto e Grupo VIP.

    Fotos vem do Unsplash (uso comercial ok pela licenca deles) so pra
    povoar a vitrine ate a Karolinny mandar as pecas dela. Trocar `zap` e
    `grupoVip` pelos links reais. Preco nao aparece: cada card manda a
    conversa pro WhatsApp com o codigo do item ja escrito.
    ==========================================================================  */

useHead({
    title: "By Karolinny — Moda Feminina",
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" }
    ],
    meta: [
        { name: "description", content: "By Karolinny — moda feminina, peças novas toda semana. Compre pelo WhatsApp." },
        { name: "theme-color", content: "#EFE7DA" }
    ]
})

useColorMode().preference = "light"

const zap = "#"
const grupoVip = "#"
const arroba = "by.karolinny"

/*  Fotos Unsplash direto. Redimensionadas na URL para servir so o que o
    card precisa (economiza dado no 3G).  */
function foto(id: string, w: number, h: number) {
    return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

const destaques = [
    { id: "photo-1525507119028-ed4c629a60a3", codigo: "K01" },
    { id: "photo-1532453288672-3a27e9be9efd", codigo: "K02" },
    { id: "photo-1558769132-cb1aea458c5e", codigo: "K03" },
    { id: "photo-1567401893414-76b7b1e5a7a5", codigo: "K04" }
]

const restante = [
    { id: "photo-1540221652346-e5dd6b50f3e7", codigo: "K05" },
    { id: "photo-1490481651871-ab68de25d43d", codigo: "K06" },
    { id: "photo-1603400521630-9f2de124b33b", codigo: "K07" },
    { id: "photo-1555529771-835f59fc5efe",  codigo: "K08" }
]

function pedir(codigo: string) {
    if (zap === "#") return "#"
    const msg = encodeURIComponent(`Oi Karolinny! Tenho interesse no item ${codigo}`)
    return `${zap}?text=${msg}`
}
</script>

<template>
    <div class="karolinny min-h-dvh bg-[#EFE7DA] text-[#2A211B]">
        <div class="mx-auto w-full max-w-[540px] pb-16 pt-8">

            <!--  Marca  —  logo grande e centralizada, ocupando bem a largura
                  do container. E wordmark, entao horizontal fica melhor que
                  cortado em avatar.  -->
            <header class="px-5">
                <img
                    src="/karolinny/logo.png"
                    alt="By Karolinny — Moda Feminina"
                    class="sobe mx-auto h-auto w-full max-w-[420px]"
                >

                <div class="sobe mt-6 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1" style="--atraso:40ms">
                    <h1 class="text-[19px] font-semibold leading-tight text-[#2A211B]">
                        Coleção nova toda semana
                    </h1>
                    <a
                        :href="`https://instagram.com/${arroba}`"
                        target="_blank"
                        rel="noopener"
                        class="shrink-0 text-[12px] text-[#8B7B67] hover:text-[#B08968]"
                    >@{{ arroba }}</a>
                </div>

                <p class="sobe mt-2 text-center text-[13.5px] leading-relaxed text-[#7A6E5D]" style="--atraso:70ms">
                    Envio pra todo Brasil · Pix ou cartão em até 6x
                </p>
            </header>

            <!--  Carrossel de destaques.  -->
            <section class="mt-7">
                <h2 class="etiqueta mb-3 px-5 text-[#8B7B67]">
                    Novidades
                </h2>

                <div class="flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <a
                        v-for="(produto, i) in destaques"
                        :key="produto.codigo"
                        :href="pedir(produto.codigo)"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe w-[212px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(42,33,27,0.04)]"
                        :style="`--atraso:${100 + i * 50}ms`"
                    >
                        <div class="aspect-[4/5] w-full bg-[#E5DDCC]">
                            <img
                                :src="foto(produto.id, 600, 750)"
                                :alt="`Peça ${produto.codigo}`"
                                loading="lazy"
                                class="h-full w-full object-cover"
                            >
                        </div>
                        <div class="flex items-center justify-between p-3.5">
                            <p class="text-[13px] tracking-wide text-[#8B7B67]">
                                {{ produto.codigo }}
                            </p>
                            <p class="text-[12px] font-medium text-[#2A211B]">
                                Ver preço →
                            </p>
                        </div>
                    </a>
                </div>
            </section>

            <!--  Os dois botoes de conversa. WhatsApp = comprar agora,
                  Grupo VIP = ficar por dentro. WhatsApp fica em cima porque
                  quem chega ja quer falar.  -->
            <div class="mt-5 space-y-2.5 px-5">
                <a
                    :href="zap"
                    target="_blank"
                    rel="noopener"
                    class="botao sobe flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2A211B] py-3.5 text-[15px] font-semibold text-white"
                    style="--atraso:300ms"
                >
                    <UIcon name="i-fa6-brands-whatsapp" class="text-lg text-[#25D366]" />
                    Falar no WhatsApp
                </a>

                <a
                    :href="grupoVip"
                    target="_blank"
                    rel="noopener"
                    class="botao sobe flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#2A211B]/25 bg-white/60 py-3.5 text-[15px] font-semibold text-[#2A211B] backdrop-blur"
                    style="--atraso:340ms"
                >
                    <UIcon name="i-fa6-solid-star" class="text-sm text-[#B08968]" />
                    Grupo VIP — novidades primeiro
                </a>
            </div>

            <!--  Lista compacta  —  o resto do catalogo.  -->
            <section class="mt-9 px-5">
                <h2 class="etiqueta mb-3 text-[#8B7B67]">
                    Coleção completa
                </h2>

                <div class="space-y-2.5">
                    <a
                        v-for="(produto, i) in restante"
                        :key="produto.codigo"
                        :href="pedir(produto.codigo)"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(42,33,27,0.04)]"
                        :style="`--atraso:${i * 40}ms`"
                    >
                        <div class="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-[#E5DDCC]">
                            <img
                                :src="foto(produto.id, 124, 124)"
                                :alt="`Peça ${produto.codigo}`"
                                loading="lazy"
                                class="h-full w-full object-cover"
                            >
                        </div>

                        <div class="min-w-0 grow">
                            <p class="text-[15px] font-semibold text-[#2A211B]">
                                Peça {{ produto.codigo }}
                            </p>
                            <p class="mt-0.5 text-[12.5px] text-[#8B7B67]">
                                Ver preço no WhatsApp
                            </p>
                        </div>

                        <UIcon name="i-fa6-solid-chevron-right" class="text-xs text-[#8B7B67]/50" />
                    </a>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.karolinny { font-family: "Poppins", ui-sans-serif, system-ui, sans-serif }
</style>
