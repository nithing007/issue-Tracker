# Issue Tracker System - MERN Stack

A role-based complaint/issue tracking system built with MongoDB, Express, React (Vite), and Node.js.

---

## 🎯 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin & User/Student)
- Automatic role-based redirection after login
- Protected routes with route guards
- Secure logout functionality

### 👤 User/Student Features
- ✅ Create new complaints with title, category, and description
- ✅ View own complaints only
- ✅ See complaint status (Pending, In Progress, Resolved, Rejected)
- ✅ View admin remarks on complaints
- ✅ Cannot modify complaint status (read-only)

### 🛠️ Admin Features
- ✅ View ALL users' complaints
- ✅ See user details (name, email)
- ✅ View complaint description and creation date
- ✅ Update complaint status (Pending → In Progress → Resolved/Rejected)
- ✅ Add remarks/comments to complaints
- ✅ Cannot create new complaints (read-only except status/remarks)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Navigate to project directory
cd "issue tracker"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` (or similar)

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📁 Project Structure

```
issue tracker/
├── backend/
│   ├── controllers/
│   │   └── complaintController.js    # Complaint CRUD operations
│   ├── models/
│   │   ├── Complaint.js               # Complaint schema
│   │   └── User.js                    # User schema
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification
│   │   └── roleMiddleware.js          # Role-based access
│   ├── routes/
│   │   ├── authRoutes.js              # Login/Register routes
│   │   └── complaintRoutes.js         # Complaint routes
│   └── server.js                      # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx             # Navigation component
│   │   ├── pages/
│   │   │   ├── Login.jsx              # Login page
│   │   │   ├── Register.jsx           # Registration page
│   │   │   ├── UserDashboard.jsx      # User dashboard
│   │   │   └── AdminDashboard.jsx     # Admin dashboard
│   │   ├── App.jsx                    # Routes & route protection
│   │   ├── App.css                    # Application styles
│   │   ├── index.css                  # Global styles
│   │   └── main.jsx                   # React entry point
│   └── index.html
│
├── IMPLEMENTATION_SUMMARY.md          # Feature documentation
├── TESTING_CHECKLIST.md               # Testing guide
├── ROUTING_FLOW.md                    # Flow diagrams
├── CHANGES.md                         # Change log
└── README.md                          # This file
```

---

## 🗺️ Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Redirects to `/login` |
| `/login` | Public | Login page (single page for all users) |
| `/register` | Public | User registration |
| `/user-dashboard` | Protected (User) | User dashboard - create & view own complaints |
| `/admin-dashboard` | Protected (Admin) | Admin dashboard - view all complaints & update status |

---

## 🔑 API Endpoints

### Authentication
```
POST /api/auth/login      # Login (returns token & role)
POST /api/auth/register   # Register new user
```

### Complaints
```
POST   /api/complaints         # Create complaint (User only)
GET    /api/complaints/my      # Get user's own complaints
GET    /api/complaints/all     # Get all complaints (Admin only)
PUT    /api/complaints/:id     # Update status/remarks (Admin only)
```

---

## 🎨 Tech Stack

### Frontend
- **React** (v18) - UI library
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Pure CSS** - Styling (no frameworks)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

---

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes with middleware
- ✅ Client-side route guards
- ✅ Automatic token validation
- ✅ Secure logout (clears all auth data)

---

## 📊 Complaint Status Flow

```
Pending → In Progress → Resolved
                     ↘ Rejected
```

**Status Colors:**
- 🟠 **Pending** - Orange (newly created)
- 🔵 **In Progress** - Blue (admin working on it)
- 🟢 **Resolved** - Green (completed)
- 🔴 **Rejected** - Red (invalid/cannot resolve)

---

## 👥 User Roles

### Student/User
- Can create complaints
- Can view only their own complaints
- Cannot modify complaint status
- Can see admin remarks

### Admin
- Cannot create complaints
- Can view ALL users' complaints
- Can update complaint status
- Can add remarks to complaints
- Has full visibility of the system

---

## 🧪 Testing

See **TESTING_CHECKLIST.md** for comprehensive testing guide.

Quick test:
1. Start backend and frontend
2. Register a new user
3. Login → should redirect to `/user-dashboard`
4. Create a complaint
5. Logout and login as admin
6. Should redirect to `/admin-dashboard`
7. Update the complaint status
8. Logout and login as user again
9. Verify status update is visible

---

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - Complete feature overview
- **TESTING_CHECKLIST.md** - Step-by-step testing guide
- **ROUTING_FLOW.md** - Visual flow diagrams
- **CHANGES.md** - Detailed change log

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Check if port 5000 is available

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Clear browser cache
- Check if port is available

### Login not working
- Check backend console for errors
- Verify JWT_SECRET is set in `.env`
- Check network tab in browser DevTools

### "Cannot GET /user-dashboard" on refresh
- This is expected with client-side routing
- Vite dev server handles this automatically
- In production, configure server to serve `index.html` for all routes

### CORS errors
- Ensure backend has CORS enabled
- Check frontend URL is allowed in backend CORS config

---

## 🔄 Recent Updates

### January 29, 2026
- ✅ Added Description column to admin dashboard
- ✅ Added Date Created column to admin dashboard
- ✅ Added "Rejected" status option
- ✅ Cleaned up CSS (removed hardcoded padding)
- ✅ Improved responsive layout
- ✅ Added comprehensive documentation

February 23, 2026
✅ Updated Home Page UI design

---

## 📝 License

This project is for educational purposes.

---

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.

---

## 📧 Support

For issues or questions, refer to the documentation files:
- Feature questions → IMPLEMENTATION_SUMMARY.md
- Testing help → TESTING_CHECKLIST.md
- Understanding flow → ROUTING_FLOW.md
- What changed → CHANGES.md

---

**Built with ❤️ using MERN Stack**
