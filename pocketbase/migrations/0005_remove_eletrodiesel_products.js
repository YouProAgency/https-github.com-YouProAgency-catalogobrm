migrate(
  (app) => {
    // Remove registros da coleção products cuja marca seja 'Eletrodiesel' (case-insensitive via LOWER/TRIM no SQLite)
    // Esses itens são mangueiras personalizáveis vendidas exclusivamente em loja física.
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE LOWER(TRIM(COALESCE(brand, ''))) = 'eletrodiesel'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para limpeza de registros sob encomenda/físicos
  },
)
