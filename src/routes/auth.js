const express  = require("express");
const passport = require("passport");
const router   = express.Router();

// Kick off Google OAuth
// calendar.events (read/write on events) replaces the old calendar.readonly scope so
// meeting creation can push real events + Meet links to the user's calendar. Google
// requires one-time user consent for any scope not already granted, so returning users
// who haven't re-authorized yet still get prompted automatically — just once, not on
// every login — without needing prompt:"consent" forced here permanently.
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.events"],
  accessType: "offline",
}));

// Google redirects here after login
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}?auth=failed` }),
  (req, res) => {
    req.session.loginAt = Date.now();
    res.redirect(process.env.FRONTEND_URL);
  }
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
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

module.exports = router;
