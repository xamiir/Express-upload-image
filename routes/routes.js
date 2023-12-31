const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");

// upload image

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// if name, email, phone is not empty then redirect home page otherwise redirect add page

// const validateMiddleware = (req, res, next) => {
//   if (!req.body.name == "" || !req.body.email == "" || !req.body.phone == "") {
//     return res.redirect("/add");
//   }
//   next();
// };

// add user

router.post("/add", upload.single("image"), (req, res) => {
  // name, email, phone is empty then redirect add page otherwise redirect home page
  if (
    req.body.name == "" ||
    req.body.email == "" ||
    req.body.phone == "" ||
    req.file == undefined
  ) {
    return res.redirect("/add");
  }
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });

  user
    .save()
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User added successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

// router.post("/add", upload.single("image"), (req, res) => {
//   let user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     phone: req.body.phone,
//     image: req.file.filename,
//   });

//   user
//     .save()
//     .then(() => {
//       req.session.message = {
//         type: "success",
//         message: "User added successfully",
//       };
//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// form validation middleware

router.get("/", (req, res) => {
  User.find()
    .then((data) => {
      res.render("index", { title: "User list", users: data });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/add", (req, res) => {
  res.render("add-users", { title: "Add users" });
});

// edit user
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((data) => {
      res.render("edit_users", { title: "Edit users", user: data });
    })
    .catch((err) => {
      console.log(err);
    });
});

// update user
router.post("/update/:id", upload.single("image"), (req, res) => {
  let id = req.params.id;
  let update = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  if (req.file) {
    update.image = req.file.filename;
  }
  User.findByIdAndUpdate(id, { $set: update })
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User updated successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});
// delete user

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let user = await User.findByIdAndRemove(id);
    if (user.image != "") {
      try {
        fs.unlinkSync("./uploads/" + user.image);
      } catch (err) {
        console.log(err);
      }
    }
    req.session.message = {
      type: "info",
      message: "User deleted successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// search user by name or email or phone

router.post("/search", (req, res) => {
  let search = req.body.search;
  User.find({ $or: [{ name: search }, { email: search }, { phone: search }] })
    .then((data) => {
      res.render("index", { title: "Search result", users: data });
    })
    .catch((err) => {
      console.log(err);
    });
});

// about page
router.get("/about", (req, res) => {
  res.render("about", { title: "About us" });
});

// contact page

router.get("/contect", (req, res) => {
  res.render("contect", { title: "Contact us" });
});

module.exports = router;
