# 📧 CampusHire - Gmail SMTP Edge Function Setup

## ✅ Deployed Function Endpoint

Your email function is deployed and ready to use:

```
https://etaszxvpwsuufarabiub.supabase.co/functions/v1/send-mail
```

This endpoint is automatically called by `src/services/emailService.js` when you use:

- `sendEmail()`
- `notifyApplicationStatusUpdate()`
- `notifyJobApproved()`
- `sendCustomEmail()`

---

## ✅ Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Find **App passwords** (check under "Security")
5. Select **Mail** → **Windows Computer** (or your device)
6. Google will generate a 16-character password (copy this!)

**Example App Password:** `pdsm fzox ikfa stil`

### Step 2: ✅ Edge Function Already Deployed

Your `send-mail` function has been deployed to Supabase. No additional deployment needed!

If you need to redeploy or update the function:

```
1. Navigate to Supabase Dashboard
2. Go to Edge Functions (left sidebar)
3. Find the `send-mail` function
4. Update the code if needed
5. Click "Deploy"
```

### Step 3: ✅ Verify Environment Variables

Your Gmail credentials should already be set in Supabase:

**Supabase Dashboard → Settings → Environment Variables**

Current values:

```
GMAIL_USER = coderprathamesh@gmail.com
GMAIL_PASS = pdsm fzox ikfa stil
```

If you need to update them:

1. Go to **Settings** → **Environment Variables**
2. Update the values
3. Edge Function will automatically use the new credentials

### Step 4: Test the Function

Use `curl` in your terminal to test:

```bash
curl -X POST https://etaszxvpwsuufarabiub.supabase.co/functions/v1/send-mail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "userName": "Test User",
    "subject": "Test Email",
    "message": "This is a test email from CampusHire",
    "jobTitle": "Software Engineer",
    "companyName": "Tech Corp",
    "status": "application_status"
  }'
```

Expected Response:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "id": "..."
}
```

Or test from Supabase Dashboard:

1. Go to **Edge Functions** → **send-mail** → **Invocations**
2. Use the JSON payload above

Should return:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "id": "..."
}
```

---

## 📝 Usage in Your App

### Send Application Status Update

```javascript
import { notifyApplicationStatusUpdate } from "@/services/emailService";

// When company updates application status
const result = await notifyApplicationStatusUpdate(
  "student@example.com", // Student email
  "Raj Kumar", // Student name
  "Software Engineer", // Job title
  "Tech Corp", // Company name
  "selected", // Status: applied, shortlisted, rejected, selected
);

if (result.success) {
  console.log("✅ Email sent!");
} else {
  console.log("❌ Error:", result.error);
}
```

### Send Job Approved Notification

```javascript
import { notifyJobApproved } from "@/services/emailService";

// When TNP approves a job drive
const result = await notifyJobApproved(
  "student@example.com",
  "Raj Kumar",
  "Full Stack Developer",
  "Tech Corp",
  "2026-06-30", // Deadline
);
```

### Send Custom Email

```javascript
import { sendCustomEmail } from "@/services/emailService";

const result = await sendCustomEmail(
  "user@example.com",
  "John Doe",
  "Welcome to CampusHire",
  "We are excited to have you on board!",
);
```

---

## 🔧 Integration in Services

### Update jobService.js - Add email trigger when company updates status

```javascript
// In updateApplicationStatus function
export const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    // Update in database
    const { data, error } = await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date() })
      .eq("id", applicationId);

    if (error) throw error;

    // Get application details for email
    const { data: appData } = await supabase
      .from("applications")
      .select(
        `
        students(name, users(email)),
        job_drives(title, companies(company_name))
      `,
      )
      .eq("id", applicationId)
      .single();

    // Send email notification
    const { notifyApplicationStatusUpdate } = await import("./emailService.js");
    await notifyApplicationStatusUpdate(
      appData.students.users.email,
      appData.students.name,
      appData.job_drives.title,
      appData.job_drives.companies.company_name,
      newStatus,
    );

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### Update tnpService.js - Add email trigger when job is approved

```javascript
// In approveJobDrive function
export const approveJobDrive = async (jobId) => {
  try {
    // Approve job
    const { data, error } = await supabase
      .from("job_drives")
      .update({ status: "approved", approved_at: new Date() })
      .eq("id", jobId);

    if (error) throw error;

    // Get job details
    const { data: jobData } = await supabase
      .from("job_drives")
      .select(
        `
        title,
        deadline,
        companies(company_name)
      `,
      )
      .eq("id", jobId)
      .single();

    // Get eligible students
    const { data: eligibleStudents } = await supabase
      .from("students")
      .select("name, users(email)")
      .gte("cgpa", jobData.eligibility);

    // Send emails to all eligible students
    const { notifyJobApproved } = await import("./emailService.js");
    const emailPromises = eligibleStudents.map((student) =>
      notifyJobApproved(
        student.users.email,
        student.name,
        jobData.title,
        jobData.companies.company_name,
        jobData.deadline,
      ),
    );

    await Promise.all(emailPromises);

    return { success: true, data, emailsSent: eligibleStudents.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## 📋 Email Templates Included

### 1. Application Status Update

- Used when company updates application (shortlisted, rejected, selected)
- Custom message for each status
- Shows job title and company name

### 2. Job Approved Notification

- Sent when TNP approves a job drive
- Notifies eligible students
- Shows deadline and position details

### 3. Custom Email

- Generic template for any custom messages
- Personalizable subject and body

---

## ⚠️ Important Notes

### Gmail App Password

- NOT your regular Gmail password
- Only works with app-specific password for 2FA accounts
- If you don't use 2FA, you can use your regular password (less secure)

### Rate Limiting

- Gmail has rate limits (~100 emails per minute)
- For bulk emails, space them out or use Supabase job scheduling

### Testing

- Always test with `yarn exec dotenv -- supabase functions serve`
- Check Supabase logs for any errors

### Production

- Keep secrets in Supabase environment variables
- Never commit credentials to git
- Monitor email sending logs

---

## 🧪 Test Email Function

Create test emails in CompanyDashboard:

```jsx
// In CompanyDashboard.jsx after updating status
const handleUpdateApplicationStatus = async (applicationId, status) => {
  const result = await updateApplicationStatus(applicationId, status);

  if (result.success) {
    // Email will be sent automatically
    alert("Application updated and email sent!");
  }
};
```

---

## 🐛 Troubleshooting

| Issue                              | Fix                                                         |
| ---------------------------------- | ----------------------------------------------------------- |
| "Gmail credentials not configured" | Check Supabase environment variables are set                |
| "Authentication failed"            | Verify Gmail app password is correct (not regular password) |
| "Email not received"               | Check spam folder, verify recipient email is correct        |
| "Function timeout"                 | Edge function might be overloaded, retry in a moment        |
| "CORS error"                       | Ensure Edge Function CORS headers are correct               |

---

## 🚀 Deployment Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Environment variables set in Supabase
- [ ] Edge Function deployed (`send-email`)
- [ ] Test email sent successfully
- [ ] Integration added to jobService.js
- [ ] Integration added to tnpService.js
- [ ] Tested in production database

---

## 📞 Support

For Gmail App Password issues:

- Visit: https://support.google.com/accounts/answer/185833
- Make sure 2-Step Verification is enabled
- App Password option appears only for 2FA accounts

---

**Status: Ready to Deploy** ✅
