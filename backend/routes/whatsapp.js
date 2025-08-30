import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook endpoint for Twilio WhatsApp
router.post('/webhook', async (req, res) => {
    // Debug: log incoming body
    console.log('Incoming WhatsApp webhook:', req.body);
    const { From, Body, Timestamp, NumMedia, MediaUrl0, MediaContentType0, ...rest } = req.body;
    if (!From) {
        console.error('Missing From field in WhatsApp webhook:', req.body);
        return res.status(400).json({ error: "Missing 'From' field in request" });
    }
    // If image is present, store its URL
    let photo_url = null;
    if (NumMedia && parseInt(NumMedia) > 0 && MediaUrl0) {
        photo_url = MediaUrl0;
    }
    // Store raw message
    const { data, error } = await supabase
        .from('whatsapp_reports')
        .insert([
            {
                from_phone: From,
                body: Body,
                timestamp: Timestamp || new Date().toISOString(),
                raw: JSON.stringify(req.body),
                parsed_fields: null,
                photo_url // new field for image URL if present
            }
        ]);
    if (error) {
        console.error('Supabase insert error:', error.message);
        return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
});

export default router;
