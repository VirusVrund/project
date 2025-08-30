import express from 'express';
import { createClient } from '@supabase/supabase-js';
// import fetch from 'node-fetch'; // Uncomment if using node-fetch for Gemini API

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/whatsapp/parse-unprocessed
router.post('/parse-unprocessed', async (req, res) => {
    try {
        // 1. Fetch unprocessed WhatsApp messages
        const { data: messages, error } = await supabase
            .from('whatsapp_reports')
            .select('id, body')
            .is('parsed_fields', null)
            .limit(10); // Limit for batch processing
        if (error) return res.status(500).json({ error: error.message });
        if (!messages.length) return res.json({ message: 'No unprocessed messages.' });

        // 2. Prepare data for Gemini
        const geminiInputs = messages.map(msg => ({
            id: msg.id,
            prompt: `Extract incident details from this WhatsApp message: "${msg.body}". Return JSON with fields: description, category, location, date, and any other relevant info.`
        }));

        // 3. (Placeholder) Send to Gemini API for parsing
        // const geminiResults = await Promise.all(geminiInputs.map(async input => {
        //   // Replace with actual Gemini API call
        //   const response = await fetch('https://gemini-api-endpoint', { ... });
        //   return { id: input.id, parsed: await response.json() };
        // }));

        // 4. (For now) Just return the prompts for review
        res.json({ geminiInputs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/whatsapp/process-parsed
// Body: { id, parsed_fields }
router.post('/process-parsed', async (req, res) => {
    const { id, parsed_fields } = req.body;
    if (!id || !parsed_fields) {
        return res.status(400).json({ error: 'id and parsed_fields required' });
    }
    try {
        // 1. Update whatsapp_reports row
        const { error: updateError } = await supabase
            .from('whatsapp_reports')
            .update({ parsed_fields })
            .eq('id', id);
        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        // 2. Insert into incidents table (map fields as needed)
        // Example: description, category, location, date, photo_url
        const { description, category, location, date, photo_url } = parsed_fields;
        const { error: insertError } = await supabase
            .from('incidents')
            .insert([
                {
                    description: description || '',
                    category: category || '',
                    latitude: location?.latitude || null,
                    longitude: location?.longitude || null,
                    created_at: date || new Date().toISOString(),
                    photo_url: photo_url || null,
                    status: 'pending',
                    source: 'whatsapp'
                }
            ]);
        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
