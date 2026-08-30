<script setup lang="ts">
/*  Link na bio da Karolinny  —  moda feminina.

    Sem catalogo aqui ate ela mandar as fotos reais das pecas: um grid de
    mockup gritaria template. A pagina fica com o essencial  —  logo, dois
    caminhos de conversa  —  e ganha catalogo quando tiver o que mostrar.  */

useHead({
    title: "By Karolinny",
    meta: [
        { name: "theme-color", content: "#E9E4DC" }
    ]
})

useColorMode().preference = "light"

const zap = "#"
const grupoVip = "#"
</script>

<template>
    <div class="min-h-dvh bg-[#E9E4DC] text-[#111]">
        <div class="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-between px-6 pb-10 pt-16">

            <div>
                <!--  Logo em multiply para o fundo cinza-claro dela sumir
                      contra o bege da pagina.  -->
                <img
                    src="/karolinny/logo.jpeg"
                    alt="By Karolinny"
                    class="sobe mx-auto h-auto w-full max-w-[300px] mix-blend-multiply"
                >

                <div class="mt-14 space-y-3">
                    <a
                        :href="zap"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe flex items-center justify-between rounded-full border border-[#111] bg-[#111] px-6 py-4 text-[14.5px] tracking-wide text-white"
                        style="--atraso:120ms"
                    >
                        <span>Falar com a Karolinny</span>
                        <UIcon name="i-fa6-brands-whatsapp" class="text-lg text-[#25D366]" />
                    </a>

                    <a
                        :href="grupoVip"
                        target="_blank"
                        rel="noopener"
                        class="botao sobe flex items-center justify-between rounded-full border border-[#111]/25 bg-transparent px-6 py-4 text-[14.5px] tracking-wide text-[#111]"
                        style="--atraso:180ms"
                    >
                        <span>Novidades primeiro no grupo</span>
                        <UIcon name="i-fa6-solid-arrow-right" class="text-sm" />
                    </a>
                </div>
            </div>

            <p class="sobe pt-10 text-center text-[11px] uppercase tracking-[0.22em] text-[#111]/40" style="--atraso:400ms">
                @by.karolinny
            </p>
        </div>
    </div>
</template>
