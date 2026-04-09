import { supabase } from '../config/supabase';
import { notifyApplicationStatusUpdate } from './emailService';

// GET ALL JOB DRIVES (approved only for students)
export const getJobDrives = async (filters = {}) => {
  try {
    let query = supabase.from('job_drives').select('*, companies(company_name, location)');

    // Only show approved jobs to students
    if (filters.onlyApproved) {
      query = query.eq('status', 'approved');
    }

    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET SINGLE JOB DRIVE
export const getJobDrive = async (jobId) => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .select('*, companies(company_name, location)')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// CREATE JOB DRIVE (company only)
export const createJobDrive = async (companyId, jobData) => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .insert({
        company_id: companyId,
        title: jobData.title,
        description: jobData.description,
        package: jobData.package,
        location: jobData.location,
        eligibility: jobData.eligibility, // min CGPA
        deadline: jobData.deadline,
        status: 'pending', // pending, approved, rejected
        created_at: new Date(),
      })
      .select(); // Return the inserted data

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE JOB DRIVE (company only)
export const updateJobDrive = async (jobId, updates) => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// APPLY FOR JOB (student only)
export const applyForJob = async (studentId, jobId) => {
  try {
    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId)
      .eq('job_id', jobId)
      .single();

    if (existing) {
      return { success: false, error: 'Already applied for this job' };
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        student_id: studentId,
        job_id: jobId,
        status: 'applied',
        applied_at: new Date(),
      })
      .select(); // Return the inserted data

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET STUDENT APPLICATIONS
export const getStudentApplications = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        applied_at,
        job_drives(id, title, package, company_id, companies(company_name))
      `)
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    console.log('Fetched applications:', data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET JOB APPLICANTS (company only)
export const getJobApplicants = async (jobId) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        students(id, name, cgpa, branch, skills, resume_url, users(email))
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE APPLICATION STATUS (company only)
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date() })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // Get application details for email notification
    const { data: applicationData, error: appError } = await supabase
      .from('applications')
      .select(
        `
        id,
        students(name, users(email)),
        job_drives(title, companies(company_name))
      `
      )
      .eq('id', applicationId)
      .single();

    if (appError) throw appError;

    // Send email notification to student
    if (applicationData) {
      const studentEmail = applicationData.students.users.email;
      const studentName = applicationData.students.name;
      const jobTitle = applicationData.job_drives.title;
      const companyName = applicationData.job_drives.companies.company_name;

      await notifyApplicationStatusUpdate(
        studentEmail,
        studentName,
        jobTitle,
        companyName,
        status
      );

      console.log(`📧 Email sent to ${studentName} about ${status} status`);
    }

    return { success: true, data: applicationData };
  } catch (error) {
    console.error('Error updating application status:', error.message);
    return { success: false, error: error.message };
  }
};

// GET COMPANY JOB DRIVES
export const getCompanyJobDrives = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET ELIGIBLE STUDENTS FOR JOB (use in Edge Function)
export const getEligibleStudents = async (minCGPA) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('user_id, name, cgpa, branch, users(email)')
      .gte('cgpa', minCGPA);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE APPLICATION (admin/tnp only)
export const deleteApplication = async (applicationId) => {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
