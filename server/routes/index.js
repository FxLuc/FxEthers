module.exports = app => {
    const {
        accountController,
        // itemController,
        // orderController,
    } = require('../controllers')
    app.get('/', (_req, res) => res.status(200).json('API Server is working...'))

    app.get('/accounts', accountController.getAccount)
    app.get('/accounts/create', accountController.create)
    app.post('/accounts/update/avatar', accountController.updateAvatar)
    app.post('/accounts/update/name', accountController.updateName)
    app.post('/accounts/update/bio', accountController.updateBio)
    app.post('/accounts/update/external-url', accountController.updateExternalUrl)

    // app.get('/item', itemController.getItem)
    // app.post('/item/create', itemController.createItem)
    // app.get('/item/newest', itemController.getItems)
    // app.get('/item/raw/:tokenId', itemController.getRawItem)
    // app.get('/item/search', itemController.searchItem)
    // app.post('/item/offer', itemController.makeOffer)

    // app.get('/item/my', itemController.getMyItems)

    // app.get('/order/purchase', orderController.getPurchaseOrder)
    // app.get('/order/sales', orderController.getSalesOrder)
    // app.put('/order/update', orderController.updateOrder)

    // app.post('/item/delivery', orderController.delivery)
    // app.put('/item/deliveryto', orderController.setDeliveryTo)
}