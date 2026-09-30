migrate(
  (app) => {
    // 1. Criar usuário administrador inicial se não existir
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const adminEmail = 'admin@brmangueiras.com.br'
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
    } catch (_) {
      const record = new Record(users)
      record.setEmail(adminEmail)
      record.setPassword('BRMadmin@2026')
      record.setVerified(true)
      record.set('name', 'Administrador BRM')
      app.save(record)
    }

    // 2. Ajustar regras de produtos: leitura pública e escrita apenas para usuário autenticado
    const products = app.findCollectionByNameOrId('products')
    products.listRule = ''
    products.viewRule = ''
    products.createRule = "@request.auth.id != ''"
    products.updateRule = "@request.auth.id != ''"
    products.deleteRule = "@request.auth.id != ''"
    app.save(products)
  },
  (app) => {
    const adminEmail = 'admin@brmangueiras.com.br'
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
      app.delete(record)
    } catch (_) {}

    const products = app.findCollectionByNameOrId('products')
    products.listRule = ''
    products.viewRule = ''
    products.createRule = ''
    products.updateRule = ''
    products.deleteRule = ''
    app.save(products)
  },
)
