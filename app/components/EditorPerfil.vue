<script setup lang="ts">
import type { Perfil } from "~/types/loja"

/*  Editor dos dados da loja. Existe para a dona nao depender de ninguem
    para trocar logo, numero de WhatsApp ou o texto da bio  —  que e
    justamente o que mais muda numa loja pequena.  */

const props = defineProps<{ perfil: Perfil | null }>()
const emit = defineEmits<{ salvo: [] }>()

const supabase = useSupabase()
const toast = useToast()

const aberto = defineModel<boolean>("open", { default: false })
const salvando = ref(false)

const form = reactive({
    nome:      "",
    arroba:    "",
    chamada:   "",
    bio:       "",
    whatsapp:  "",
    instagram: "",
    logo:      null as File | null,
    logoUrl:   ""
})

/*  Recarrega os campos toda vez que o modal abre: sem isso ele guardaria
    o que foi digitado e descartado numa edicao anterior.  */
watch(aberto, (estaAberto) => {
    if (!estaAberto || !props.perfil) return

    Object.assign(form, {
        nome:      props.perfil.nome,
        arroba:    props.perfil.arroba,
        chamada:   props.perfil.chamada,
        bio:       props.perfil.bio.join("\n"),
        whatsapp:  props.perfil.whatsapp,
        instagram: props.perfil.instagram,
        logo:      null,
        logoUrl:   props.perfil.logo_url ?? ""
    })
})

function escolherLogo(evento: Event) {
    const arquivo = (evento.target as HTMLInputElement).files?.[0]

    if (!arquivo) return

    form.logo = arquivo
    form.logoUrl = URL.createObjectURL(arquivo)
}

async function salvar() {
    const numero = form.whatsapp.replace(/\D/g, "")

    /*  wa.me exige o numero completo com pais e DDD. Menos que isso gera
        um link que abre o WhatsApp e nao encontra ninguem.  */
    if (numero.length < 12) {
        toast.add({ title: "WhatsApp incompleto.", description: "Use 55 + DDD + número, só dígitos.", color: "error" })

        return
    }

    salvando.value = true

    let logoUrl = props.perfil?.logo_url ?? null

    if (form.logo) {
        const extensao = form.logo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png"
        const caminho = `logo-${crypto.randomUUID()}.${extensao}`

        const { error } = await supabase.storage.from("produtos").upload(caminho, form.logo, { upsert: true })

        if (error) {
            salvando.value = false
            toast.add({ title: "Não deu para enviar a logo.", description: error.message, color: "error" })

            return
        }

        logoUrl = supabase.storage.from("produtos").getPublicUrl(caminho).data.publicUrl
    }

    const { error } = await supabase.from("perfil").update({
        nome:      form.nome.trim(),
        arroba:    form.arroba.trim().replace(/^@/, ""),
        chamada:   form.chamada.trim(),
        bio:       form.bio.split("\n").map((l) => l.trim()).filter(Boolean),
        whatsapp:  numero,
        instagram: form.instagram.trim(),
        logo_url:  logoUrl
    }).eq("id", 1)

    salvando.value = false

    if (error) {
        toast.add({ title: "Não deu para salvar.", description: error.message, color: "error" })

        return
    }

    aberto.value = false
    toast.add({ title: "Dados da loja atualizados.", color: "success" })
    emit("salvo")
}
</script>

<template>
    <UModal v-model:open="aberto" title="Dados da loja">
        <template #body>
            <div class="space-y-4">
                <UFormField label="Logo" size="xl">
                    <div class="flex items-center gap-3">
                        <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-papel ring-1 ring-risco">
                            <img v-if="form.logoUrl" :src="form.logoUrl" alt="" class="h-full w-full object-cover">
                            <span v-else class="grid h-full w-full place-items-center">
                                <UIcon name="i-fa6-solid-image" class="text-base text-risco" />
                            </span>
                        </div>

                        <label class="botao cursor-pointer rounded-xl border border-risco px-4 py-2.5 text-[13.5px] text-cinza">
                            Escolher imagem
                            <input type="file" accept="image/*" class="hidden" @change="escolherLogo">
                        </label>
                    </div>
                </UFormField>

                <UFormField label="Nome da loja" size="xl">
                    <UInput v-model="form.nome" class="w-full" />
                </UFormField>

                <UFormField label="Usuário do Instagram" size="xl" hint="sem o @">
                    <UInput v-model="form.arroba" class="w-full" />
                </UFormField>

                <UFormField label="Frase principal" size="xl">
                    <UInput v-model="form.chamada" placeholder="iPhones 100% americanos" class="w-full" />
                </UFormField>

                <UFormField label="Bio" size="xl" hint="uma linha por item">
                    <UTextarea v-model="form.bio" :rows="3" class="w-full" />
                </UFormField>

                <UFormField label="WhatsApp" size="xl" hint="55 + DDD + número">
                    <UInput v-model="form.whatsapp" inputmode="numeric" placeholder="5563992981463" class="w-full" />
                </UFormField>

                <UFormField label="Link do Instagram" size="xl">
                    <UInput v-model="form.instagram" class="w-full" />
                </UFormField>
            </div>
        </template>

        <template #footer>
            <div class="flex w-full gap-3">
                <button class="botao flex-1 rounded-xl border border-risco py-3 text-[14px] text-cinza" @click="aberto = false">
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
</template>
