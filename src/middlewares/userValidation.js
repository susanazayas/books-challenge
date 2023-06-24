const path = require("path");
const bcryptjs = require("bcryptjs");
const db = require("../database/models");
const { check, body } = require("express-validator");
module.exports = {
  validacionesLogin: [
    check("email")
      .notEmpty()
      .withMessage("Escribe un email")
      .bail()
      .isEmail()
      .withMessage("Debes escribir un email valido"),
    check("password")
      .notEmpty()
      .withMessage("Escribe una contraseña")
      .isLength({ min: 8 })
      .withMessage("La contraseña es muy corta")
      .bail()
      .isAlphanumeric()
      .withMessage("La contraseña debe ser alfanumerica"),
    body("password").custom((value, { req }) => {
      return db.User.findOne({
        where: {
          email: req.body.email,
        },
      }).then((user) => {
        if (!bcryptjs.compareSync(value, user.Pass)) {
          return Promise.reject();
        }
      }).catch(()=>{return Promise.reject("Email o contraseña invalida")});
    }),
  ],
  validacionRegistro: [
    check("name").notEmpty().withMessage("Debes escribir un nombre"),
    check("email")
      .notEmpty()
      .withMessage("Escribe un email")
      .bail()
      .isEmail()
      .withMessage("Debes escribir un email valido"),
    check("country")
      .notEmpty()
      .withMessage("Debes indicar un pais")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Debes indicar un pais"),
    check("password")
      .notEmpty()
      .withMessage("Escribe una contraseña")
      .isLength({ min: 8 })
      .withMessage("La contraseña es muy corta")
      .bail()
      .isAlphanumeric()
      .withMessage("La contraseña debe ser alfanumerica"),
    check("category").notEmpty().withMessage("Debes elegir una opcion"),
  ],
};
