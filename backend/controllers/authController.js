const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    // Validations
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    // Email validation: ends with @gmail.com
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email must be a valid @gmail.com address' });
    }

    // Phone validation: +91 followed by 10 digits
    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must start with +91 followed by 10 digits' });
    }

    // Password validation: Strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Strong password must contain atleast 1 UpperCase,LowerCase,atleast 1 Special Characters and numbers' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      phoneNumber: phoneNumber,
    });

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        authProvider: user.authProvider || 'local'
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Google-only users won't have a password
    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google login. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        authProvider: user.authProvider || 'local'
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      // Store the full URL or relative path
      const profilePicUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      user.profilePicture = profilePicUrl;
    } else if (req.body.profilePicture) {
        user.profilePicture = req.body.profilePicture;
    }

    if (req.body.phoneNumber) {
      user.phoneNumber = req.body.phoneNumber;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber || '',
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};

const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    console.log('Google auth - email:', email);

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register new Google user (no password needed)
      user = await User.create({
        name,
        email,
        role: 'user',
        profilePicture: picture || '',
        authProvider: 'google',
      });
      console.log('Google auth - new user created:', email);
    } else {
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        await user.save();
      }
      console.log('Google auth - existing user logged in:', email);
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        authProvider: user.authProvider || 'google'
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    console.error('Google auth stack:', error.stack);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Google accounts cannot change password directly' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Strong password must contain atleast 1 UpperCase,LowerCase,atleast 1 Special Characters and numbers' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password update failed' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Please use Google login for this account' });
    }

    // Basic implementation: allow direct reset or send a mock link
    // For this task, we'll allow a simplified reset or just confirm the user exists
    res.json({ message: 'Reset link sent to your email (Mock)', email });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password request failed' });
  }
};

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Strong password must contain atleast 1 UpperCase,LowerCase,atleast 1 Special Characters and numbers' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Password reset failed' });
    }
}

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  googleLogin,
  changePassword,
  forgotPassword,
  resetPassword
};
