# DevCard - Link-in-Bio Platform for Developers

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your Supabase credentials from:

- **VITE_SUPABASE_URL**: Supabase Dashboard > Project Settings > API > Project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase Dashboard > Project Settings > API > anon (public) key

### 2. Supabase Setup

#### Create Tables (Run in Supabase SQL Editor)

```sql
-- (Copy the entire schema from the setup instructions)
```

#### Configure Google OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth
3. Set Redirect URL to: `http://localhost:5173/auth/callback` (development)
4. Get your Google Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com)
5. Add them to Supabase Google OAuth provider settings

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── config/
│   └── supabase.js          # Supabase client initialization
├── hooks/
│   ├── useAuth.js           # Authentication hooks
│   └── useProfile.js        # Profile and links management hooks
├── components/
│   └── ProtectedRoute.jsx   # Route protection wrapper
├── pages/
│   ├── LoginPage.jsx        # Google OAuth login
│   ├── DashboardPage.jsx    # User dashboard
│   ├── LinksManagementPage.jsx # Link management
│   ├── PublicProfilePage.jsx # Public profile display
│   └── AuthCallbackPage.jsx # OAuth callback handler
├── App.jsx                  # Main routing
└── index.css               # Tailwind CSS
```

## Features

✅ **Google OAuth Authentication**

- Automatic profile creation on signup
- Session management

✅ **Protected Dashboard**

- User profile editor
- Link/Bio management
- Social links integration

✅ **Public Profiles**

- Dynamic routing by username
- Shareable profiles
- Beautiful profile displays

✅ **Links Management**

- Add/edit/delete links
- Order management
- Icon types for different link types

## Database Schema

### profiles table

- id (uuid, primary key)
- username (text, unique)
- full_name (text)
- bio (text)
- avatar_url (text)
- github_url, twitter_url, linkedin_url, website_url (text)
- skills (text[])
- location (text)
- available_for_hire (boolean)
- created_at, updated_at (timestamptz)

### links table

- id (uuid, primary key)
- profile_id (uuid, foreign key)
- title (text)
- url (text)
- description (text)
- icon_type (text)
- order_index (int)
- is_active (boolean)
- created_at, updated_at (timestamptz)

## Production Deployment Notes

1. **Environment Variables**
   - Update redirect URLs in Supabase for production domain
   - Update `redirectTo` in auth callbacks to use production URL

2. **RLS (Row Level Security)**
   - Add RLS policies for production (currently disabled for development)
   - Example: Users can only see/edit their own profiles

3. **Database Backup**
   - Enable automated backups in Supabase

4. **Build**
   ```bash
   npm run build
   ```

## Troubleshooting

### "Missing Supabase credentials"

- Check `.env.local` file exists and has correct values
- Keys should NOT have quotes

### "Google OAuth redirects to login page"

- Verify redirect URL in Supabase matches current domain
- Check Google OAuth credentials are correct
- Ensure provider is enabled in Supabase

### "Profile not found after login"

- Check `auth.users` table exists in Supabase
- Verify `handle_new_user` trigger is active
- Check Supabase logs for trigger errors

## Next Steps

1. Add more social platforms
2. Implement custom themes/colors
3. Add analytics
4. Add QR code generation
5. Add email notifications
6. Implement teams/collaboration features
