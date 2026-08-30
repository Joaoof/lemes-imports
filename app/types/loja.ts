/*  ==========================================================================
    CONTRATO DE DADOS
    Espelha as tabelas de scripts/schema.sql. Mudou a coluna la, muda aqui.
    ==========================================================================  */

export interface Produto {
    id:         string
    nome:       string
    descricao:  string | null

    /*  Em centavos, como no banco  —  nunca em reais fracionados.  */
    preco:      number
    imagem_url: string | null
    ativo:      boolean
    ordem:      number
    criado_em:  string
}

export interface Perfil {
    id:        number
    nome:      string
    arroba:    string
    chamada:   string
    bio:       string[]
    whatsapp:  string
    instagram: string
    logo_url:  string | null
}
