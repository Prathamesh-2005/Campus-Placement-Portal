import { supabase } from '../config/supabase';
import { notifyJobApproved } from './emailService';

// GET ALL PENDING JOB DRIVES (TNP only)
export const getPendingJobDrives = async () => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .select('*, companies(company_name, location)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// APPROVE JOB DRIVE (TNP only)
export const approveJobDrive = async (jobId) => {
  try {
    // Update job status to approved
    const { data: jobData, error: updateError } = await supabase
      .from('job_drives')
      .update({ status: 'approved', approved_at: new Date() })
      .eq('id', jobId)
      .select('title, deadline, eligibility, companies(company_name)')
      .single();

    if (updateError) throw updateError;

    // Get eligible students (CGPA >= job eligibility)
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('user_id, name, cgpa, users(email)')
      .gte('cgpa', jobData.eligibility);

    if (studentError) throw studentError;

    // Send email to all eligible students
    if (students && students.length > 0) {
      console.log(`Sending job approval emails to ${students.length} eligible students...`);
      
      const emailPromises = students.map((student) =>
        notifyJobApproved(
          student.users.email,
          student.name,
          jobData.title,
          jobData.companies.company_name,
          jobData.deadline
        )
      );

      const emailResults = await Promise.all(emailPromises);
      console.log(`Emails sent: ${emailResults.filter(r => r.success).length}/${emailResults.length}`);
    }

    return { success: true, data: jobData, emailsSent: students?.length || 0 };
  } catch (error) {
    console.error('Error approving job:', error.message);
    return { success: false, error: error.message };
  }
};

// REJECT JOB DRIVE (TNP only)
export const rejectJobDrive = async (jobId, reason) => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date(),
      })
      .eq('id', jobId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET ALL JOB DRIVES (for TNP monitoring)
export const getAllJobDrives = async () => {
  try {
    const { data, error } = await supabase
      .from('job_drives')
      .select('*, companies(company_name, location)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// GET STATISTICS FOR TNP DASHBOARD
export const getAdminStatistics = async () => {
  try {
    // Total users by role
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('role');

    const roleStats = allUsers?.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {}) || {};

    // Job drive stats
    const { data: jobStats, error: jobError } = await supabase
      .from('job_drives')
      .select('status');

    const jobCounts = jobStats?.reduce(
      (acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
      },
      {}
    ) || {};

    // Application stats - NOW CORRECTLY COUNTING
    const { data: appStats, error: appError } = await supabase
      .from('applications')
      .select('status');

    console.log('Application Stats:', appStats);

    const applicationCounts = appStats?.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      {}
    ) || {};

    return {
      success: true,
      data: {
        users: roleStats,
        jobs: jobCounts,
        applications: applicationCounts,
      },
    };
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return { success: false, error: error.message };
  }
};

// MONITOR SYSTEM ACTIVITY
export const getRecentActivity = async (limit = 20) => {
  try {
    // Get recent applications
    const { data: recentApps } = await supabase
      .from('applications')
      .select(`
        id,
        applied_at,
        students(name),
        job_drives(title, companies(company_name))
      `)
      .order('applied_at', { ascending: false })
      .limit(limit);

    // Get recent job drives
    const { data: recentJobs } = await supabase
      .from('job_drives')
      .select('id, title, status, created_at, companies(company_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    return {
      success: true,
      data: {
        applications: recentApps || [],
        jobDrives: recentJobs || [],
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
