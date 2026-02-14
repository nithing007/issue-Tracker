# Issue Tracker - Routing & Authentication Flow

## 🗺️ Application Routes

```
/                    → Redirects to /login
/login               → Login Page (Public)
/register            → Register Page (Public)
/user-dashboard      → User Dashboard (Protected - Non-Admin Only)
/admin-dashboard     → Admin Dashboard (Protected - Admin Only)
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                            │
│                     (Single Page for All)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ User enters email & password
                      │ Submit Form
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              POST /api/auth/login                            │
│              Backend Authentication                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Returns: { token, role, user }
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Store in localStorage:                          │
│              - token                                         │
│              - role (admin / student / user)                 │
│              - user (optional user object)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Check role
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ role = admin  │           │ role = user   │
│               │           │ or student    │
└───────┬───────┘           └───────┬───────┘
        │                           │
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│  Navigate to  │           │  Navigate to  │
│/admin-dashboard│          │/user-dashboard│
└───────────────┘           └───────────────┘
```

---

## 🛡️ Route Protection Logic

### PrivateRoute (User Dashboard)
```
User tries to access /user-dashboard
        │
        ▼
┌───────────────────────────────┐
│ Check localStorage:           │
│ - token exists?               │
│ - role exists?                │
│ - role !== 'admin'?           │
└───────┬───────────────────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  YES      NO
    │       │
    │       └──────► Redirect to /login
    │
    └──────► Allow Access to User Dashboard
```

### AdminRoute (Admin Dashboard)
```
User tries to access /admin-dashboard
        │
        ▼
┌───────────────────────────────┐
│ Check localStorage:           │
│ - token exists?               │
│ - role === 'admin'?           │
└───────┬───────────────────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  YES      NO
    │       │
    │       └──────► Redirect to /login
    │
    └──────► Allow Access to Admin Dashboard
```

---

## 🔄 Logout Flow

```
┌─────────────────────────────────────────┐
│  User clicks "Logout" in Navbar         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Clear localStorage:                    │
│  - Remove 'token'                       │
│  - Remove 'role'                        │
│  - Remove 'user'                        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Navigate to /login                     │
└─────────────────────────────────────────┘
```

---

## 📊 User Dashboard Flow

```
┌─────────────────────────────────────────┐
│         USER DASHBOARD                  │
│  (Only for authenticated non-admin)     │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Create New    │   │ View My       │
│ Complaint     │   │ Complaints    │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ POST          │   │ GET           │
│ /api/         │   │ /api/         │
│ complaints    │   │ complaints/my │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Display in "My Complaints" Table:      │
│  - Title                                │
│  - Category                             │
│  - Status (READ-ONLY, colored badge)    │
│  - Date                                 │
│  - Remarks (from admin, if any)         │
└─────────────────────────────────────────┘
```

---

## 🛠️ Admin Dashboard Flow

```
┌─────────────────────────────────────────┐
│         ADMIN DASHBOARD                 │
│    (Only for authenticated admin)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  GET /api/complaints/all                │
│  (Fetch ALL users' complaints)          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Display in "All Complaints" Table:     │
│  - User (name from populated field)     │
│  - Title                                │
│  - Category                             │
│  - Description (NEW, truncated)         │
│  - Status (colored badge)               │
│  - Date Created (NEW)                   │
│  - Update Status (dropdown)             │
│  - Remarks (input field)                │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Admin Changes │   │ Admin Adds    │
│ Status        │   │ Remark        │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   │
        ▼                   ▼
┌───────────────────────────────────┐
│  PUT /api/complaints/:id          │
│  { status: "..." }                │
│  or                               │
│  { remarks: "..." }               │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│  Refresh complaints list          │
│  (Changes reflect immediately)    │
└───────────────────────────────────┘
```

---

## 🔒 Token Validation Flow

```
┌─────────────────────────────────────────┐
│  User makes API request                 │
│  (with Authorization: Bearer <token>)   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Backend validates token                │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Valid Token   │   │ Invalid Token │
│ (200 OK)      │   │ (401/403)     │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   ▼
        │           ┌───────────────┐
        │           │ Frontend:     │
        │           │ - Clear auth  │
        │           │ - Redirect to │
        │           │   /login      │
        │           └───────────────┘
        │
        ▼
┌───────────────┐
│ Return data   │
└───────────────┘
```

---

## 📋 Status Update Flow (Admin Only)

```
┌─────────────────────────────────────────┐
│  Admin selects new status from dropdown │
│  Options:                               │
│  - Pending                              │
│  - In Progress                          │
│  - Resolved                             │
│  - Rejected (NEW)                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  onChange event triggered               │
│  handleStatusUpdate(id, newStatus)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  PUT /api/complaints/:id                │
│  {                                      │
│    status: newStatus                    │
│  }                                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Backend updates complaint              │
│  Returns updated complaint              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Frontend calls fetchComplaints()       │
│  Table refreshes with new status        │
│  Status badge color updates             │
└─────────────────────────────────────────┘
```

---

## 🎨 Status Badge Color Mapping

```
Status          │ Background     │ Text Color    │ Border
─────────────────┼────────────────┼───────────────┼─────────────
Pending         │ #fff7ed        │ #c2410c       │ #ffedd5
                │ (Light Orange) │ (Dark Orange) │ (Orange)
─────────────────┼────────────────┼───────────────┼─────────────
In Progress     │ #eff6ff        │ #1d4ed8       │ #dbeafe
                │ (Light Blue)   │ (Dark Blue)   │ (Blue)
─────────────────┼────────────────┼───────────────┼─────────────
Resolved        │ #f0fdf4        │ #15803d       │ #dcfce7
                │ (Light Green)  │ (Dark Green)  │ (Green)
─────────────────┼────────────────┼───────────────┼─────────────
Rejected (NEW)  │ #fef2f2        │ #991b1b       │ #fee2e2
                │ (Light Red)    │ (Dark Red)    │ (Red)
```

---

## 🔑 Key Files & Their Roles

```
App.jsx
├── Defines routes and route protection
├── PrivateRoute component (non-admin users)
└── AdminRoute component (admin only)

Login.jsx
├── Single login page for all users
├── Calls POST /api/auth/login
├── Stores token and role in localStorage
└── Redirects based on role

UserDashboard.jsx
├── Protected by PrivateRoute
├── Create new complaints
├── View own complaints only
└── Cannot modify status (read-only)

AdminDashboard.jsx
├── Protected by AdminRoute
├── View ALL users' complaints
├── Update complaint status
├── Add remarks to complaints
└── Cannot create new complaints

Navbar.jsx
├── Shows role-based navigation links
├── Logout button (clears auth)
└── Conditional rendering based on token/role

App.css
├── Global styles and layout
├── Status badge colors
├── Responsive design
└── Form and table styling
```

---

## 📱 Component Hierarchy

```
App
├── BrowserRouter (from main.jsx)
└── Routes
    ├── / → Navigate to /login
    ├── /login → Login
    ├── /register → Register
    ├── /user-dashboard → PrivateRoute
    │   └── UserDashboard
    │       ├── Navbar
    │       ├── Create Complaint Form
    │       └── My Complaints Table
    └── /admin-dashboard → AdminRoute
        └── AdminDashboard
            ├── Navbar
            └── All Complaints Table
                ├── Status Dropdown
                └── Remarks Input
```

---

**Last Updated:** January 29, 2026
