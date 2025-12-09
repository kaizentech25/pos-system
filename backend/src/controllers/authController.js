import User from '../models/User.js';

// Simple password comparison (in production, use bcrypt)
const comparePassword = (inputPassword, storedPassword) => {
  return inputPassword === storedPassword;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ name, email, password, role: role || 'cashier' });
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) user.role = role;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
