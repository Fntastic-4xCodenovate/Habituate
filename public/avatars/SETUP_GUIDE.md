# Avatar Setup Instructions

## Quick Setup

1. **Add Your Avatar Images**
   - Place 8 avatar images in this folder (`public/avatars/`)
   - Name them: `avatar1.png`, `avatar2.png`, `avatar3.png`, etc. (up to `avatar8.png`)
   - Supported formats: PNG, JPG, JPEG, GIF, WebP
   - Recommended size: 256x256 pixels or larger (square)

2. **Where to Get Avatars**
   - Generate AI avatars from: https://getavataaars.com/
   - Download free avatars from: https://www.flaticon.com/
   - Use your own custom artwork
   - Generate pixel art from: https://8biticon.com/

3. **Current Status**
   - ✅ Avatar upload is **disabled** (to avoid errors)
   - ✅ Users get a **random avatar** from the 8 options
   - ✅ Users can later change their avatar in settings (when you enable it)

## To Re-Enable Avatar Upload

Open `app/onboarding/page.tsx` and:

1. Uncomment the avatar upload functions (lines ~80-130)
2. Uncomment the file input in the JSX (lines ~280-295)
3. Make sure Supabase Storage bucket "avatars" exists and is public

## Example Avatar Names

```
public/avatars/
├── avatar1.png   (e.g., Blue themed)
├── avatar2.png   (e.g., Red themed)
├── avatar3.png   (e.g., Green themed)
├── avatar4.png   (e.g., Purple themed)
├── avatar5.png   (e.g., Orange themed)
├── avatar6.png   (e.g., Pink themed)
├── avatar7.png   (e.g., Yellow themed)
└── avatar8.png   (e.g., Teal themed)
```

## Fallback

If you don't add avatars, users will see a default user icon until you add the images.
