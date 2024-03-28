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
      //const cart = await carrito.getOrCreateCart(); //Obtiene o crea un carrito
      //const result = await productos.getAllProducts(req.query);
      //result.cartId = cart._id; //Agrega el id del carrito al resultado para usarlo al agregar productos
      allProducts.prevLink = allProducts.hasPrevPage
        ? `http://localhost:8080/products?page=${allProducts.prevPage}`
        : "";
        allProducts.nextLink = allProducts.hasNextPage
        ? `http://localhost:8080/products?page=${allProducts.nextPage}`
        : "";
        allProducts.isValid = !(
        req.query.page < 1 || req.query.page > allProducts.totalPages
      )
      //res.render("products", {productos : result})
      res.render('products', allProducts)
    } catch (error) {
      console.error(error)
      res.status(500).send("Error al obtener los productos")
    }
  })


viewsRouter.get("/cart", async (req, res) => {
    try {
      // Busca el primer carrito disponible o crea uno nuevo si no hay ninguno.
      const cartId = await carrito.getCarts();
      //const cid = cartId._id.toString();

      //console.log(cid)
      // Usa el método getCartById para obtener el carrito con todos sus productos.
     // const cart = await carrito.getCartById(cid);
      //cart.cartId = cid; // Agrega el id del carrito al resultado para usarlo en CRUD  
      res.render("cart", cartId);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al obtener el carrito");
    }
  });

export default viewsRouter