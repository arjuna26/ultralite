const express = require('express');
const { getSupabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

router.post('/', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !validateEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
  
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('waitlist')
        .insert({ email: email.toLowerCase() });
  
      if (error) {
        if (error.code === '23505') { // unique violation
          return res.status(400).json({ error: 'Email already registered' });
        }
        throw error;
      }
  
      res.json({ message: 'Thanks! We\'ll notify you at launch.' });
    } catch (error) {
      console.error('Waitlist error:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

module.exports = router;