// Importer express + les modèles nécessaires et les routes
const express = require("express");

const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Middleware pour le téléchargement de fichiers
router.use(fileUpload());

// Fonction pour convertir les fichiers en base64
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Route pour uploader l'image sur Cloudinary
const uploadImageToCloudinary = async (picture) => {
  const result = await cloudinary.uploader.upload(convertToBase64(picture));
  return result.secure_url;
};

// Créer une route POST pour publier une offre
router.post("/publish", isAuthenticated, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier les champs requis
    const { title, description, price, condition, city, brand, size, color } =
      req.body;
    const { picture } = req.files || {};

    if (
      !title ||
      !description ||
      !price ||
      !condition ||
      !city ||
      !brand ||
      !size ||
      !color ||
      !picture
    ) {
      return res
        .status(400)
        .json({ message: "Merci de renseigner tous les champs" });
    }

    // Upload de l'image sur Cloudinary
    const pictureUrl = await uploadImageToCloudinary(picture);

    // Créer une nouvelle offre
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      product_image: {
        secure_url: pictureUrl,
      },
      owner: req.user._id,
    });

    // Sauvegarder l'offre dans la BDD
    await newOffer.save();

    res.status(201).json(newOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pour tester si le middleware d'authentification fonctionne
router.use((req, res, next) => {
  next();
});

module.exports = router;
