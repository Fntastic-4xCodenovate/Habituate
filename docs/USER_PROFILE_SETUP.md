# Complete User Profile & Onboarding Setup Guide

## 🎉 What's Been Implemented

### 1. Database Schema (`supabase/user_profile_schema.sql`)
Complete database structure with:
- ✅ `user_profiles` table with all fields (username, display_name, avatar_url, region, bio, XP, level, extra_lives)
- ✅ `habits`, `habit_logs`, `badges`, `user_badges` tables
- ✅ `clans` and `clan_members` tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Auto-update triggers for `updated_at`
- ✅ 16 predefined badges
- ✅ Storage bucket configuration for avatars

### 2. Onboarding Flow (`app/onboarding/page.tsx`)
New user setup page with:
- ✅ Avatar upload with preview
- ✅ Username (in-game name) - unique, required
- ✅ Display name (optional)
- ✅ Region selector (7 regions)
- ✅ Bio textarea (500 char limit)
- ✅ Real-time validation
- ✅ Avatar size check (max 5MB)
- ✅ Username uniqueness check
- ✅ Auto-redirect to dashboard after completion

### 3. Settings Page (`app/settings/page.tsx`)
Profile management with:
- ✅ View profile stats (Level, XP, Extra Lives)
- ✅ Edit avatar (upload new image)
- ✅ Update display name
- ✅ Change region
- ✅ Edit bio
- ✅ Username display (read-only)
- ✅ Success/error notifications
- ✅ Real-time preview

### 4. Profile Check System
Automatic flow control:
- ✅ Check if user completed onboarding
- ✅ Redirect to `/onboarding` if profile incomplete
- ✅ Allow access to protected routes only after setup
- ✅ Updated middleware to protect new routes

### 5. Environment Configuration
Updated credentials:
- ✅ Supabase URL: `https://mtqxxmcpqazdcngtlgqz.supabase.co`
- ✅ Supabase Anon Key: Configured
- ✅ JWT Secret: `7fUeq1/vE00UdISKU/3/14a7l52Sj8NtTL62g/Rf4jwY1moogSEFnKKh0FB2PTNFBp2d/cOKDQVRynSS9y+5+Q==`
- ✅ Clerk redirect: Changed to `/onboarding` after sign-up

## 🚀 Setup Instructions

### Step 1: Create Database Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/user_profile_schema.sql`
4. Paste and execute the SQL
5. Verify tables are created in **Table Editor**

### Step 2: Create Storage Bucket for Avatars

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `avatars`
4. Make it **Public**
5. Click **Create bucket**

### Step 3: Set Up Storage Policies

In Supabase SQL Editor, run:

```sql
-- Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their avatars
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their avatars
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

### Step 4: Get Supabase Service Role Key (Optional for Backend)

1. Go to **Settings** > **API**
2. Copy the **service_role** key
3. Update `backend/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 📊 User Flow

### New User Journey:
1. User signs up via Clerk → `/auth`
2. Clerk redirects to → `/onboarding`
3. User fills out profile form:
   - Upload avatar
   - Enter username (unique, required)
   - Enter display name (optional)
   - Select region (required)
   - Write bio (optional)
4. Click "Complete Setup"
5. Profile saved to Supabase `user_profiles` table
6. User redirected to → `/dashboard`

### Returning User:
1. User signs in
2. BackendInitializer checks `profile_completed` flag
3. If `true` → Allow access to all routes
4. If `false` or missing → Redirect to `/onboarding`

### Editing Profile:
1. User clicks "Settings" in navbar
2. Opens `/settings` page
3. Edit any field (except username)
4. Upload new avatar
5. Click "Save Changes"
6. Profile updated in database

## 🎮 Features

### User Profile Fields
```typescript
{
  id: UUID,
  clerk_user_id: string,        // Clerk user ID
  email: string,                 // From Clerk
  username: string,              // Unique in-game name
  display_name: string,          // Display name
  avatar_url: string | null,     // Supabase Storage URL
  region: string,                // NA, EU, ASIA, etc.
  bio: string,                   // 500 char max
  xp: number,                    // Total XP
  level: number,                 // Current level
  extra_lives: number,           // Extra life count
  clan_id: UUID | null,          // Current clan
  profile_completed: boolean,    // Onboarding done
  created_at: timestamp,
  updated_at: timestamp
}
```

### Available Regions
- `NA` - North America
- `EU` - Europe
- `ASIA` - Asia
- `OCE` - Oceania
- `SA` - South America
- `AF` - Africa
- `ME` - Middle East

### Avatar Upload
- Max size: 5MB
- Formats: Any image (jpg, png, gif, webp)
- Stored in: Supabase Storage `avatars` bucket
- Public URL generated automatically
- Old avatars replaced on update

## 🔧 API Integration

### Check User Profile
```typescript
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('clerk_user_id', clerkUserId)
  .single();
```

### Create Profile
```typescript
const { error } = await supabase
  .from('user_profiles')
  .insert({
    clerk_user_id: user.id,
    email: user.email,
    username: 'cool_gamer',
    display_name: 'Cool Gamer',
    region: 'NA',
    bio: 'Love gaming!',
    profile_completed: true,
  });
```

### Update Profile
```typescript
const { error } = await supabase
  .from('user_profiles')
  .update({
    display_name: 'New Name',
    bio: 'Updated bio',
    avatar_url: 'https://...',
  })
  .eq('clerk_user_id', user.id);
```

### Upload Avatar
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}-${Date.now()}.jpg`, file, {
    cacheControl: '3600',
    upsert: true,
  });

const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath);
```

## 🐛 Troubleshooting

### "Username is already taken"
- Usernames are unique across all users
- Try a different username
- Check database for existing usernames

### Avatar Upload Fails
1. Check file size (must be < 5MB)
2. Verify `avatars` bucket exists and is public
3. Check storage policies are set up
4. Look for errors in browser console

### Redirect Loop to Onboarding
1. Check if profile was saved successfully
2. Verify `profile_completed` is set to `true`
3. Check Supabase connection in browser console
4. Clear browser cache and try again

### Profile Not Loading
1. Verify database tables exist
2. Check Supabase credentials in `.env.local`
3. Check RLS policies allow SELECT for all users
4. Look for errors in browser console

### "Failed to save profile"
1. Check all required fields are filled
2. Verify unique username
3. Check Supabase logs for errors
4. Ensure RLS policies allow INSERT/UPDATE

## 📝 Testing Checklist

- [ ] Run SQL schema in Supabase
- [ ] Create `avatars` storage bucket
- [ ] Set up storage policies
- [ ] Sign up new user
- [ ] Verify redirect to `/onboarding`
- [ ] Fill out profile form
- [ ] Upload avatar (test < 5MB image)
- [ ] Submit form
- [ ] Verify redirect to `/dashboard`
- [ ] Check profile data in Supabase Table Editor
- [ ] Go to `/settings`
- [ ] Edit display name
- [ ] Upload new avatar
- [ ] Save changes
- [ ] Verify updates in database
- [ ] Sign out and sign back in
- [ ] Verify direct access to `/dashboard` (no redirect)

## ✅ Success Indicators

You'll know everything works when:
- ✅ New users redirected to onboarding
- ✅ Onboarding form submits successfully
- ✅ Avatar uploads and displays
- ✅ Username uniqueness enforced
- ✅ Profile data saved to Supabase
- ✅ Settings page loads user data
- ✅ Profile edits save correctly
- ✅ Returning users bypass onboarding
- ✅ Navbar shows "Settings" link
- ✅ No console errors

## 🎯 Next Steps

After setup:
1. Test the complete flow with a new account
2. Verify all validations work
3. Test avatar upload with different image sizes
4. Try duplicate username to verify error handling
5. Edit profile in settings to test updates
6. Check that gamification features (XP, level) work with new profile structure

Your app now has a complete user profile system with onboarding and settings! 🚀
