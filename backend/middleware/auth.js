import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify JWT and attach user info to req
export async function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Malformed token' });

    // Validate JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // Fetch full user object (with user_metadata) using Admin API
    const { data: { user: fullUser }, error: adminError } = await supabase.auth.admin.getUserById(user.id);
    if (adminError || !fullUser) return res.status(401).json({ error: 'User not found (admin)' });
    req.user = fullUser;
    next();
}

// Middleware to check user role
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || !req.user.user_metadata || req.user.user_metadata.role !== role) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
}

// Middleware to check multiple roles
export function requireAnyRole(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.user_metadata || !roles.includes(req.user.user_metadata.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
}
