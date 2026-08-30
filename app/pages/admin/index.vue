<script setup lang="ts">
import type { Produto, Perfil } from "~/types/loja"

/*  ==========================================================================
    PAINEL DA LOJA

    Tudo aqui roda no navegador com a sessao da dona. Nao ha rota de API
    propria: a autorizacao vive nas politicas de RLS do banco, entao um
    endpoint intermediario so acrescentaria superficie sem acrescentar
    seguranca.
    ==========================================================================  */

definePageMeta({ layout: false, middleware: "autenticado" })

const supabase = useSupabase()
const rota = useRouter()
const toast = useToast()

const produtos = ref<Produto[]>([])
const perfil = ref<Perfil | null>(null)
const carregando = ref(true)

/*  Formulario  —  o mesmo serve para criar e para editar.  */
const aberto = ref(false)
const perfilAberto = ref(false)
const salvando = ref(false)
const editando = ref<Produto | null>(null)

const form = reactive({
    nome:      "",
    descricao: "",
    preco:     "",
    ativo:     true,
    imagem:    null as File | null,
    imagemUrl: "" as string
})

async function carregar() {
    carregando.value = true

    const [ p, l ] = await Promise.all([
        supabase.from("produtos").select("*").order("ordem").order("criado_em", { ascending: false }),
        supabase.from("perfil").select("*").eq("id", 1).single()
    ])

    produtos.value = (p.data ?? []) as Produto[]
    perfil.value = l.data as Perfil | null
    carregando.value = false
}

onMounted(carregar)

function novo() {
    editando.value = null
    Object.assign(form, { nome: "", descricao: "", preco: "", ativo: true, imagem: null, imagemUrl: "" })
    aberto.value = true
}

function editar(produto: Produto) {
    editando.value = produto
    Object.assign(form, {
        nome:      produto.nome,
        descricao: produto.descricao ?? "",
        preco:     (produto.preco / 100).toFixed(2).replace(".", ","),
        ativo:     produto.ativo,
        imagem:    null,
        imagemUrl: produto.imagem_url ?? ""
    })
    aberto.value = true
}

function escolherArquivo(evento: Event) {
    const arquivo = (evento.target as HTMLInputElement).files?.[0]

    if (!arquivo) return

    form.imagem = arquivo
    form.imagemUrl = URL.createObjectURL(arquivo)
}

/*  Nome de arquivo previsivel e sem acento: o Storage rejeita alguns
    caracteres e o nome original vem do celular, imprevisivel.  */
function nomeArquivo(arquivo: File): string {
    const extensao = arquivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"

    return `${crypto.randomUUID()}.${extensao}`
}

async function salvar() {
    if (!form.nome.trim()) {
        toast.add({ title: "Dê um nome ao produto.", color: "error" })

        return
    }

    const centavos = paraCentavos(form.preco)

    if (centavos <= 0) {
        toast.add({ title: "Informe um preço válido.", color: "error" })

        return
    }

    salvando.value = true

    let imagemUrl = editando.value?.imagem_url ?? null

    if (form.imagem) {
        const caminho = nomeArquivo(form.imagem)
        const { error } = await supabase.storage.from("produtos").upload(caminho, form.imagem, { upsert: true })

        if (error) {
            salvando.value = false
            toast.add({ title: "Não deu para enviar a foto.", description: error.message, color: "error" })

            return
        }

        imagemUrl = supabase.storage.from("produtos").getPublicUrl(caminho).data.publicUrl
    }

    const registro = {
        nome:       form.nome.trim(),
        descricao:  form.descricao.trim() || null,
        preco:      centavos,
        ativo:      form.ativo,
        imagem_url: imagemUrl
    }

    const { error } = editando.value
        ? await supabase.from("produtos").update(registro).eq("id", editando.value.id)
        : await supabase.from("produtos").insert({ ...registro, ordem: produtos.value.length + 1 })

    salvando.value = false

    if (error) {
        toast.add({ title: "Não deu para salvar.", description: error.message, color: "error" })

        return
    }

    aberto.value = false
    toast.add({ title: editando.value ? "Produto atualizado." : "Produto publicado.", color: "success" })
    await carregar()
}

async function alternar(produto: Produto) {
    const { error } = await supabase.from("produtos").update({ ativo: !produto.ativo }).eq("id", produto.id)

    if (error) {
        toast.add({ title: "Não deu para alterar.", description: error.message, color: "error" })

        return
    }

    await carregar()
}

async function remover(produto: Produto) {
    if (!confirm(`Apagar "${produto.nome}"? Isso não volta atrás.`)) return

    const { error } = await supabase.from("produtos").delete().eq("id", produto.id)

    if (error) {
        toast.add({ title: "Não deu para apagar.", description: error.message, color: "error" })

        return
    }

    toast.add({ title: "Produto apagado.", color: "success" })
    await carregar()
}

async function sair() {
    await supabase.auth.signOut()
    rota.push("/admin/login")
}
</script>

<template>
    <div class="min-h-dvh bg-tinta">
        <header class="sticky top-0 z-40 border-b border-risco bg-tinta/95 backdrop-blur">
            <div class="mx-auto flex max-w-[720px] items-center justify-between gap-4 px-5 py-4">
                <div>
                    <p class="marca text-[19px] leading-none">
                        {{ perfil?.nome ?? "Loja" }}
                    </p>
                    <p class="mt-1 text-[12px] text-cinza">
                        Painel do catálogo
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <button
                        class="botao rounded-xl border border-risco px-3.5 py-2.5 text-[13px] text-cinza"
                        @click="perfilAberto = true"
                    >
                        Dados da loja
                    </button>

                    <NuxtLink
                        to="/"
                        target="_blank"
                        class="botao rounded-xl border border-risco px-3.5 py-2.5 text-[13px] text-cinza"
                    >
                        Ver loja
                    </NuxtLink>

                    <button
                        class="botao rounded-xl border border-risco px-3.5 py-2.5 text-[13px] text-cinza"
                        @click="sair"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>

        <main class="mx-auto max-w-[720px] px-5 py-6">

            <button
                class="botao flex w-full items-center justify-center gap-2.5 rounded-2xl bg-fogo-500 py-4 text-[15px] font-bold text-black"
                @click="novo"
            >
                <UIcon name="i-fa6-solid-plus" />
                Cadastrar produto
            </button>

            <p v-if="carregando" class="mt-8 text-center text-[14px] text-cinza">
                Carregando…
            </p>

            <p v-else-if="!produtos.length" class="mt-8 rounded-2xl border border-risco bg-papel px-5 py-10 text-center text-[14.5px] text-cinza">
                Nenhum produto ainda. Cadastre o primeiro acima.
            </p>

            <ul v-else class="mt-5 space-y-3">
                <li
                    v-for="produto in produtos"
                    :key="produto.id"
                    class="flex gap-3.5 rounded-2xl border border-risco bg-papel p-3"
                    :class="!produto.ativo && 'opacity-55'"
                >
                    <div class="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-papel">
                        <img
                            v-if="produto.imagem_url"
                            :src="produto.imagem_url"
                            :alt="produto.nome"
                            width="72"
                            height="72"
                            class="h-full w-full object-cover"
                        >
                        <span v-else class="grid h-full w-full place-items-center">
                            <UIcon name="i-fa6-solid-box" class="text-lg text-risco" />
                        </span>
                    </div>

                    <div class="min-w-0 grow">
                        <p class="truncate text-[15px] font-semibold text-white">
                            {{ produto.nome }}
                        </p>
                        <p class="marca text-[15px]">
                            {{ emReais(produto.preco) }}
                        </p>
                        <p v-if="!produto.ativo" class="mt-0.5 text-[12px] text-cinza">
                            Oculto na loja
                        </p>
                    </div>

                    <div class="flex shrink-0 flex-col justify-center gap-1.5">
                        <button
                            class="botao rounded-lg border border-risco px-3 py-1.5 text-[12px] text-cinza"
                            @click="editar(produto)"
                        >
                            Editar
                        </button>
                        <button
                            class="botao rounded-lg border border-risco px-3 py-1.5 text-[12px] text-cinza"
                            @click="alternar(produto)"
                        >
                            {{ produto.ativo ? "Ocultar" : "Mostrar" }}
                        </button>
                        <button
                            class="botao rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] text-red-400"
                            @click="remover(produto)"
                        >
                            Apagar
                        </button>
                    </div>
                </li>
            </ul>
        </main>

        <EditorPerfil v-model:open="perfilAberto" :perfil="perfil" @salvo="carregar" />

        <!--  Formulario do produto  -->
        <UModal v-model:open="aberto" :title="editando ? 'Editar produto' : 'Cadastrar produto'">
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Nome do produto" size="xl">
                        <UInput v-model="form.nome" placeholder="AirPods 3 PRO" class="w-full" />
                    </UFormField>

                    <UFormField label="Preço" size="xl" hint="em reais">
                        <UInput v-model="form.preco" inputmode="decimal" placeholder="199,99" class="w-full" />
                    </UFormField>

                    <UFormField label="Descrição" size="xl" hint="opcional">
                        <UTextarea
                            v-model="form.descricao"
                            :rows="2"
                            placeholder="Som puro, graves potentes e cancelamento de ruído."
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField label="Foto" size="xl">
                        <div class="flex items-center gap-3">
                            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-papel">
                                <img
                                    v-if="form.imagemUrl"
                                    :src="form.imagemUrl"
                                    alt=""
                                    class="h-full w-full object-cover"
                                >
                                <span v-else class="grid h-full w-full place-items-center">
                                    <UIcon name="i-fa6-solid-camera" class="text-lg text-risco" />
                                </span>
                            </div>

                            <label class="botao cursor-pointer rounded-xl border border-risco px-4 py-2.5 text-[13.5px] text-cinza">
                                Escolher foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="escolherArquivo"
                                >
                            </label>
                        </div>
                    </UFormField>

                    <label class="flex items-center gap-3 text-[14.5px] text-white">
                        <UCheckbox v-model="form.ativo" />
                        Mostrar na loja
                    </label>
                </div>
            </template>

            <template #footer>
                <div class="flex w-full gap-3">
                    <button
                        class="botao flex-1 rounded-xl border border-risco py-3 text-[14px] text-cinza"
                        @click="aberto = false"
                    >
                        Cancelar
                    </button>
                    <button
                        :disabled="salvando"
                        class="botao flex flex-[1.6] items-center justify-center gap-2 rounded-xl bg-fogo-500 py-3 text-[14px] font-bold text-black disabled:opacity-60"
                        @click="salvar"
                    >
                        <UIcon v-if="salvando" name="i-fa6-solid-circle-notch" class="animate-spin" />
                        {{ salvando ? "Salvando…" : "Salvar" }}
                    </button>
                </div>
            </template>
        </UModal>
    </div>
</template>
