import User from "../models/user.model.js";

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }    
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error(`Error in getUserById: ${error.message}`);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};


export const getUserByEmail = async (email) => {
  try {
    if (!email) {
      throw new Error("User email is required");
    }
    return await User.findOne({ email });
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};


/**
 * Create new user
 */
export const createUser = async (userData) => {
  try {
    if (!userData || Object.keys(userData).length === 0) {
      throw new Error("User data is required");
    }

    const user = new User(userData);
    const savedUser = await user.save();

    return savedUser;
  } catch (error) {
    console.error(`Error in createUser: ${error.message}`);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Update user
 */
export const updateUser = async (userData, id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error(`Error in updateUser: ${error.message}`);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser;
  } catch (error) {
    console.error(`Error in deleteUser: ${error.message}`);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};


//place TOKEN

export const placeToken = async (userId, token) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: token },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error in placeToken:', error);
    throw new Error(`Failed to place token: ${error.message}`);
  }
};

