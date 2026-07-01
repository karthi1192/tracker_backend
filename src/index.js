require("dotenv").config();
const express        = require("express");
const session        = require("express-session");
const connectPgStore = require("connect-pg-simple")(session);
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors           = require("cors");
const pool           = require("./db/pool");

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true,
}));
app.use(express.json());

// ── Session (PostgreSQL store) ────────────────────────────────────────────────
app.use(session({
  store: new connectPgStore({ pool, tableName: "sessions" }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "none", secure: true },
}));

// ── Passport + Google OAuth ───────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar_url, google_access_token, google_refresh_token)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (google_id) DO UPDATE SET
           name=$3, avatar_url=$4,
           google_access_token=$5,
           google_refresh_token=COALESCE($6, users.google_refresh_token)
         RETURNING *`,
        [profile.id, profile.emails?.[0]?.value, profile.displayName, profile.photos?.[0]?.value,
         accessToken, refreshToken || null]
      );
      done(null, rows[0]);
    } catch (err) { done(err); }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
    done(null, rows[0] || false);
  } catch (err) { done(err); }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth",          require("./routes/auth"));
app.use("/api/tasks",       require("./routes/tasks"));
app.use("/api/meetings",    require("./routes/meetings"));
app.use("/api/hydration",   require("./routes/hydration"));
app.use("/api/user-config", require("./routes/user-config"));
app.use("/api/calendar",   require("./routes/calendar"));

app.get("/health", (_req, res) => res.json({ ok: true }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`DHPL backend → port ${PORT}`));
