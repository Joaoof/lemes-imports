<script setup lang="ts">
/*  ==========================================================================
    LINK NA BIO  —  BY KAROLINNY  (MODA FEMININA)

    Mesmo pattern da home da Lemes (header, carrossel de destaques, CTA no
    WhatsApp, lista compacta do catalogo), mas em paleta cream + tipografia
    serifada pra bater com a marca. Botao de Grupo VIP entra ao lado do
    WhatsApp: sao os dois caminhos de conversa.

    Ainda sem dados reais: os slots de produto ficam neutros (sem foto
    escrita) ate a Karolinny mandar as fotos e precos. Trocar tambem `zap`
    e `grupoVip` pelos links reais.
    ==========================================================================  */

useHead({
    title: "By Karolinny — Moda Feminina",
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" }
    ],
    meta: [
        { name: "description", content: "By Karolinny — moda feminina, peças novas toda semana. Compre pelo WhatsApp." },
        { name: "theme-color", content: "#EFE7DA" }
    ]
})

useColorMode().preference = "light"

/*  Placeholders  —  a Karolinny troca pelos links reais dela.  */
const zap = "#"
const grupoVip = "#"
const arroba = "by.karolinny"

/*  Slots vazios ate ter foto e preco reais. 4 destaques + 4 no catalogo
    completo (o mesmo split que a home da Lemes usa).  */
const destaques = Array.from({ length: 4 }, (_, i) => ({ id: `d${i}` }))
const restante  = Array.from({ length: 4 }, (_, i) => ({ id: `r${i}` }))
</script>

<template>
    <div class="karolinny min-h-dvh bg-[#EFE7DA] text-[#2A211B]">
        <div class="mx-auto w-full max-w-[540px] pb-16 pt-8">

            <!--  Marca  -->
            <header class="px-5">
                <img
                    src="/karolinny/logo.png"
                    alt="By Karolinny — Moda Feminina"
                    class="sobe h-16 w-auto max-w-[260px] object-contain object-left"
                >

                <div class="sobe mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1" style="--atraso:40ms">
                    <h1 class="text-[19px] font-serif-display leading-tight text-[#2A211B]">
                        Coleção nova toda semana
                    </h1>
                    <a
                        :href="`https://instagram.com/${arroba}`"
                        target="_blank"
                        rel="noopener"
                        class="shrink-0 text-[12px] text-[#8B7B67] hover:text-[#B08968]"
                    >@{{ arroba }}</a>
                </div>

                <p class="sobe mt-2 text-[13.5px] leading-relaxed text-[#7A6E5D]" style="--atraso:70ms">
                    Envio pra todo Brasil · Pix ou cartão em até 6x
                </p>
            </header>

            <!--  Carrossel de destaques. Snap horizontal igual a Lemes.  -->
            <section v-if="destaques.length" class="mt-7">
                <h2 class="etiqueta mb-3 px-5 text-[#8B7B67]">
                    Novidades
                </h2>

                <div class="flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div
                        v-for="(produto, i) in destaques"
                        :key="produto.id"
                        class="botao sobe w-[212px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(42,33,27,0.04)]"
                        :style="`--atraso:${100 + i * 50}ms`"
                    >
                        <div class="aspect-[4/5] w-full bg-[#E5DDCC] grid place-items-center">
                            <UIcon name="i-fa6-solid-shirt" class="text-3xl text-[#C9A96E]/50" />
                        </div>
                        <div class="p-3.5">
                            <p class="line-clamp-1 text-[13.5px] font-medium text-[#2A211B]/80">
                                em breve
                            </p>
                            <p class="mt-1 text-[13px] font-serif-display italic text-[#B08968]">
                                fotos chegando
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!--  Os dois caminhos de conversa. WhatsApp direto = o botao
                  primario (quem chega ja quer comprar). Grupo VIP = escala
                  de retorno (novidade, promocao). Empilhados: quem so quer
                  falar nao precisa procurar entre outros CTAs.  -->
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

            <!--  Lista compacta  —  o restante do catalogo. Formato horizontal
                  ganha densidade sem virar grid.  -->
            <section v-if="restante.length" class="mt-9 px-5">
                <h2 class="etiqueta mb-3 text-[#8B7B67]">
                    Coleção completa
                </h2>

                <div class="space-y-2.5">
                    <div
                        v-for="(produto, i) in restante"
                        :key="produto.id"
                        class="botao sobe flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(42,33,27,0.04)]"
                        :style="`--atraso:${i * 40}ms`"
                    >
                        <div class="grid h-[62px] w-[62px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#E5DDCC]">
                            <UIcon name="i-fa6-solid-shirt" class="text-lg text-[#C9A96E]/60" />
                        </div>

                        <div class="min-w-0 grow">
                            <p class="truncate text-[15px] font-medium text-[#2A211B]/80">
                                em breve
                            </p>
                            <p class="mt-1 text-[13px] font-serif-display italic text-[#B08968]">
                                fotos chegando
                            </p>
                        </div>

                        <UIcon name="i-fa6-solid-chevron-right" class="text-xs text-[#8B7B67]/40" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.karolinny { font-family: "Inter", ui-sans-serif, system-ui, sans-serif }
.font-serif-display { font-family: "Cormorant Garamond", ui-serif, Georgia, serif }
</style>
