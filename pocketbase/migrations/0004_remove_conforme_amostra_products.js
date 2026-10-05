migrate(
  (app) => {
    // Remove registros que contenham 'conforme amostra' (case-insensitive via LOWER no SQLite)
    // na descrição, nome ou unidade
    app
      .db()
      .newQuery(
        `DELETE FROM products 
         WHERE LOWER(COALESCE(name, '')) LIKE '%conforme amostra%' 
            OR LOWER(COALESCE(description, '')) LIKE '%conforme amostra%'
            OR LOWER(COALESCE(unit, '')) LIKE '%conforme amostra%'`,
      )
      .execute()
  },
  (app) => {
    // Reversão não necessária para limpeza de registros sob encomenda/físicos
  },
)
