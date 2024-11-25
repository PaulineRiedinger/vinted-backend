// Importer express, mongoose, + les modèles nécessaires et les routes
const express = require("express");
const mongoose = require("mongoose");

const Offer = require("../models/Offer");

const router = express.Router();

// Route pour récupérer les offres avec des paramètres de requête
router.get("/", async (req, res) => {
  try {
    // Récupérer les paramètres de requête
    const { title, priceMin, priceMax, page, sort } = req.query;

    // Initialisation des variables pour la pagination
    let skip = 0; // Nombre d'offres à ignorer
    let limit = 3; // Limite d'offres par page
    let pageToSeach = page || 1; // Page actuelle à rechercher, par défaut à 1

    // Ajuster le nombre d'offres à ignorer en fonction de la page
    skip = (pageToSeach - 1) * limit;

    // Objet pour les filtres de recherche
    let filters = {};
    if (title) {
      // Filtre par nom de produit, insensible à la casse
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      // Filtre pour le prix minimum
      filters.product_price = { ...filters.product_price, $gte: priceMin };
    }
    if (priceMax) {
      // Filtre pour le prix maximum
      filters.product_price = { ...filters.product_price, $lte: priceMax };
    }

    // Objet pour le tri des résultats
    const sortPrice = {};
    if (sort === "price-desc") {
      sortPrice.product_price = -1; // Tri par prix décroissant
    } else if (sort === "price-asc") {
      sortPrice.product_price = 1; // Tri par prix croissant
    }

    // Récupération des offres avec les filtres, le tri, et la pagination
    const offers = await Offer.find(filters)
      .select("product_name product_price -_id") // Sélectionner les champs à retourner
      .sort(sortPrice) // Appliquer le tri
      .limit(limit) // Limiter le nombre d'offres retournées
      .skip(skip); // Ignorer les offres déjà affichées pour la pagination

    // Renvoyer les offres récupérées en réponse
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les détails d'une offre par ID
router.get("/:id", async (req, res) => {
  try {
    // Récupérer l'offre par ID
    const offer = await Offer.findById(req.params.id)
      .populate("owner") // Populate pour obtenir les détails de l'utilisateur
      .select(
        "product_details product_image.secure_url product_name product_description product_price"
      ); // Sélectionner les champs à retourner

    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
