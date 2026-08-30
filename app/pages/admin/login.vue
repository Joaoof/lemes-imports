<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui"

definePageMeta({ layout: false })

const supabase = useSupabase()
const rota = useRouter()

const estado = reactive({ email: "", senha: "" })
const enviando = ref(false)
const erro = ref("")

function valida(dados: typeof estado): FormError[] {
    const erros: FormError[] = []

    if (!dados.email.includes("@")) erros.push({ name: "email", message: "Digite o e-mail cadastrado." })
    if (dados.senha.length < 6)     erros.push({ name: "senha", message: "A senha tem pelo menos 6 caracteres." })

    return erros
}

async function entrar(evento: FormSubmitEvent<typeof estado>) {
    enviando.value = true
    erro.value = ""

    const { error } = await supabase.auth.signInWithPassword({
        email: evento.data.email.trim(),
        password: evento.data.senha
    })

    enviando.value = false

    if (error) {
        /*  A mensagem do Supabase vem em ingles e generica de proposito
            (nao revela se o e-mail existe). Traduzida, mantendo o mesmo
            cuidado de nao entregar essa informacao.  */
        erro.value = "E-mail ou senha não conferem."

        return
    }

    rota.push("/admin")
}
</script>

<template>
    <div class="grid min-h-dvh place-items-center bg-tinta px-5">
        <div class="w-full max-w-[380px]">
            <h1 class="marca text-center text-[30px]">
                Área da loja
            </h1>
            <p class="mt-2 text-center text-[14.5px] text-cinza">
                Entre para gerenciar o catálogo.
            </p>

            <UForm
                :state="estado"
                :validate="valida"
                :validate-on="[ 'blur' ]"
                class="mt-8 space-y-4 rounded-2xl border border-risco bg-papel p-6"
                @submit="entrar"
            >
                <UFormField label="E-mail" name="email" size="xl">
                    <UInput
                        v-model="estado.email"
                        type="email"
                        autocomplete="email"
                        placeholder="voce@exemplo.com"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Senha" name="senha" size="xl">
                    <UInput
                        v-model="estado.senha"
                        type="password"
                        autocomplete="current-password"
                        placeholder="••••••••"
                        class="w-full"
                    />
                </UFormField>

                <p v-if="erro" role="alert" class="rounded-xl bg-red-500/10 px-4 py-3 text-[13.5px] text-red-400">
                    {{ erro }}
                </p>

                <button
                    type="submit"
                    :disabled="enviando"
                    class="botao flex w-full items-center justify-center gap-2 rounded-xl bg-fogo-500 py-3.5 text-[15px] font-bold text-black disabled:opacity-60"
                >
                    <UIcon v-if="enviando" name="i-fa6-solid-circle-notch" class="animate-spin" />
                    {{ enviando ? "Entrando…" : "Entrar" }}
                </button>
            </UForm>

            <NuxtLink to="/" class="mt-6 block text-center text-[13px] text-cinza hover:text-fogo-400">
                Voltar para a loja
            </NuxtLink>
        </div>
    </div>
</template>
