const express  = require("express");
const passport = require("passport");
const router   = express.Router();

// Kick off Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.readonly"],
  accessType: "offline",
}));

// Google redirects here after login
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}?auth=failed` }),
  (req, res) => res.redirect(process.env.FRONTEND_URL)
);

// Return logged-in user
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  const { id, email, name, avatar_url, role } = req.user;
  res.json({ user: { id, email, name, avatar_url, role } });
});

// Logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

module.exports = router;
