import { Router } from "express"
import ProductManager from '../dao/controllers/mongoDB/productManagerMongo.js'
import CartManager from "../dao/controllers/mongoDB/cartManagerMongo.js"

const productos = new ProductManager()
const carrito = new CartManager()

const viewsRouter = Router()


viewsRouter.get("/", async (req, res)=>{
    let allProducts = await productos.getProducts()
    res.render('home', {products : allProducts})
})

viewsRouter.get("/realtimeproducts", async (req, res) => {
    res.render("realtimeproducts")
})

viewsRouter.get("/chat",(req,res)=>{
    res.render("chat")
})

viewsRouter.get("/products", async (req, res) => {
    try {
        let allProducts = await productos.getAllProducts(req.query)
      allProducts.prevLink = allProducts.hasPrevPage
        ? `http://localhost:8080/products?page=${allProducts.prevPage}`
        : "";
        allProducts.nextLink = allProducts.hasNextPage
        ? `http://localhost:8080/products?page=${allProducts.nextPage}`
        : "";
        allProducts.isValid = !(
        req.query.page < 1 || req.query.page > allProducts.totalPages
      )
      res.render('products', allProducts)
    } catch (error) {
      console.error(error)
      res.status(500).send("Error al obtener los productos")
    }
  })

  viewsRouter.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const result = await carrito.getCartById(cid)

        if(result === null || typeof(result) === 'string') return res.render('cart', { result: false, message: 'ID not found' })
        return res.render('cart', { result })
    } catch (err) {
        console.log(err)
    }
})


export default viewsRouter