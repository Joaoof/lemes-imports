import type { Produto, Perfil } from "~/types/loja"

/*  ==========================================================================
    DADOS DA VITRINE

    Compartilhado pelas versoes de layout: todas leem o mesmo catalogo, o
    que muda entre elas e so a apresentacao.
    ==========================================================================  */

/*  Nao e async de proposito.

    Um `await` aqui dentro derruba o contexto do Nuxt para tudo que vem
    depois dele  —  e `useSeoMeta` entao falha com e1001. O top-level await
    de um <script setup> nao tem esse problema porque o compilador
    restaura o contexto; um composable comum, sim.

    O useAsyncData ja bloqueia o SSR sozinho, entao aguardar aqui nao
    acrescentaria nada.  */
export function useVitrine(chave: string) {
    const supabase = useSupabase()

    const { data } = useAsyncData(chave, async () => {
        const [ perfil, produtos ] = await Promise.all([
            supabase.from("perfil").select("*").eq("id", 1).single(),
            supabase.from("produtos").select("*").eq("ativo", true).order("ordem").order("criado_em", { ascending: false })
        ])

        return {
            perfil:   perfil.data as Perfil | null,
            produtos: (produtos.data ?? []) as Produto[]
        }
    })

    const perfil = computed(() => data.value?.perfil ?? null)
    const produtos = computed(() => data.value?.produtos ?? [])

    /*  A mensagem ja vai escrita com nome e preco: a dona recebe o pedido
        identificado, sem precisar perguntar "qual produto?".  */
    function pedir(produto: Produto): string {
        if (!perfil.value) return "#"

        return linkWhatsapp(
            perfil.value.whatsapp,
            `Olá! Tenho interesse no ${produto.nome} — ${emReais(produto.preco)}. Ainda tem?`
        )
    }

    const conversa = computed(() => perfil.value
        ? linkWhatsapp(perfil.value.whatsapp, "Olá! Vim pelo link da bio.")
        : "#")

    const titulo = computed(() => perfil.value ? `${perfil.value.nome} — ${perfil.value.chamada}` : "Catálogo")

    useSeoMeta({
        title: titulo,
        description: () => perfil.value?.bio.join(" · ") ?? "",
        ogTitle: titulo,
        ogDescription: () => perfil.value?.bio.join(" · ") ?? "",
        ogType: "website",
        ogLocale: "pt_BR"
    })

    return { perfil, produtos, pedir, conversa }
}
