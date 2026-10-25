migrate(
  (app) => {
    // Remove o produto específico com SKU '9003' ("MANGUEIRA ATÓXICA 2\" X 5 M NP SMS INOX 304", id: pik603yvu33446s)
    // conforme solicitação de remoção permanente do catálogo BR Mangueiras (item inexistente).
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE TRIM(COALESCE(sku, '')) = '9003' OR id = 'pik603yvu33446s'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para produto removido por solicitação do usuário
  },
)
