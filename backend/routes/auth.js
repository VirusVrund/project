import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Register
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    // Default role is Reporter if not provided
    const userRole = role || 'Reporter';
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { role: userRole },
        email_confirm: true
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data.user });
});

// Login (handled on frontend via Supabase client)
// This endpoint is optional; frontend should use supabase.auth.signInWithPassword

// Get current user info (requires auth)
import { requireAuth } from '../middleware/auth.js';
router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

export default router;
