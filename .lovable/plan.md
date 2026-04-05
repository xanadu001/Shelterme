

## Plan: Create a Shared Space Detail Page

### Problem
When a user clicks on a shared space listing (🤝 prefixed), they're taken to `/listing/:id` which only queries the `properties` table -- so shared spaces show nothing or a 404.

### Approach
Create a dedicated `/shared-space/:id` page that mirrors the existing `ListingDetail` layout but fetches from `shared_spaces` table. Update navigation so shared space cards link to this new route.

### Steps

1. **Create `src/pages/SharedSpaceDetail.tsx`**
   - Reuse the same visual structure as `ListingDetail.tsx` (image gallery, amenities grid, description, sticky contact card)
   - Fetch data from `shared_spaces` table instead of `properties`
   - Show contact phone/email from the shared space record (not owner profile)
   - Remove booking flow -- replace with a "Contact" button (WhatsApp/call/email)
   - Remove verification badge (shared spaces aren't verified)
   - Add a "Shared by student" badge instead

2. **Add route in `src/App.tsx`**
   - Add `/shared-space/:id` route pointing to the new page

3. **Update `src/pages/Index.tsx`**
   - Mark shared space listings with a flag (e.g., `isSharedSpace: true`) so the card knows which route to use

4. **Update `src/components/ListingCardAirbnb.tsx`**
   - Accept an optional `isSharedSpace` prop
   - Navigate to `/shared-space/:id` instead of `/listing/:id` when the flag is true

### Technical Details
- The shared spaces table already has `contact_phone` and `contact_email` fields for direct contact
- No booking flow needed for shared spaces -- students contact each other directly
- The `ListingCardAirbnb` component will need a minor interface update to accept the new prop

