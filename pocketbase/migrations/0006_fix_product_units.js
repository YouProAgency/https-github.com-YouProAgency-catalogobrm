migrate(
  (app) => {
    // Corrige os registros da coleção products cujo campo 'unit' foi gravado incorretamente
    // com o nome/descrição do produto ou com textos longos que duplicam o produto.
    // Regra da ADV_Produtos_Mangueiras-final.xlsx: Unidade = 'MT' (metro) para a grande maioria das mangueiras.
    // Mangueiras vendidas por metro recebem 'MT'.
    // Caso existam conexões/adaptadores que não sejam vendidos por metro, unit fica vazio ('').

    // 1. Mangueiras cujo unit seja idêntico ou praticamente idêntico ao name, ou unit > 10 caracteres:
    // Se o nome contiver "MANGUEIRA", a unidade correta de venda é 'MT' (metro).
    app
      .db()
      .newQuery(
        `UPDATE products 
         SET unit = 'MT'
         WHERE (
           LOWER(TRIM(COALESCE(unit, ''))) = LOWER(TRIM(COALESCE(name, '')))
           OR LENGTH(TRIM(COALESCE(unit, ''))) > 10
           OR LOWER(TRIM(COALESCE(unit, ''))) = LOWER(TRIM(COALESCE(description, '')))
         )
         AND LOWER(COALESCE(name, '')) LIKE '%mangueira%'`,
      )
      .execute()

    // 2. Para outros produtos (conexões, adaptadores, etc.) que tenham unit duplicado com name ou longo:
    // Deixar sem unidade (vazio)
    app
      .db()
      .newQuery(
        `UPDATE products 
         SET unit = ''
         WHERE (
           LOWER(TRIM(COALESCE(unit, ''))) = LOWER(TRIM(COALESCE(name, '')))
           OR LENGTH(TRIM(COALESCE(unit, ''))) > 10
           OR LOWER(TRIM(COALESCE(unit, ''))) = LOWER(TRIM(COALESCE(description, '')))
         )`,
      )
      .execute()
  },
  (app) => {
    // Reversão não aplicável para limpeza de dados inconsistentes
  },
)
