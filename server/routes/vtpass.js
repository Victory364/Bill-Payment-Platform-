import { Router } from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/vtpass/service-variations?serviceID=...
router.get('/service-variations', async (req, res) => {
  try {
    const { serviceID } = req.query;
    if (!serviceID) {
      return res.status(400).json({ error: 'serviceID query parameter is required.' });
    }

    const url = `https://vtpass.com/api/service-variations?serviceID=${encodeURIComponent(serviceID)}`;
    const response = await axios.get(url);
    const data = response.data;

    // Check if VTpass returned a valid structure
    if (data && data.content && (data.content.variations || data.content.varations)) {
      return res.json(data);
    }

    return res.status(400).json({ 
      error: data?.response_description || 'Failed to retrieve service variations from VTpass.' 
    });
  } catch (err) {
    console.error('VTpass variations fetch error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to communicate with Live VTpass API.' });
  }
});

export default router;
