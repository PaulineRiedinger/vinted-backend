// Importer express, mongoose et cors
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

// Configuration de Cloudinary
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Création du serveur
const app = express();

// Utilisation d'express.json pour récupérer des body dans les routes
app.use(express.json());

// Utilisation de cors
app.use(cors());

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Importer les routers
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
const offersRouter = require("./routes/offers");

// Créer une route GET d'accueil
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur Vinted" });
});

// Route test
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Test réussi" });
});

// Utiliser les routers avec des chemins spécifiques
app.use("/user", userRouter);
app.use("/offer", offerRouter);
app.use("/offers", offersRouter);

// Créer une route pour gérer toutes les routes inconnues
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// Faire tourner le serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Serveur démarré 👗`);
});
