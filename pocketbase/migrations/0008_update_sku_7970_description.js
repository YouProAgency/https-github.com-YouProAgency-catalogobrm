migrate(
  (app) => {
    // Atualiza a descrição/nome do produto SKU 7970 da marca Balflex
    // Solicitação do usuário:
    // Nome: MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA
    // Description: MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA
    const targetText = 'MANGUEIRA R5 13/32" BRAKEMASTER 2.100 PSI / 13,8 MPA'

    app
      .db()
      .newQuery(
        `UPDATE products
         SET name = {:text},
             description = {:text}
         WHERE TRIM(COALESCE(sku, '')) = '7970' OR id = '6ynj8dnhlrlohij'`,
      )
      .bind({ text: targetText })
      .execute()
  },
  (app) => {
    // Reversão para a descrição anterior
    const prevText = 'MANGUEIRA R5 13/32"'
    app
      .db()
      .newQuery(
        `UPDATE products
         SET name = {:text},
             description = ''
         WHERE TRIM(COALESCE(sku, '')) = '7970' OR id = '6ynj8dnhlrlohij'`,
      )
      .bind({ text: prevText })
      .execute()
  },
)
