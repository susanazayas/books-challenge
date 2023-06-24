const bcryptjs = require("bcryptjs");
const { Op } = require("sequelize");
const db = require("../database/models");
const { validationResult } = require("express-validator");
const session = require("express-session");
const { DATE } = require("sequelize");

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: "authors" }],
    })
      .then((books) => {
        console.log(req.session);
        res.render("home", { books, session: req.session });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: async (req, res) => {
    let libro = await db.Book.findByPk(req.params.id, {
      include: [{ association: "authors" }],
    });
    let autores = libro.authors.map((autor) => {
      return autor.name;
    });
    res.render("bookDetail", { libro, autores, session: req.session });
  },
  bookSearch: (req, res) => {
    res.render("search", { libros: [],session: req.session });
  },
  bookSearchResult: async (req, res) => {
    let libros = await db.Book.findAll({
      where: {
        title: { [Op.like]: "%" + req.body.title + "%" },
      },
      include: [{ association: "authors" }],
    });
    res.render("search", { libros,session: req.session  });
  },

  deleteBook: async (req, res) => {
    await db.Book.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/");
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render("authors", { authors,session: req.session });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: async (req, res) => {
    let autor = await db.Author.findByPk(req.params.id, {
      include: [{ association: "books" }],
    });
    let libros = autor.books;
    res.render("authorBooks", { libros,session: req.session});
  },
  register: (req, res) => {
    res.render("register",{session: req.session });
  },
  processRegister: async (req, res) => {
    let errores = validationResult(req);
    if (errores.isEmpty()) {
      await db.User.create({
        Name: req.body.name,
        Email: req.body.email,
        Country: req.body.country,
        Pass: bcryptjs.hashSync(req.body.password, 10),
        CategoryId: req.body.category,
      });
      res.redirect("/");
    } else {
      return res.render("register", {
        mensajeDeError: errores.mapped(),
        old: req.body,
        session: req.session 
      });
    }
  },
  login: (req, res) => {
    res.render("login",{session: req.session });
  },
  processLogin: async (req, res) => {
    let errores = validationResult(req);

    if (errores.isEmpty()) {
      const user = await db.User.findOne({ where: { email: req.body.email } });
      if (user.Email === req.body.email) {
        let userSession = {
          name: user.Name,
          email: user.Email,
          id: user.id,
          isAdmin: user.CategoryId === 1 ? true : false,
        };
        req.session.user = userSession;
        if(req.body.remember){ 
          let tiempoCookies=new Date(Date.now()+60000)
          res.cookie("userLogin", userSession,{
            expires:tiempoCookies, httpOnly:true
          })
        }
        console.log("te encontre perra " + user.Email);
        res.redirect("/");
      }
    } else {
      return res.render("login", {
        mensajeDeError: errores.mapped(),
        old: req.body,
        session: req.session 
      });
    }
  },
  logout: (req, res) => {
    req.session.destroy();
    if(req.cookies.userLogin){ 
      res.cookie("userLogin","",{
       maxAge:-1
      }) 
    }
    res.redirect("/");
  },
  edit: async (req, res) => {
    let libro = await db.Book.findByPk(req.params.id, {
      include: [{ association: "authors" }],
    });
    res.render("editBook", { libro,session: req.session });
  },
  processEdit: async (req, res) => {
    let libroEditar = {
      title: req.body.title,
      description: req.body.description,
      cover: req.body.cover,
    };
    await db.Book.update(libroEditar, {
      where: {
        id: req.params.id,
      },
    });

    res.redirect("/");
  },
};

module.exports = mainController;
