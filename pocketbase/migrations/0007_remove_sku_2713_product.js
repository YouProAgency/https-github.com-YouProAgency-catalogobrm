migrate(
  (app) => {
    // Remove o produto específico com SKU '2713' (Balflex Supersteam vermelha descontinuada/não catalogável)
    // conforme solicitação de remoção permanente do catálogo BR Mangueiras.
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE TRIM(COALESCE(sku, '')) = '2713' OR id = 'r75d0uxw5ias381'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para produto removido por solicitação do usuário
  },
)
