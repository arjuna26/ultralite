const express = require('express');
const { getSupabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { feedback_type, message, email } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Feedback message is required' });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        feedback_type: feedback_type || 'feature',
        message: message.trim(),
        email: email ? email.trim() : null,
      });

    if (error) {
      console.error('Feedback insert error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }

    res.json({ message: 'Thanks for the feedback!' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;

