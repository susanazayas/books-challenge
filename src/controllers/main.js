const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render('home', { books });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: (req, res) => {
    db.Book.findByPk(req.params.id, {
      include: [{ association: 'authors' }]
    })
      .then((book) => {
        res.render('bookDetail', { book });
      })
      .catch((error) => console.log(error));
  },
  bookSearch: (req, res) => {
    res.render('search', { books: [] });
  },
  bookSearchResult: (req, res) => {
    let {title} = req.body
    db.Book.findAll({
      where: {title: {[Op.like]: '%' + title + '%'}},
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render('search', { books });
      })
      .catch((error) => console.log(error));
  },
  deleteBook: (req, res) => {
    db.Book.destroy({
      where: {
          id: req.params.id
      }
  })
    res.render('home');
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render('authors', { authors });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    db.Author.findByPk(req.params.id, {
      include: [{ association: 'books' }]
    })
    .then((author) => {
      res.render('authorBooks', {author});
    })
    .catch((error) => console.log(error));

  },
  register: (req, res) => {
    res.render('register');
  },
  processRegister: (req, res) => {
    db.User.create({
      Name: req.body.name,
      Email: req.body.email,
      Country: req.body.country,
      Pass: bcryptjs.hashSync(req.body.password, 10),
      CategoryId: req.body.category
    })
      .then(() => {
        res.redirect('/');
      })
      .catch((error) => console.log(error));
  },
  login: (req, res) => {
    
    res.render('login');
  },
  processLogin: (req, res) => {
    let userToLogin;
    let passwordCompared
    db.User.findAll()
      .then(users => {
        userToLogin = users.find(user => user.Email.toLowerCase() === req.body.email.toLowerCase());
          if(userToLogin) {
            passwordCompared = bcryptjs.compareSync(req.body.password, userToLogin.Pass)
          }
          if(passwordCompared){
            let savedName = userToLogin.Name

            res.cookie('login', true)
            res.cookie('admin', userToLogin.CategoryId)
            res.cookie('name', savedName)

            res.redirect('/');
          }
      })
    },
    
  edit: (req, res) => {
    db.Book.findByPk(req.params.id, {
      include: [{ association: 'authors' }]
    })
      .then((book) => {
        res.render('editBook', { book });
      })
      .catch((error) => console.log(error));
  },
  processEdit: (req, res) => {
    
    res.render('home');
  },
  logout: (req,res) => {
    res.clearCookie("login")
    res.clearCookie("admin")
    res.clearCookie("name")
    res.redirect('/')
  }
};

module.exports = mainController;
