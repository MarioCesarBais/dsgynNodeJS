const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator/check");

const User = require("../models/user");

const appName = process.env.APP_NAME;
const appUrl = appName
  ? `https://${appName}.vercel.app/`
  : `http://localhost:${process.env.PORT}/`;
console.log("11", appUrl, process.env.APP_NAME);

// const appUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}/`
//   : `http://localhost:${process.env.PORT}/`;
// console.log("URL da aplicação:", appUrl);


let mailOptions = {
  from: "Mario Cesar Bais <mariocfbais@gmail.com>",
};

async function sendMail(mailOptionsReceived) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mariocfbais@gmail.com", // Seu e-mail do Gmail
      pass: process.env.GMAIL_SENHA_APP, // A Senha de App gerada
    },
  });

  for (e in mailOptionsReceived) {
    mailOptions[e] = mailOptionsReceived[e];
  }

  console.log("32", mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Erro ao enviar:", error);
    } else {
      console.log("E-mail enviado:", info.response);
    }
  });
}

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Inscrever-se",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "E-mail ou Senha inválidos!",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }

      if (user.confirmationToken) {
        const message =
          "Inscrição ainda não confirmada! Favor clicar no link recebido via e-mail!";
        return res.render("auth/confirm-signup", {
          path: "/confirm-signup",
          pageTitle: "Inscrição",
          errorMessage: message,
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log("127", err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "E-mail ou Senha inválidos!",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log("143", err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("161: if (!errors.isEmpty())", errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Inscrever-se",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        role,
        confirmationToken: crypto.randomBytes(32).toString("hex"), // Adiciona o token de confirmação
      });
      return user.save();
    })
    .then((result) => {
      console.log("linha 187");
      res.redirect("/login");
      const confirmLink = `${appUrl}confirm/${result.confirmationToken}`;
      mailOptions["to"] = email;
      mailOptions["subject"] = "DS/Goiânia - Inscrição a Confirmar";
      mailOptions[
        "html"
      ] = `<h1>Agradecemos o contato! Clicar no link para confirmar a inscrição: ${confirmLink}</h1>`;

      sendMail(mailOptions)
        .then((result) => {
          console.log("e-Mail sent");
          return result;
        })
        .catch((err) => {
          console.log("200", err.message);
          return err;
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("214", err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Resetar Senha",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("236", err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Nenhuma conta encontrada com aquele e-mail!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        if (result) {
          res.redirect("/");
          const resetLink = `${appUrl}reset/${token}`;
          mailOptions["to"] = req.body.email;
          mailOptions["subject"] = "Redefinição de senha";
          mailOptions["html"] = `<p>Você solicitou a redefinição de senha.</p>
          <p>Clique <a href="${resetLink}">aqui</a> para definir uma nova senha.</p>`;
          sendMail(mailOptions)
            .then((result) => {
              console.log("e-Mail sent");
              return result;
            })
            .catch((err) => {
              console.log("264", err.message);
              return err;
            });
        }
      })
      .catch((err) => {
        console.log("270", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Nova Senha",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      resetUser.confirmationToken = null;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.confirmSignUp = (req, res, next) => {
  const token = req.params.token;
  User.findOneAndUpdate(
    { confirmationToken: token },
    { $set: { confirmationToken: null } } // Remove o token de confirmação
  )
    .then((user) => {
      let message;
      if (!user) {
        const err = "Erro na atualização do token: expirado ou inválido!";
        console.log("345", err);
        message = err;
      } else {
        message = null;
      }
      // Redirecione ou renderize uma página de confirmação bem-sucedida
      res.render("auth/confirm-signup", {
        path: "/confirm-signup",
        pageTitle: "Inscrição",
        errorMessage: message,
      });
    })
    .catch((err) => {
      // Trate erros
      console.log("Erro na confirmação de inscrição:", err);
    });
};