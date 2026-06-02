const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// SENTRY INITIALIZATION (Error & Performance tracking)
// ==========================================
if (process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('placeholder')) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });

  // RequestHandler creates a separate execution context for each request
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates trace spans for transaction performance
  app.use(Sentry.Handlers.tracingHandler());
  console.log("🎯 Sentry initialized successfully on JobLink Backend!");
}

// ==========================================
// SUPABASE CLIENT (Admin Mode)
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceKey && !supabaseServiceKey.includes('placeholder')) {
  // Service Role Key is used here to bypass RLS for administrative actions
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log("⚡ Supabase Admin client loaded successfully!");
} else {
  console.warn("⚠️ Supabase Credentials missing or placeholder in backend/.env!");
}

// ==========================================
// PRODUCTION MIDDLEWARE & SECURITY
// ==========================================
// 1. Set Security Headers
app.use(helmet());

// 2. Enable CORS with production configuration
const allowedOrigins = [
  'http://localhost:19006', // Expo web local dev
  'http://localhost:3000',  // React web admin panel local dev
  'https://joblink-admin.vercel.app' // Custom production web client
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by CORS policy'), false);
    }
  },
  credentials: true
}));

// 3. JSON & URL Encoded parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request Logging
app.use(morgan('dev'));

// 5. Rate Limiting (Prevents DDoS and brute-force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  }
});
app.use('/api/', limiter);

// ==========================================
// API ROUTES
// ==========================================

// Public Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Admin Route: Get app summary statistics (requires Supabase Admin permissions)
app.get('/api/admin/stats', async (req, res, next) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase connection not initialized on backend." });
  }

  try {
    // Use service role key to fetch metrics bypassing standard client limitations
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: jobsCount, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    const { count: applicationsCount, error: appsError } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true });

    if (usersError || jobsError || appsError) {
      throw new Error("Failed to load statistics from database tables.");
    }

    res.json({
      success: true,
      data: {
        totalUsers: usersCount || 0,
        totalJobs: jobsCount || 0,
        totalApplications: applicationsCount || 0,
        fetchedAt: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
});

// Admin Route: Delete a job directly bypassing standard limits (Moderation API)
app.delete('/api/admin/jobs/:id', async (req, res, next) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase Admin connection missing." });
  }

  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Job listings with ID: ${id} successfully deleted by administrator.`
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
// Sentry error handler must be before any other error middleware
if (process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('placeholder')) {
  app.use(Sentry.Handlers.errorHandler());
}

// Standard fallback error handler
app.use((err, req, res, next) => {
  console.error("Backend Error Caught:", err.message);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An internal server error occurred",
    sentryEventId: res.sentry // If Sentry is active, provides error tag link
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 JobLink Secure Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
