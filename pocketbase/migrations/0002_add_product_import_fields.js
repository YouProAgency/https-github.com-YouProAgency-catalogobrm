migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('products')

    // Add missing fields if not present
    if (!col.fields.getByName('unit')) {
      col.fields.add(new TextField({ name: 'unit' }))
    }
    if (!col.fields.getByName('brand')) {
      col.fields.add(new TextField({ name: 'brand' }))
    }
    if (!col.fields.getByName('price1')) {
      col.fields.add(new NumberField({ name: 'price1' }))
    }
    if (!col.fields.getByName('price2')) {
      col.fields.add(new NumberField({ name: 'price2' }))
    }
    if (!col.fields.getByName('price3')) {
      col.fields.add(new NumberField({ name: 'price3' }))
    }

    // Allow public or client-side write access for the import tool in the web app
    col.listRule = ''
    col.viewRule = ''
    col.createRule = ''
    col.updateRule = ''
    col.deleteRule = ''

    // Add brand index
    col.addIndex('idx_products_brand', false, 'brand', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('products')
    col.removeIndex('idx_products_brand')
    col.fields.removeByName('unit')
    col.fields.removeByName('brand')
    col.fields.removeByName('price1')
    col.fields.removeByName('price2')
    col.fields.removeByName('price3')
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  },
)
