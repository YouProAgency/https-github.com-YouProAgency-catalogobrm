migrate(
  (app) => {
    // Remove o produto específico com SKU '4523' ("MANGUEIRA SAIDA 1,27M TANQUINHO", id: h03nonl70bflkw4)
    // conforme solicitação de remoção permanente do catálogo BR Mangueiras.
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE TRIM(COALESCE(sku, '')) = '4523' OR id = 'h03nonl70bflkw4'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para produto removido por solicitação do usuário
  },
)
