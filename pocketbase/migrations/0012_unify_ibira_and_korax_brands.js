migrate(
  (app) => {
    // Unificação de marcas/fabricantes duplicadas por caixa ou acento:
    // 1. "IBIRA" / "Ibirá" / "Ibira" -> unificado para "IBIRÁ" (todo em maiúsculas com acento)
    // 2. "Korax" / "korax" -> unificado para "KORAX" (todo em maiúsculas)
    //
    // No SQLite do PocketBase, LOWER(brand) cobre ASCII ('ibira', 'korax').
    // Para cobrir com segurança acentos e variações:
    app
      .db()
      .newQuery(
        `UPDATE products
         SET brand = 'IBIRÁ'
         WHERE TRIM(COALESCE(brand, '')) = 'IBIRA'
            OR TRIM(COALESCE(brand, '')) = 'Ibira'
            OR TRIM(COALESCE(brand, '')) = 'Ibirá'
            OR LOWER(TRIM(COALESCE(brand, ''))) = 'ibira'`,
      )
      .execute()

    app
      .db()
      .newQuery(
        `UPDATE products
         SET brand = 'KORAX'
         WHERE TRIM(COALESCE(brand, '')) = 'Korax'
            OR LOWER(TRIM(COALESCE(brand, ''))) = 'korax'`,
      )
      .execute()
  },
  (app) => {
    // Reversão:
    // O SKU 3273 originalmente foi setado como 'Korax' na migration 0010
    app
      .db()
      .newQuery(
        `UPDATE products
         SET brand = 'Korax'
         WHERE TRIM(COALESCE(sku, '')) = '3273'`,
      )
      .execute()
  },
)
