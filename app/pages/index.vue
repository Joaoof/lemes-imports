<script setup lang="ts">
/*  ==========================================================================
    LINK NA BIO  —  PRATELEIRA

    Abre do Instagram, no celular, muitas vezes em rede ruim.

    O carrossel vem antes de tudo o que nao e a marca: assim a cliente ve
    produto sem rolar, que e o unico jeito de competir com a vontade de
    voltar para o feed. O resto do catalogo desce em lista compacta.

    Toda venda termina numa conversa, entao cada item abre o WhatsApp com
    nome e preco ja escritos.
    ==========================================================================  */

const { perfil, produtos, pedir, conversa } = useVitrine("vitrine")

const destaques = computed(() => produtos.value.slice(0, 4))
const restante = computed(() => produtos.value.slice(4))
</script>

<template>
    <div class="min-h-dvh bg-tinta">
        <div class="mx-auto w-full max-w-[540px] pb-16 pt-8">

            <!--  Marca  —  o wordmark ocupa a largura que precisa. Espremido
                  num quadrado ele fica ilegivel no celular.  -->
            <header class="px-5">
                <img
                    v-if="perfil?.logo_url"
                    :src="perfil.logo_url"
                    :alt="perfil.nome"
                    class="sobe h-11 w-auto max-w-[210px] object-contain object-left"
                >
                <p v-else class="marca text-[26px] leading-none">
                    {{ perfil?.nome }}
                </p>

                <div class="sobe mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1" style="--atraso:40ms">
                    <h1 class="text-[19px] font-semibold leading-tight">
                        {{ perfil?.chamada }}
                    </h1>
                    <a
                        :href="perfil?.instagram"
                        target="_blank"
                        rel="noopener"
                        class="valor shrink-0 text-[12px] text-cinza hover:text-fogo-300"
                    >@{{ perfil?.arroba }}</a>
                </div>

                <p class="sobe mt-2 text-[13.5px] leading-relaxed text-cinza" style="--atraso:70ms">
                    {{ perfil?.bio.join(" · ") }}
                </p>
            </header>

            <!--  Carrossel  -->
            <section v-if="destaques.length" class="mt-7">
                <h2 class="etiqueta mb-3 px-5 text-cinza">
                    Mais procurados
                </h2>

                <!--  snap-mandatory faz cada card parar alinhado, em vez de
                      terminar cortado no meio da tela.

                      scroll-pl-5 e obrigatorio junto: sem ele o snap alinha
                      o primeiro card ao inicio da area de rolagem e engole
                      o padding esquerdo, colando o card na borda da tela.  -->
                <div class="flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <a
                        v-for="(produto, i) in destaques"
                        :key="produto.id"
                        :href="pedir(produto)"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe w-[212px] shrink-0 snap-start overflow-hidden rounded-2xl bg-papel"
                        :style="`--atraso:${100 + i * 50}ms`"
                    >
                        <div class="aspect-[4/3] w-full bg-tinta">
                            <img
                                v-if="produto.imagem_url"
                                :src="produto.imagem_url"
                                :alt="produto.nome"
                                class="h-full w-full object-cover"
                            >
                            <span v-else class="grid h-full w-full place-items-center">
                                <UIcon name="i-fa6-solid-box" class="text-2xl text-risco" />
                            </span>
                        </div>

                        <div class="p-3.5">
                            <p class="line-clamp-1 text-[14px] font-semibold">
                                {{ produto.nome }}
                            </p>
                            <p class="valor mt-1.5 text-[17px] text-fogo-300">
                                {{ emReais(produto.preco) }}
                            </p>
                        </div>
                    </a>
                </div>
            </section>

            <!--  Chamada principal, logo apos o carrossel: quando chega
                  aqui a cliente ja viu produto e preco.  -->
            <div class="mt-5 px-5">
                <a
                    :href="conversa"
                    target="_blank"
                    rel="noopener"
                    class="botao sobe flex w-full items-center justify-center gap-2.5 rounded-xl bg-zap py-3.5 text-[15px] font-bold text-black"
                    style="--atraso:300ms"
                >
                    <UIcon name="i-fa6-brands-whatsapp" class="text-lg" />
                    Chamar no WhatsApp
                </a>
            </div>

            <!--  Restante do catalogo  -->
            <section v-if="restante.length" class="mt-9 px-5">
                <h2 class="etiqueta mb-3 text-cinza">
                    Catálogo completo
                </h2>

                <div class="space-y-2.5">
                    <a
                        v-for="(produto, i) in restante"
                        :key="produto.id"
                        :href="pedir(produto)"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe flex items-center gap-3.5 rounded-2xl bg-papel p-3"
                        :style="`--atraso:${i * 40}ms`"
                    >
                        <div class="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-tinta">
                            <img
                                v-if="produto.imagem_url"
                                :src="produto.imagem_url"
                                :alt="produto.nome"
                                loading="lazy"
                                class="h-full w-full object-cover"
                            >
                            <span v-else class="grid h-full w-full place-items-center">
                                <UIcon name="i-fa6-solid-box" class="text-base text-risco" />
                            </span>
                        </div>

                        <div class="min-w-0 grow">
                            <p class="truncate text-[15px] font-semibold">
                                {{ produto.nome }}
                            </p>
                            <p class="valor mt-1 text-[16px] text-fogo-300">
                                {{ emReais(produto.preco) }}
                            </p>
                        </div>

                        <UIcon name="i-fa6-brands-whatsapp" class="shrink-0 text-lg text-zap" />
                    </a>
                </div>

                <p class="mt-5 text-[12.5px] leading-relaxed text-cinza/70">
                    Toque em qualquer item para pedir. O preço já vai na mensagem.
                </p>
            </section>

            <p v-if="!produtos.length" class="px-5 py-14 text-center text-[15px] text-cinza">
                O catálogo ainda está vazio.
            </p>

            <footer class="mt-12 flex items-center justify-between border-t border-risco px-5 pt-5">
                <p class="valor text-[11px] text-cinza/60">
                    © {{ new Date().getFullYear() }} {{ perfil?.nome }}
                </p>
                <NuxtLink to="/admin" class="valor text-[11px] text-cinza/40 hover:text-fogo-300">
                    Área da loja
                </NuxtLink>
            </footer>
        </div>
    </div>
</template>
