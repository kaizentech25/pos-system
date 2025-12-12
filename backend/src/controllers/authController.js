import User from '../models/User.js';

export const login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ success: false, message: 'User ID and password are required' });
    }

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      user_id: user.user_id,
      company_name: user.company_name,
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
    const { name, user_id, password, company_name, role } = req.body;

    if (!name || !user_id || !password || !company_name) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ name, user_id, password, company_name, role: role || 'cashier' });
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      user_id: user.user_id,
      company_name: user.company_name,
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
    const { name, user_id, password, company_name, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (user_id) user.user_id = user_id;
    if (password) user.password = password;
    if (company_name) user.company_name = company_name;
    if (role) user.role = role;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      user_id: user.user_id,
      company_name: user.company_name,
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
