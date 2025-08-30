import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireRole, requireAnyRole } from '../middleware/auth.js';

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/incidents?status=pending (Verifier & Government)
router.get('/', requireAuth, requireAnyRole(['Verifier', 'Government']), async (req, res) => {
    try {
        const { status } = req.query;
        let query = supabase.from('incidents').select('*');
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: 'Failed to fetch incidents' });
        res.json({ incidents: data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/incidents/:id/verify (Verifier only)
router.post('/:id/verify', requireAuth, requireRole('Verifier'), async (req, res) => {
    try {
        const { notes } = req.body;
        const { id } = req.params;
        const { data, error } = await supabase.from('incidents').update({
            status: 'verified',
            verifier_id: req.user.id,
            verified_at: new Date().toISOString(),
            verifier_notes: notes || null
        }).eq('id', id).select();
        if (error) return res.status(500).json({ error: 'Verification failed' });
        res.json({ success: true, incident: data ? data[0] : null });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/incidents/:id/reject (Verifier only)
router.post('/:id/reject', requireAuth, requireRole('Verifier'), async (req, res) => {
    try {
        const { notes } = req.body;
        const { id } = req.params;
        const { data, error } = await supabase.from('incidents').update({
            status: 'rejected',
            verifier_id: req.user.id,
            verified_at: new Date().toISOString(),
            verifier_notes: notes || null
        }).eq('id', id).select();
        if (error) return res.status(500).json({ error: 'Rejection failed' });
        res.json({ success: true, incident: data ? data[0] : null });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/incidents
router.post('/', requireAuth, requireRole('Reporter'), upload.single('photo'), async (req, res) => {
    try {
        const { description, category, latitude, longitude } = req.body;
        if (!description || !category || !latitude || !longitude || !req.file) {
            return res.status(400).json({ error: 'All fields and photo are required' });
        }
        // Upload photo to Supabase Storage
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `incident_${Date.now()}.${fileExt}`;
        const { data: storageData, error: storageError } = await supabase.storage
            .from('incidents')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });
        if (storageError) return res.status(500).json({ error: 'Photo upload failed' });
        const photo_url = supabase.storage.from('incidents').getPublicUrl(fileName).data.publicUrl;
        // Insert incident row
        const { data, error } = await supabase.from('incidents').insert([
            {
                reporter_id: req.user.id,
                description,
                category,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                photo_url,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        ]);
        if (error) {
            console.error('DB insert error:', error);
            return res.status(500).json({ error: 'DB insert failed' });
        }
        console.log('Incident insert result:', data);
        if (!data || !Array.isArray(data) || !data[0]) {
            return res.json({ success: true, incident: null, message: 'Incident inserted, but no data returned.' });
        }
        res.json({ success: true, incident: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
