import cartsModel from "../../models/cartsModel.js"

export default class CartManager {

     getOrCreateCart = async () => {
        let cart = await cartsModel.findOne().lean()
        if (!cart) {
          cart = await this.createCart()
        }
        return cart
      }

    getCarts = async () => {
        try {
            const carts = await cartsModel.find().lean();
            return carts
        } catch (err) {
            console.error('Error al obtener los carritos:', err.message)
            return []
        }
    };
    

    getCartById = async (cartId) => {

        try {
            const cart = await cartsModel.findById(cartId)

            return cart
        } catch (err) {
            console.error('Error al obtener el carrito por ID:', err.message)
            return err
        }
    };
    

    createCart = async (products) => {
        try {
            let cartData = {};
            if (products && products.length > 0) {
                cartData.products = products
            }
    
            const cart = await cartsModel.create(cartData)
            return cart
        } catch (err) {
            console.error('Error al crear el carrito:', err.message)
            return err
        }
    }
    

    addProductsToCart = async (cid, obj) => {
        try {
            const filter = { _id: cid, "products._id": obj._id }
            const cart = await cartsModel.findById(cid)
            const findProduct = cart.products.some((product) => product._id.toString() === obj._id)
    
            if (findProduct) {
                const update = { $inc: { "products.$.quantity": obj.quantity } }
                await cartsModel.updateOne(filter, update)
            } else {
                const update = { $push: { products: { _id: obj._id, quantity: obj.quantity } } }
                await cartsModel.updateOne({ _id: cid }, update)
            }
    
            return await cartsModel.findById(cid)
        } catch (err) {
            console.error('Error al agregar el producto al carrito:', err.message)
            return err
        }
    }

    updateOneProduct = async (cid, products) => {
        
        await cartsModel.updateOne(
            { _id: cid },
            {products})
        return await cartsModel.findOne({ _id: cid })
    }

    removeProductFromCart = async (cid, pid) => {
        const cart = await cartsModel.findById(cid)
        cart.products = cart.products.filter(
          (product) => product._id.toString() !== pid
        )
        return cart.save()
      }

    clearCart = async (cid) => {
    const cart = await cartsModel.findById(cid)
        if (!cart) {
          throw new Error("El carrito no existe")
        }
        cart.products = []
        return cart.save()
    }

}