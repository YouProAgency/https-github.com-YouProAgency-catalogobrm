migrate(
  (app) => {
    // Remove o produto específico com SKU '1637' ("MANGUEIRA R2 2" 80 BAR / 1160 PSI", id: 1uuqtcep7bvvvfy)
    // conforme solicitação de remoção permanente do catálogo BR Mangueiras.
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE TRIM(COALESCE(sku, '')) = '1637' OR id = '1uuqtcep7bvvvfy'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para produto removido por solicitação do usuário
  },
)
