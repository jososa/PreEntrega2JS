import { Router } from "express"
//import userManager from "../dao/controllers/mongoDB/userManagerMongo.js"

import usersModel from "../dao/models/usersModels.js"
import utils, { createHash, isValidPassword } from "../utils.js"

//const usuarios = new userManager
const sessionRouter = Router()

//Registro de Usuario
sessionRouter.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body
  if ((!first_name, !last_name, !email, !age, !password)) {
    throw new Error("Debe ingresar todos los campos")
  }

  const exist = await usersModel.findOne({ email: email })
  if (exist) {
    return res
      .status(400)
      .send({ status: "error", error: "Correo ya existente" })
  }
  const user = {
    first_name,
    last_name,
    email,
    age,
    password: createHash(password),
    role: "user",
  };
  const result = await usersModel.create(user);
  console.log(result);
  res.status(201).send({ status: "success", payload: result })
});

//Login de Usuario
sessionRouter.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
    const user = {
      first_name: "Admin",
      last_name: "Coder",
      email: "adminCoder@coder.com",
      age: 33,
      role: "admin",
    }

    req.session.user = {
      email: user.email,
      role: user.role,
    }

    return res.status(200).json({
      status: "success",
      payload: req.session.user,
      message: "Inicio exitoso",
    })
  }

  const user = await usersModel.findOne({ email })
  if (!user) {
    return res.status(400).json({
      status: "error",
      error: "Credenciales inválidas",
    })
  }
  const validarPass = isValidPassword(user, password)
  if (!validarPass) {
    return res.status(401).json({
      status: "error",
      message: "Error de credenciales",
    })
  }

  console.log(user)

  req.session.user = {
    email: user.email,
    role: user.role,
  }

  res.status(200).json({
    status: "success",
    payload: req.session.user,
    message: "Inicio exitoso",
  });

  console.log(req.session.user)
})

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.send({ status: "success", message: "Sesión cerrada" })
    } else {
      res.send({ error: err })
    }
  })
})


export default sessionRouter