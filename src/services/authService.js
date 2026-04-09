import { supabase } from '../config/supabase';

// SIGNUP - Create user with role
export const signupUser = async (email, password, role) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Insert user with role in users table
    const { error: userError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email,
      role: role, // 'student', 'company', 'tnp'
      created_at: new Date(),
    }).select();

    if (userError) throw userError;

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// LOGIN
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// LOGOUT
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    return null;
  }
};

// GET USER ROLE
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role;
  } catch (error) {
    return null;
  }
};

// CREATE STUDENT PROFILE
export const createStudentProfile = async (userId, studentData) => {
  try {
    const { data, error } = await supabase.from('students').insert({
      user_id: userId,
      name: studentData.name,
      cgpa: studentData.cgpa,
      branch: studentData.branch,
      skills: studentData.skills || [],
      resume_url: studentData.resume_url || null,
    }).select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// CREATE COMPANY PROFILE
export const createCompanyProfile = async (userId, companyData) => {
  try {
    const { data, error } = await supabase.from('companies').insert({
      user_id: userId,
      company_name: companyData.company_name,
      description: companyData.description || '',
      location: companyData.location || '',
    }).select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET STUDENT PROFILE
export const getStudentProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// GET COMPANY PROFILE
export const getCompanyProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// UPDATE STUDENT PROFILE
export const updateStudentProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// PASSWORD RESET
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE PASSWORD
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
