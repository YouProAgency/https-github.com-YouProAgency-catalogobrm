migrate(
  (app) => {
    // Atualiza a descrição/nome e marca do produto SKU 3273
    // Solicitação do usuário:
    // Nome / Descrição: MANGUEIRA R14 5/16" TEFLON 1.520 PSI
    // Marca: Korax
    const targetName = 'MANGUEIRA R14 5/16" TEFLON 1.520 PSI'
    const targetBrand = 'Korax'

    app
      .db()
      .newQuery(
        `UPDATE products
         SET name = {:name},
             description = {:name},
             brand = {:brand}
         WHERE TRIM(COALESCE(sku, '')) = '3273' OR id = 'iqk9alm5wmp1izx'`,
      )
      .bind({ name: targetName, brand: targetBrand })
      .execute()
  },
  (app) => {
    // Reversão para os valores anteriores
    const prevName = 'MANGUEIRA R14 5/16" TEFLON'
    const prevBrand = ''
    app
      .db()
      .newQuery(
        `UPDATE products
         SET name = {:name},
             description = '',
             brand = {:brand}
         WHERE TRIM(COALESCE(sku, '')) = '3273' OR id = 'iqk9alm5wmp1izx'`,
      )
      .bind({ name: prevName, brand: prevBrand })
      .execute()
  },
)
