import './loadEnv.js';
import authRoutes from './routes/auth.js';
import incidentsRoutes from './routes/incidents.js';
import whatsappRoutes from './routes/whatsapp.js';
import whatsappParseRoutes from './routes/whatsapp_parse.js';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase connection (for reference, not used directly here)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});


// ✅ Mount Auth routes
app.use('/api/auth', authRoutes);

// ✅ Mount Incidents routes
app.use('/api/incidents', incidentsRoutes);

// ✅ Mount WhatsApp webhook route
app.use('/api/whatsapp', whatsappRoutes);

// ✅ Mount WhatsApp parse route (for Gemini integration)
app.use('/api/whatsapp', whatsappParseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
