import { Router } from "express"
import fs from "fs"
//import { CartManager } from '../dao/controllers/fileSystem/CartManager.js'
import CartManager from "../dao/controllers/mongoDB/cartManagerMongo.js"
import ProductManager from "../dao/controllers/mongoDB/productManagerMongo.js"

const carrito = new CartManager()
const productos = new ProductManager()

const cartRouter = Router()

cartRouter.post("/", async (req, res) => {
    try {
        const newCart = await carrito.createCart();
        res.status(201).send({ status: "Carrito creado", payload: newCart })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: "Error al crear el carrito",  error: error.message })
    }
})

cartRouter.get("/",async(req,res)=>{
    const cart = await carrito.getCarts()
    res.json({cart})
 })

cartRouter.get("/:cid", async (req, res) => {

    try {
        const cid = req.params.cid;
        const cart = await carrito.getCartById(cid)
        res.json(cart)

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: "Internal Server Error",  error: error.message})
    }
})

cartRouter.post("/:cid/product/:prodId", async (req, res) => {

    const { cid, prodId } = req.params;

    try {
      const updatedCart = await carrito.addProductsToCart(cid, prodId)
      res.status(201).send({ status: "Producto agregado al carrito" })
    } catch (error) {
        res.status(500).send({ status: "Internal Server Error",  error: error.message })
    }
})

cartRouter.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const { products } = req.body
  
        for (const product of products) {
            const checkId = await productos.getProductById(product._id)
  
            if (!checkId) {
                return res.status(404).send({ status: 'error', message: `No se encuentra el Product ID: ${product._id}` })
            }
        }

        const checkIdCart = await carrito.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ status: 'error', message: `No se encuentra el carrito ID: ${cid}` })
        }
  
        const cart = await carrito.updateOneProduct(cid, products)
        return res.status(200).send({ status: 'success', payload: cart })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: 'Se produjo un error al procesar la solicitud' })
    }
  })

cartRouter.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
  
        const checkIdProduct = await productos.getProductById(pid);
        if (!checkIdProduct) {
            return res.status(404).send({ status: 'error', message: `Producto ID: ${pid} no encontrado` });
        }
  
        const checkIdCart = await carrito.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ status: 'error', message: `Carrito ID: ${cid} no encontrado` });
        }
  
        const findProductIndex = checkIdCart.products.findIndex((product) => product._id.toString() === pid);
        if (findProductIndex === -1) {
            return res.status(404).send({ status: 'error', message: `Producto ID: ${pid} no encontrado en carrito` });
        }
  
        checkIdCart.products.splice(findProductIndex, 1);
  
        const updatedCart = await carrito.deleteProductInCart(cid, checkIdCart.products);
  
        return res.status(200).send({ status: 'success', message: `Se elimino producto ID: ${pid}`, cart: updatedCart });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: 'Se produjo un error al procesar la solicitud' });
    }
  })

cartRouter.delete('/:cid', async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await carrito.getCartById(cid);
  
      if (!cart) {
        return res.status(404).send({ message: `Carrito ID: ${cid} no encontrado` });
      }
  
      if (cart.products.length === 0) {
        return res.status(404).send({ message: 'Carrito vacío' });
      }

      cart.products = [];
  
      await carrito.updateOneProduct(cid, cart.products);
  
      return res.status(200).send({
        status: 'success',
        message: `Carrito ID: ${cid} eliminado con exito`,
        cart: cart,
      });
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: 'Se produjo un error al procesar la solicitud' })
    }
  })

export default cartRouter