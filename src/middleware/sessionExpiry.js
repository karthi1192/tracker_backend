// Absolute session expiry — forces re-login after a fixed ceiling since the user
// logged in, independent of activity. Complements the rolling idle-timeout cookie
// (set in index.js), which only resets on activity and never enforces a hard cap.
const ABSOLUTE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function sessionExpiry(req, res, next) {
  if (req.isAuthenticated() && req.session.loginAt && Date.now() - req.session.loginAt > ABSOLUTE_SESSION_MS) {
    return req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(401).json({ error: "Session expired" });
    });
  }
  next();
}

module.exports = sessionExpiry;
