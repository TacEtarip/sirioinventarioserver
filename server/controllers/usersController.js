import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passport from "passport";
import gs from "passport-google-oauth20";
import config from "../../config/index";
import { UserSchema } from "../models/userModel";

const User = mongoose.model("User", UserSchema);

const GoogleStrategy = gs.Strategy;

export const ps = passport.use(
  new GoogleStrategy(
    {
      clientID: config[process.env.NODE_ENV].googleClientID,
      clientSecret: config[process.env.NODE_ENV].googleClientSecret,
      callbackURL: config[process.env.NODE_ENV].callBackUrl,
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile);
    }
  )
);

const registerWithGoogleMock = async (googleUser) => {
  try {
    const result = await User.findOne({ googleCod: googleUser.sub });

    if (result !== null) {
      const tempR = result.toObject();
      tempR.new = false;
      tempR.hashPassword = undefined;
      return tempR;
    }

    const newUser = new User({
      username: "testGoogle",
      type: "low",
      displayName: "TestGoogle",
      email: googleUser.email,
      nombre: googleUser.given_name,
      apellido: googleUser.family_name,
      google: true,
      googleCod: googleUser.sub,
      dni: "763559537",
    });

    newUser.hashPassword = await bcrypt.hash("test", 10);

    const savedUSer = await newUser.save();

    const tempS = savedUSer.toObject();

    tempS.new = true;

    return tempS;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

const tranformarTelefono = (celular = "") => {
  let newPhone = celular.split(" ").join("");
  if (!celular.startsWith("+")) {
    newPhone = "+51" + celular.split(" ").join("");
  }
  return newPhone;
};

export const registerUserLow = async (req, res, next) => {
  try {
    const username = req.body.displayName.toLowerCase();
    const newUser = new User(req.body);
    newUser.celular = tranformarTelefono(req.body.celular);
    newUser.username = username;
    newUser.hashPassword = await bcrypt.hash(req.body.password, 10);
    newUser.type = "low";
    newUser.nombre = req.body.nombre.toUpperCase();
    newUser.apellido = req.body.apellido.toUpperCase();
    const savedUSer = await newUser.save();
    savedUSer.hashPassword = undefined;
    req.savedUSer = savedUSer;
    next();
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const isValid = async (req, res) => {
  try {
    const result = await User.findById(req.body.idUser);
    if (result.verified === false) {
      return res.json({ reload: false });
    }
    return res.json({ reload: true });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const confirmarUsuario = async (req, res) => {
  try {
    const result = await User.findById(req.params.idUser);
    if (result.verified === false) {
      const token = jwt.sign(
        { _id: result._id },
        config[process.env.NODE_ENV].jwtLogin,
        { expiresIn: "120s" }
      );
      await User.findByIdAndUpdate(
        result._id,
        { verified: true },
        { useFindAndModify: false }
      );
      return res.redirect(
        `${config[process.env.NODE_ENV].link_front}login/auto/${token}`
      );
    }
    return res.status(202).send("<h1>Este usuario ya esta verificado.</h1>");
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const loginUserToken = async (req, res, next) => {
  jwt.verify(
    req.body.loginToken,
    config[process.env.NODE_ENV].jwtLogin,
    (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(400).json({ error: "Token Expirado" });
        }
        return res.status(500).json({ error: err.message });
      } else {
        req.logintoken = decode;
        next();
      }
    }
  );
};

export const doTheLogin = async (req, res) => {
  try {
    const user = await User.findById(req.logintoken._id);
    return res.json({
      displayName: user.displayName,
      username: user.username,
      success: true,
      message: "Success",
      type: user.type,
      token: jwt.sign(
        { aud: user.username + " " + user.type, _id: user.id },
        config[process.env.NODE_ENV].jwtKey
      ),
    });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const userExits = async (req, res) => {
  try {
    const result = await User.exists({
      username: req.params.username.toLowerCase(),
    });
    return res.json({ exists: result });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const emailExits = async (req, res) => {
  try {
    const result = await User.exists({ email: req.params.email.toLowerCase() });
    return res.json({ exists: result });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const googleExito = async (req, res) => {
  try {
    // const user = await registerWithGoogleMock(req.user._json);
    res.json(req.user._json);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const googlePreRegistro = async (req, res, next) => {
  try {
    const result = await User.exists({ email: req.user._json.email });
    if (result) {
      return next();
    }
    const token = jwt.sign(
      req.user._json,
      config[process.env.NODE_ENV].jwtGoogleLogin,
      { expiresIn: "30s" }
    );
    return res.redirect(
      `${config[process.env.NODE_ENV].link_front}login/registro/${token}`
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const loginGoogle = async (req, res, next) => {
  try {
    const result = await User.findOneAndUpdate(
      { email: req.user._json.email },
      { verified: true },
      { new: true, useFindAndModify: false }
    );
    const token = jwt.sign(
      { _id: result._id },
      config[process.env.NODE_ENV].jwtLogin,
      { expiresIn: "120s" }
    );
    await User.findByIdAndUpdate(
      result._id,
      { verified: true },
      { useFindAndModify: false }
    );
    return res.redirect(
      `${config[process.env.NODE_ENV].link_front}login/auto/${token}`
    );
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const getLoginInfoFromToken = async (req, res) => {
  jwt.verify(
    req.body.loginToken,
    config[process.env.NODE_ENV].jwtGoogleLogin,
    (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(400).json({ error: "Token Expirado" });
        }
        return res.status(500).json({ error: err.message });
      }
      return res.json(decode);
    }
  );
};

export const adminLoginRequired = (req, res, next) => {
  if (req.user && req.user.aud.split(" ")[1] === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Usuario No Autorizado" });
  }
};

export const lowLoginRequired = (req, res, next) => {
  if (req.user && req.user.aud.split(" ")[1] === "low") {
    next();
  } else {
    return res.status(401).json({ message: "Usuario No Autorizado" });
  }
};

export const normalLoginRequired = (req, res, next) => {
  if (
    req.user &&
    (req.user.aud.split(" ")[1] === "vent" ||
      req.user.aud.split(" ")[1] === "admin" ||
      req.user.aud.split(" ")[1] === "contador")
  ) {
    next();
  } else {
    return res.status(401).json({ message: "Usuario No Autorizado" });
  }
};

export const transaccionalLoginRequired = (req, res, next) => {
  if (
    req.user &&
    (req.user.aud.split(" ")[1] === "vent" ||
      req.user.aud.split(" ")[1] === "admin")
  ) {
    next();
  } else {
    return res.status(401).json({ message: "Usuario No Autorizado" });
  }
};

export const allLoginRequired = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: "Usuario No Autorizado" });
  }
};

export const register = async (req, res) => {
  try {
    const displayName = req.body.username;
    const newUser = new User(req.body);
    newUser.displayName = displayName;
    newUser.username = displayName.toLowerCase();
    newUser.hashPassword = await bcrypt.hash(req.body.password, 10);
    const savedUSer = await newUser.save();
    savedUSer.hashPassword = undefined;
    return res.json(savedUSer);
  } catch (error) {
    return res.status(error.status || 400).send({
      message: error,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await User.findOne({
      username: req.body.username.toLowerCase(),
    });
    if (!result) {
      return res
        .status(400)
        .json({
          username: req.body.username,
          success: false,
          message: "Authenticacion failed. No user found!",
          token: null,
        });
    }
    if (
      !(await result.comparePassword(req.body.password, result.hashPassword))
    ) {
      return res
        .status(400)
        .json({
          username: req.body.username,
          success: false,
          message: "Authenticacion failed. Incorrect Password!",
          token: null,
        });
    } else {
      return res.json({
        displayName: result.displayName,
        username: result.username,
        success: true,
        message: "Success",
        type: result.type,
        token: jwt.sign(
          { aud: result.username + " " + result.type, _id: result.id },
          config[process.env.NODE_ENV].jwtKey
        ),
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const result = await User.findOne({
      username: req.params.username.toLowerCase(),
    });
    result.hashPassword = undefined;
    res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const getOwnUser = async (req, res) => {
  try {
    const result = await User.findOne({ username: req.user.aud.split(" ")[0] });
    result.hashPassword = undefined;
    res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const actulizarCelular = async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.body.id },
      { celular: tranformarTelefono(req.body.celular) },
      { useFindAndModify: false, new: true }
    );
    result.hashPassword = undefined;
    res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const agregarDireccion = async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.body.id },
      {
        dirOne: req.body.dirOne,
        dirTwo: req.body.dirTwo || "",
        reference: req.body.reference,
        city: "Trujillo, La Libertad. Perú",
      },
      { useFindAndModify: false, new: true }
    );
    result.hashPassword = undefined;
    res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const agregarDocumento = async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.body.id },
      { documento: req.body.documento, tipoPersona: req.body.tipoPersona },
      { useFindAndModify: false, new: true }
    );
    result.hashPassword = undefined;
    res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const confirmarContrasena = async (req, res) => {
  try {
    const result = await User.findById(req.body.id);
    if (
      !(await result.comparePassword(req.body.oldPassword, result.hashPassword))
    ) {
      return res.json({ valid: false });
    }
    res.json({ valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const cambiarContrasena = async (req, res) => {
  try {
    const result = await User.findById(req.body.id);
    if (
      !(await result.comparePassword(req.body.passwordOld, result.hashPassword))
    ) {
      return res.json({ changed: false });
    }
    const newHash = await bcrypt.hash(req.body.password, 10);
    await User.findByIdAndUpdate(
      req.body.id,
      { hashPassword: newHash },
      { new: true, useFindAndModify: false }
    );
    return res.json({ changed: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const agregarVentaUsuario = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { username: req.user.aud.split(" ")[0] },
      { $push: { ventaActiva: req.saveResult.codigo } },
      { useFindAndModify: false }
    );
    res.json({
      message: `Venta generada con el codigo: ${req.saveResult.codigo}`,
      venta: req.saveResult,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const getVentaActiva = async (req, res, next) => {
  try {
    const usuario = await User.findOne({
      username: req.user.aud.split(" ")[0],
    });
    req.ventaCod = usuario.ventaActiva;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const getVentasActivasList = async (req, res, next) => {
  try {
    const usuario = await User.findOne({
      username: req.user.aud.split(" ")[0],
    });
    res.json(usuario.ventaActiva);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const tieneVentaActiva = async (req, res, next) => {
  try {
    const usuario = await User.findOne({
      username: req.user.aud.split(" ")[0],
    });
    if (usuario.ventaActiva.lenght > 4) {
      return res.status(409).json({ message: "Ya tienes 5 ventas activas." });
    }
    req.ventaCod = usuario.ventaActiva;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const tieneFiveVentaActiva = async (req, res, next) => {
  try {
    const usuario = await User.findOne({
      username: req.user.aud.split(" ")[0],
    });
    if (usuario.ventaActiva.lenght > 5) {
      return res.status(409).json({ message: "Ya tiene 5 ventas activas" });
    }
    res.json(usuario.ventaActiva);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const registerUserLowGooglePreCheck = async (req, res, next) => {
  try {
    const username = req.body.displayName.toLowerCase();
    const newUser = new User(req.body);
    newUser.celular = tranformarTelefono(req.body.celular);
    newUser.username = username;
    newUser.hashPassword = await bcrypt.hash(req.body.password, 10);
    newUser.type = "low";
    newUser.nombre = req.body.nombre.toUpperCase();
    newUser.apellido = req.body.apellido.toUpperCase();
    newUser.verified = true;
    const savedUSer = await newUser.save();
    savedUSer.hashPassword = undefined;
    return res.json({
      displayName: savedUSer.displayName,
      username: savedUSer.username,
      success: true,
      message: "Success",
      type: savedUSer.type,
      token: jwt.sign(
        { aud: savedUSer.username + " " + savedUSer.type, _id: savedUSer.id },
        config[process.env.NODE_ENV].jwtKey
      ),
    });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};

export const getReToken = async (req, res) => {
  try {
    return res.json({ reToken: config[process.env.NODE_ENV].reToken });
  } catch (error) {
    return res
      .status(500 || error.status)
      .json({ message: "Ocurrio un error inesperado. Intentelo denuevo" });
  }
};
