export default defineNuxtConfig({
    modules: [
        "@nuxt/eslint",
        "@nuxt/ui"
    ],

    devtools: { enabled: true },

    css: [ "~/assets/css/main.css" ],

    /*  A marca e escura por definicao: o logo e laranja sobre preto.  */
    colorMode: {
        preference: "dark",
        fallback: "dark"
    },

    runtimeConfig: {
        public: {
            /*  Chave publicavel, nunca a service role. A autorizacao vive
                nas politicas de RLS do banco, nao no cliente.  */
            supabaseUrl:   process.env.SUPABASE_URL || "",
            supabaseChave: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ""
        }
    },

    app: {
        head: {
            htmlAttrs: { lang: "pt-BR" },
            meta: [
                { name: "viewport", content: "width=device-width, initial-scale=1" },
                { name: "theme-color", content: "#0B0B0D" }
            ]
        }
    },

    /*  O catalogo muda quando a dona edita, entao a home e renderizada no
        servidor a cada visita  —  nada de prerender aqui.

        O painel sai do indice pelo cabecalho X-Robots-Tag, que e o recurso
        nativo do Nitro: `robots: false` viria do modulo @nuxtjs/robots,
        que nao esta instalado.  */
    routeRules: {
        "/admin/**": { headers: { "x-robots-tag": "noindex, nofollow" } }
    },

    compatibilityDate: "2026-06-30",

    eslint: {
        config: {
            stylistic: {
                commaDangle: "never",
                braceStyle: "1tbs",
                indent: 4,
                quotes: "double",
                semi: false
            }
        }
    }
})
