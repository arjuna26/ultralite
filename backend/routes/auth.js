const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { getSupabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Minimum 8 characters, at least one letter and one number
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
};

const validateNickname = (nickname) => {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: 'Nickname is required' };
  }
  if (nickname.length < 2) {
    return { valid: false, error: 'Nickname must be at least 2 characters' };
  }
  if (nickname.length > 50) {
    return { valid: false, error: 'Nickname must be less than 50 characters' };
  }
  // Only allow letters, numbers, spaces, underscores, and hyphens
  if (!/^[a-zA-Z0-9\s_-]+$/.test(nickname)) {
    return { valid: false, error: 'Nickname can only contain letters, numbers, spaces, underscores, and hyphens' };
  }
  return { valid: true };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Use email prefix as default nickname if not provided
    const userNickname = nickname?.trim() || email.split('@')[0];

    const nicknameValidation = validateNickname(userNickname);
    if (!nicknameValidation.valid) {
      return res.status(400).json({ error: nicknameValidation.error });
    }

    // Use Supabase Auth
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        nickname: userNickname
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      throw error;
    }

    const token = jwt.sign({ userId: data.user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        nickname: userNickname
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const supabase = getSupabaseAdmin();
    
    // Verify credentials with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT for API access
    const token = jwt.sign({ userId: data.user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        nickname: data.user.user_metadata?.nickname || email.split('@')[0]
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.getUserById(req.user.userId);

    if (error || !data.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: data.user.id,
      email: data.user.email,
      nickname: data.user.user_metadata?.nickname || data.user.email.split('@')[0],
      created_at: data.user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { nickname } = req.body;

    if (nickname !== undefined) {
      const nicknameValidation = validateNickname(nickname);
      if (!nicknameValidation.valid) {
        return res.status(400).json({ error: nicknameValidation.error });
      }
    }

    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.updateUserById(req.user.userId, {
      user_metadata: { nickname }
    });

    if (error) {
      throw error;
    }

    res.json({
      id: data.user.id,
      email: data.user.email,
      nickname: data.user.user_metadata?.nickname,
      created_at: data.user.created_at
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const supabase = getSupabaseAdmin();
    
    // Get user to verify current password
    const { data: userData } = await supabase.auth.admin.getUserById(req.user.userId);
    
    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword
    });

    if (signInError) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const { error } = await supabase.auth.admin.updateUserById(req.user.userId, {
      password: newPassword
    });

    if (error) {
      throw error;
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// OAuth callback - exchange Supabase session for our JWT
router.post('/oauth/callback', async (req, res) => {
  try {
    const { access_token, user_id } = req.body;

    if (!access_token || !user_id) {
      return res.status(400).json({ error: 'Access token and user ID are required' });
    }

    const supabase = getSupabaseAdmin();

    // Verify the access token and get the user it belongs to
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser(access_token);

    // Verify token is valid AND belongs to the claimed user_id
    if (userError || !supabaseUser || supabaseUser.id !== user_id) {
      return res.status(401).json({ error: 'Invalid or expired OAuth session' });
    }

    // Get user metadata (nickname, etc.)
    const nickname = supabaseUser.user_metadata?.nickname || 
                     supabaseUser.user_metadata?.full_name || 
                     supabaseUser.email?.split('@')[0] || 
                     'User';

    // Generate our JWT for API access
    const token = jwt.sign({ userId: supabaseUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        nickname: nickname
      },
      token
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to complete OAuth sign in' });
  }
});

module.exports = router;
