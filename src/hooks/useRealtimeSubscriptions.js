import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// Hook for real-time job drive updates
export const useRealtimeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to job_drives table changes
    const subscription = supabase
      .channel('public:job_drives')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_drives',
        },
        (payload) => {
          console.log('Job update:', payload);
          // Handle real-time updates
          if (payload.eventType === 'INSERT') {
            setJobs((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((job) => (job.id === payload.new.id ? payload.new : job))
            );
          } else if (payload.eventType === 'DELETE') {
            setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { jobs, loading };
};

// Hook for real-time application updates
export const useRealtimeApplications = (jobId = null) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to applications table changes
    const subscription = supabase
      .channel('public:applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: jobId ? `job_id=eq.${jobId}` : undefined,
        },
        (payload) => {
          console.log('Application update:', payload);
          if (payload.eventType === 'INSERT') {
            setApplications((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setApplications((prev) =>
              prev.map((app) =>
                app.id === payload.new.id ? payload.new : app
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setApplications((prev) =>
              prev.filter((app) => app.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setLoading(false);
    return () => {
      subscription.unsubscribe();
    };
  }, [jobId]);

  return { applications, loading };
};

export default useRealtimeJobs;
