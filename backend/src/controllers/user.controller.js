const User = require('../models/user.model');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        occupation: user.occupation,
        industry: user.industry,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

/**
 * @desc    Complete user profile after social login
 * @route   POST /api/users/complete-profile
 * @access  Private
 */
exports.completeProfile = async (req, res) => {
  try {
    const { uid, occupation, industry } = req.body;
    
    // Find user by Firebase UID or by authenticated user ID
    let query = {};
    if (uid) {
      query.firebaseUid = uid;
    } else if (req.user && req.user.id) {
      query._id = req.user.id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User identifier is required'
      });
    }
    
    // Find and update user
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (occupation) user.occupation = occupation;
    if (industry) user.industry = industry;
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        occupation: user.occupation,
        industry: user.industry,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing user profile'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, occupation, industry } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        fullName, 
        occupation, 
        industry,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user profile'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }
    
    // Get current user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
    });
  }
}; 