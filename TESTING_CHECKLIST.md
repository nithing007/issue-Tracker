# Testing Checklist - Issue Tracker System

## 🧪 Pre-Testing Setup

### 1. Start Backend Server
```bash
cd backend
npm install  # if not already installed
npm start
```
✅ Backend should be running on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm install  # if not already installed
npm run dev
```
✅ Frontend should be running on `http://localhost:5173` (or similar)

---

## 🔐 Test 1: Admin Login & Dashboard

### Steps:
1. ✅ Navigate to `http://localhost:5173/login`
2. ✅ Enter admin credentials
3. ✅ Click "Login"

### Expected Results:
- ✅ Should redirect to `/admin-dashboard`
- ✅ Navbar shows "Admin Dashboard" link
- ✅ Navbar shows "Logout" button
- ✅ Page displays "Admin Dashboard" heading
- ✅ Table shows "All Complaints" with columns:
  - User
  - Title
  - Category
  - **Description** (NEW - truncated with ellipsis)
  - Status (with colored badge)
  - **Date Created** (NEW - formatted date)
  - Update Status (dropdown)
  - Remarks (input field)

### Test Admin Actions:
- ✅ Change a complaint status using the dropdown
  - Try: Pending → In Progress
  - Try: In Progress → Resolved
  - Try: Pending → **Rejected** (NEW)
- ✅ Verify status badge color changes immediately
- ✅ Add a remark to a complaint (type and click outside input)
- ✅ Verify remark is saved
- ✅ Verify you can see complaints from ALL users (not just one user)

---

## 👤 Test 2: User/Student Login & Dashboard

### Steps:
1. ✅ Logout (if logged in as admin)
2. ✅ Navigate to `http://localhost:5173/login`
3. ✅ Enter student/user credentials
4. ✅ Click "Login"

### Expected Results:
- ✅ Should redirect to `/user-dashboard`
- ✅ Navbar shows "User Dashboard" link
- ✅ Navbar shows "Logout" button
- ✅ Page displays "User Dashboard" heading
- ✅ Form to "Raise a New Complaint" is visible
- ✅ Table shows "My Complaints" (only this user's complaints)

### Test User Actions:
- ✅ Create a new complaint:
  - Enter Title: "Test Complaint"
  - Select Category: "Hardware"
  - Enter Description: "This is a test complaint"
  - Click "Submit Complaint"
- ✅ Verify success message appears
- ✅ Verify new complaint appears in "My Complaints" table
- ✅ Verify table shows:
  - Title
  - Category
  - Status (colored badge, default "Pending")
  - Date (formatted)
  - Remarks (shows "-" if empty)
- ✅ Verify you CANNOT edit the status (no dropdown visible)

---

## 🚫 Test 3: Route Protection

### Test 3A: User Cannot Access Admin Dashboard
1. ✅ Login as student/user
2. ✅ Manually navigate to `http://localhost:5173/admin-dashboard`
3. ✅ **Expected:** Should redirect to `/login`

### Test 3B: Admin Cannot Access User Dashboard
1. ✅ Login as admin
2. ✅ Manually navigate to `http://localhost:5173/user-dashboard`
3. ✅ **Expected:** Should redirect to `/login`

### Test 3C: Unauthenticated Access
1. ✅ Logout (or clear localStorage)
2. ✅ Try to access `/user-dashboard`
3. ✅ **Expected:** Should redirect to `/login`
4. ✅ Try to access `/admin-dashboard`
5. ✅ **Expected:** Should redirect to `/login`

---

## 🔄 Test 4: Logout Functionality

### Steps:
1. ✅ Login as any user (admin or student)
2. ✅ Click "Logout" button in navbar
3. ✅ **Expected:**
   - Redirects to `/login`
   - Navbar shows "Login" and "Register" links
   - Cannot access protected routes anymore

### Verify in Browser DevTools:
1. ✅ Open DevTools → Application → Local Storage
2. ✅ Verify `token`, `role`, and `user` are removed

---

## 🎨 Test 5: Status Badge Colors

### Verify Status Badge Styling:
- ✅ **Pending** - Orange background, dark orange text
- ✅ **In Progress** - Blue background, dark blue text
- ✅ **Resolved** - Green background, dark green text
- ✅ **Rejected** - Red background, dark red text (NEW)

### How to Test:
1. ✅ Login as admin
2. ✅ Create test complaints with different statuses
3. ✅ Verify each status displays with correct color

---

## 📱 Test 6: Responsive Design

### Desktop View (> 768px):
- ✅ Navbar items in a row
- ✅ Form fields in grid layout (2 columns)
- ✅ Table displays all columns properly
- ✅ Content centered with max-width 1400px

### Mobile View (< 768px):
- ✅ Navbar items stack vertically
- ✅ Form fields stack in single column
- ✅ Table may scroll horizontally (expected)

---

## 🔍 Test 7: Admin Dashboard - New Features

### Test Description Column:
1. ✅ Login as admin
2. ✅ View complaints table
3. ✅ Verify "Description" column exists
4. ✅ Verify long descriptions are truncated with ellipsis (...)
5. ✅ Hover over truncated text (should show full text in browser tooltip)

### Test Date Created Column:
1. ✅ Verify "Date Created" column exists
2. ✅ Verify dates are formatted properly (e.g., "1/29/2026")
3. ✅ Verify newest complaints appear first (sorted by createdAt desc)

### Test Rejected Status:
1. ✅ Select a complaint
2. ✅ Open "Update Status" dropdown
3. ✅ Verify "Rejected" option is available
4. ✅ Select "Rejected"
5. ✅ Verify status badge turns red
6. ✅ Verify status persists after page refresh

---

## 🐛 Test 8: Error Handling

### Test Invalid Token:
1. ✅ Login successfully
2. ✅ Open DevTools → Application → Local Storage
3. ✅ Manually change the `token` value to something invalid
4. ✅ Refresh the page
5. ✅ **Expected:** Should redirect to `/login` (backend returns 401)

### Test Network Error:
1. ✅ Stop the backend server
2. ✅ Try to login
3. ✅ **Expected:** Should show "Server error" message
4. ✅ Try to fetch complaints (if already logged in)
5. ✅ **Expected:** Should handle gracefully (console error)

---

## ✅ Test 9: End-to-End Flow

### Complete User Journey:
1. ✅ User registers (if registration is enabled)
2. ✅ User logs in → redirected to `/user-dashboard`
3. ✅ User creates a complaint
4. ✅ User sees complaint in "My Complaints" with "Pending" status
5. ✅ User logs out

### Complete Admin Journey:
6. ✅ Admin logs in → redirected to `/admin-dashboard`
7. ✅ Admin sees the user's complaint in "All Complaints"
8. ✅ Admin can see:
   - User's name
   - Complaint title
   - Category
   - **Description** (NEW)
   - Current status
   - **Date created** (NEW)
9. ✅ Admin changes status to "In Progress"
10. ✅ Admin adds remark: "Working on it"
11. ✅ Admin logs out

### Verify User Sees Updates:
12. ✅ User logs back in
13. ✅ User sees complaint status changed to "In Progress"
14. ✅ User sees admin remark: "Working on it"
15. ✅ User CANNOT change the status (read-only)

---

## 📊 Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Admin Login & Dashboard | ⬜ | |
| User Login & Dashboard | ⬜ | |
| Route Protection | ⬜ | |
| Logout Functionality | ⬜ | |
| Status Badge Colors | ⬜ | |
| Responsive Design | ⬜ | |
| New Description Column | ⬜ | |
| New Date Created Column | ⬜ | |
| Rejected Status Option | ⬜ | |
| Error Handling | ⬜ | |
| End-to-End Flow | ⬜ | |

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot GET /user-dashboard" on refresh
**Solution:** This is expected with client-side routing. The Vite dev server handles this automatically. In production, configure your server to serve `index.html` for all routes.

### Issue: CORS errors
**Solution:** Ensure backend has CORS enabled for `http://localhost:5173` (or your frontend URL)

### Issue: Token expired
**Solution:** Login again. JWT tokens have an expiration time set by the backend.

### Issue: "Rejected" status not saving
**Solution:** Ensure backend server was restarted after updating the Complaint model enum.

---

## 📝 Notes

- All tests should be performed with both admin and regular user accounts
- Check browser console for any JavaScript errors
- Verify network requests in DevTools → Network tab
- Test on different browsers (Chrome, Firefox, Edge) if possible
- Test on different screen sizes for responsive design

---

**Last Updated:** January 29, 2026
**Version:** 1.0
