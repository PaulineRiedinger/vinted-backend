const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Chercher l'utilisateur correspondant au token
    const user = await User.findOne({ token: token }).select("-salt -hash");

    if (!user) {
      return res.status(401).json({ error: "unauthorized" });
    }

    req.user = user; // Attacher l'utilisateur à la requête
    next(); // Passer au middleware suivant
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = isAuthenticated;
