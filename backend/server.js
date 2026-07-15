const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (required for Vercel/Reverse proxies & rate limiter)
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

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'JobLink Secure Backend Server is running successfully!',
    status: 'healthy',
    version: '1.0.0'
  });
});


// Endpoint: Send beautiful HTML email with 8-digit OTP using standard SMTP Transporter (Nodemailer)
app.post('/api/auth/send-otp', async (req, res, next) => {
  const { email, phone } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  // Check if phone number is already registered
  if (phone && supabaseAdmin) {
    try {
      const { data: existingUser, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .limit(1)
        .maybeSingle(); // maybeSingle returns null if 0 rows, instead of throwing PGRST116

      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          error: 'already_registered_phone', 
          message: 'This phone number is already registered to another account. Please sign in or use a different number.' 
        });
      }
    } catch (err) {
      console.error("Supabase phone check error:", err);
    }
  }

  // Check if email is already registered
  if (email && supabaseAdmin) {
    try {
      // 1. Check in profiles table
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1)
        .maybeSingle();

      if (existingProfile) {
        return res.status(409).json({ 
          success: false, 
          error: 'already_registered_email', 
          message: 'This email address is already registered. Please sign in or use a different email.' 
        });
      }

      // 2. Check in auth users list
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      if (listData?.users) {
        const emailExists = listData.users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
        if (emailExists) {
          return res.status(409).json({
            success: false,
            error: 'already_registered_email',
            message: 'This email address is already registered. Please sign in or use a different email.'
          });
        }
      }
    } catch (err) {
      console.error("Supabase email duplicate check error:", err);
    }
  }

  let otpCode = String(Math.floor(10000000 + Math.random() * 90000000));
  
  // Test Account Bypass for Google Play Reviewers
  if (email && email.toLowerCase().trim() === 'reviewer@bkj.com') {
    otpCode = '12345678';
    console.log(`[TEST ACCOUNT BYPASS] Sending static OTP ${otpCode} to ${email}`);
    return res.json({ success: true, otp: otpCode, delivered: true });
  }
  try {
    
    // SMTP credentials from env
    const smtpHost = process.env.SMTP_HOST || 'smtp.resend.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'resend';
    const smtpPass = process.env.SMTP_PASS || 're_BWYnYRSf_7LMDHxArzSTmuoYnGeeJ73YS';
    const smtpFrom = process.env.SMTP_FROM || 'BKJ App <onboarding@resend.dev>';
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    // Create transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #F3F4F6;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E7EB;
    }
    .header {
      background-color: #1E293B;
      padding: 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #E8F542;
      letter-spacing: -1px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      color: #4B5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .otp-box {
      background-color: #FEF9C3;
      border: 2px dashed #EAB308;
      border-radius: 14px;
      padding: 16px 24px;
      display: inline-block;
      margin-bottom: 30px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: 6px;
    }
    .footer {
      background-color: #F9FAFB;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #F3F4F6;
      font-size: 11px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BKJ</div>
    </div>
    <div class="content">
      <div class="title">Verify Your Email Address</div>
      <div class="text">
        Welcome to BKJ! We're excited to help you find your next premium opportunity. Please use the 8-digit verification code below to activate your account:
      </div>
      <div class="otp-box">
        <span class="otp-code">${otpCode}</span>
      </div>
      <div class="text" style="font-size: 12px; color: #9CA3AF; margin-bottom: 0;">
        If you did not request this code, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 BKJ Professional Marketplace. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    // Send email via SMTP
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'BKJ App - Email Verification Code 🔑',
      html: emailHtml
    });

    console.log(`✉️ Verification SMTP OTP sent to ${email} successfully!`);
    res.json({ success: true, otp: otpCode, delivered: true });

  } catch (err) {
    console.error('Error in send-otp route using SMTP:', err);
    
    // In development mode, fallback to returning the OTP in the response to prevent blocking tests.
    if (process.env.NODE_ENV !== 'production' || !process.env.NODE_ENV) {
      console.log('\n==================================================');
      console.log(`🔑 [DEV ONLY] EMAIL OTP FOR ${email}: ${otpCode}`);
      console.log('==================================================\n');
      
      return res.json({ 
        success: true, 
        otp: otpCode, 
        delivered: false, 
        warning: `Email failed: ${err.message || 'SMTP Error'}. OTP returned in response for development.` 
      });
    }
    
    res.status(500).json({ success: false, error: err.message || 'Failed to send verification email via SMTP' });
  }
});

// Endpoint: Send 8-digit OTP for Forgot Password
app.post('/api/auth/send-reset-otp', async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase connection not initialized on backend.' });
  }

  try {
    // 1. Verify user exists
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const targetUser = listData.users?.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'No user account found with this email address.' });
    }

    // 2. Generate OTP
    let otpCode = String(Math.floor(10000000 + Math.random() * 90000000));
    
    // Test Account Bypass for Google Play Reviewers
    if (email.toLowerCase().trim() === 'reviewer@bkj.com') {
      otpCode = '12345678';
      console.log(`[TEST ACCOUNT BYPASS] Sending static Reset OTP ${otpCode} to ${email}`);
      return res.json({ success: true, otp: otpCode, delivered: true });
    }
    
    // SMTP credentials from env
    const smtpHost = process.env.SMTP_HOST || 'smtp.resend.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'resend';
    const smtpPass = process.env.SMTP_PASS || 're_BWYnYRSf_7LMDHxArzSTmuoYnGeeJ73YS';
    const smtpFrom = process.env.SMTP_FROM || 'BKJ App <onboarding@resend.dev>';
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    // Create transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Passcode</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #F3F4F6;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #E5E7EB;
    }
    .header {
      background-color: #1E293B;
      padding: 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #E8F542;
      letter-spacing: -1px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      color: #4B5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .otp-box {
      background-color: #FEF9C3;
      border: 2px dashed #EAB308;
      border-radius: 14px;
      padding: 16px 24px;
      display: inline-block;
      margin-bottom: 30px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: 6px;
    }
    .footer {
      background-color: #F9FAFB;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #F3F4F6;
      font-size: 11px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BKJ</div>
    </div>
    <div class="content">
      <div class="title">Reset Your Passcode</div>
      <div class="text">
        You requested to reset your security passcode. Please use the 8-digit OTP verification code below to authorize this request:
      </div>
      <div class="otp-box">
        <span class="otp-code">${otpCode}</span>
      </div>
      <div class="text" style="font-size: 12px; color: #9CA3AF; margin-bottom: 0;">
        If you did not make this request, you can safely ignore this email. Your passcode will remain unchanged.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 BKJ Professional Marketplace. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    // Send email via SMTP
    await transporter.sendMail({
      from: smtpFrom,
      to: email.trim(),
      subject: 'BKJ App - Passcode Reset Code 🔑',
      html: emailHtml
    });

    console.log(`✉️ Reset password SMTP OTP sent to ${email} successfully!`);
    res.json({ success: true, otp: otpCode, delivered: true });

  } catch (err) {
    console.error('Error in send-reset-otp route:', err);
    
    // In development mode, fallback to returning the OTP in the response
    if (process.env.NODE_ENV !== 'production' || !process.env.NODE_ENV) {
      const otpCode = String(Math.floor(10000000 + Math.random() * 90000000));
      console.log('\n==================================================');
      console.log(`🔑 [DEV ONLY] RESET OTP FOR ${email}: ${otpCode}`);
      console.log('==================================================\n');
      
      return res.json({ 
        success: true, 
        otp: otpCode, 
        delivered: false, 
        warning: `Email failed: ${err.message || 'SMTP Error'}. OTP returned in response for development.` 
      });
    }
    
    res.status(500).json({ success: false, error: err.message || 'Failed to send reset email.' });
  }
});

// Endpoint: Update password via admin privileges
app.post('/api/auth/update-password', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and new password are required.' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase connection not initialized on backend.' });
  }

  try {
    // 1. Get user by email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = listData.users?.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'No user account found with this email address.' });
    }

    // 2. Update password directly via admin panel
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password: password
    });
    if (updateError) throw updateError;

    console.log(`🔑 Passcode updated successfully for user: ${email}`);
    res.json({ success: true, message: 'Passcode updated successfully.' });

  } catch (err) {
    console.error('Error in update-password route:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update passcode.' });
  }
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

// Endpoint: Delete account completely (for Play Store Compliance)
app.post('/api/auth/delete-account', async (req, res, next) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Supabase connection not initialized on backend.' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required.' });
  }

  try {
    console.log(`🗑️ [DELETE ACCOUNT] Initiating permanent account deletion for user: ${userId}`);

    // 1. Delete applications submitted by user
    await supabaseAdmin.from('applications').delete().eq('applicant_id', userId);

    // 2. Delete likes (bookmarks) related to user
    await supabaseAdmin.from('likes').delete().eq('user_id', userId);
    await supabaseAdmin.from('likes').delete().eq('owner_id', userId);

    // 2.5. Delete reports related to the user (filed by them or against their jobs)
    try {
      // Delete reports filed by this user
      await supabaseAdmin.from('job_reports').delete().eq('reporter_id', userId);
      
      // Get user's jobs to delete reports filed against those jobs
      const { data: userJobs } = await supabaseAdmin.from('jobs').select('id').eq('posted_by', userId);
      if (userJobs && userJobs.length > 0) {
        const jobIds = userJobs.map(j => j.id);
        await supabaseAdmin.from('job_reports').delete().in('job_id', jobIds);
      }
      console.log(`🗑️ [DELETE ACCOUNT] Deleted reports related to user: ${userId}`);
    } catch (reportErr) {
      console.warn("⚠️ Failed to manually delete job reports (non-fatal):", reportErr.message);
    }

    // 3. Delete jobs posted by user
    await supabaseAdmin.from('jobs').delete().eq('posted_by', userId);

    // 4. Delete user profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 5. Delete Supabase Auth record using Admin SDK
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn(`⚠️ Auth record deletion failed or already deleted: ${authError.message}`);
    }

    console.log(`✅ [DELETE ACCOUNT] Account and all related data successfully deleted for user: ${userId}`);
    res.json({ success: true, message: 'Account and associated data deleted successfully.' });

  } catch (err) {
    console.error('Error in delete-account route:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete account.' });
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

// Start Server locally if not running as a serverless function on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 JobLink Secure Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

module.exports = app;
