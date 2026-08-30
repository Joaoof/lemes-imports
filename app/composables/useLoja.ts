import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/*  ==========================================================================
    CLIENTE SUPABASE

    Uma instancia por contexto. No servidor nao persiste sessao  —  senao
    duas visitas simultaneas dividiriam o mesmo estado de login.
    ==========================================================================  */

let clienteNavegador: SupabaseClient | null = null

export function useSupabase(): SupabaseClient {
    const { supabaseUrl, supabaseChave } = useRuntimeConfig().public

    if (import.meta.server) {
        return createClient(supabaseUrl as string, supabaseChave as string, {
            auth: { persistSession: false, autoRefreshToken: false }
        })
    }

    if (!clienteNavegador) {
        clienteNavegador = createClient(supabaseUrl as string, supabaseChave as string, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
        })
    }

    return clienteNavegador
}

/*  ==========================================================================
    FORMATACAO

    O preco viaja em centavos do banco ate aqui. A conversao para reais
    acontece so na hora de exibir, num lugar so.
    ==========================================================================  */
export function emReais(centavos: number): string {
    return (centavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

/*  Aceita "199,99", "199.99" ou "19999" digitado no painel e devolve
    centavos. A dona nao deveria precisar pensar em centavos.  */
export function paraCentavos(texto: string): number {
    const limpo = texto.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")
    const valor = Number.parseFloat(limpo)

    return Number.isFinite(valor) ? Math.round(valor * 100) : 0
}

/*  ==========================================================================
    LINK DO WHATSAPP
    Toda venda da loja termina numa conversa, entao o link e montado com a
    mensagem ja escrita  —  a cliente so aperta enviar.
    ==========================================================================  */
export function linkWhatsapp(numero: string, mensagem: string): string {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
