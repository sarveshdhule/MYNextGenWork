# NextGenWork

**NextGenWork** is a modern web application built with the MERN stack (MongoDB, Express.js, React, Node.js) designed to empower tech enthusiasts in small towns and beyond.  
It provides a platform for discovering technology-centric opportunities, accessing curated learning resources, and building a strong professional network.

---

## ✨ Features

- **Opportunities Hub:**  
  - Find, post, bookmark, and manage jobs, contests, and webinars.
  - Like, comment, and discuss opportunities.
  - Responsive, modern UI for all devices.

- **Learning Hub:**  
  - Access and share valuable resources and roadmaps for various tech domains.
  - Add multiple resource types (blog, playlist, repo, doc) per entry.
  - Star rating, comments/discussion, and bookmarking.
  - Sort by newest, most rated, or most viewed.

- **Profile Management:**  
  - Edit your profile, view your posted opportunities/resources, and manage bookmarks.
  - See notifications for new resources and opportunities.

- **Authentication:**  
  - Secure JWT-based login/register.
  - Google OAuth support (if enabled).

- **Mobile & Tablet Ready:**  
  - Fully responsive layouts.
  - Hamburger menu navigation on mobile/tablet.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/your-username/NextGenWork.git
    cd NextGenWork
    ```

2. **Install backend dependencies**
    ```bash
    cd nextgenwork-backend
    npm install
    ```

3. **Install frontend dependencies**
    ```bash
    cd ../nextgenwork-frontend
    npm install
    ```

4. **Set up environment variables**

    In the `nextgenwork-backend` directory, create a `.env` file and add:
    ```
    MONGODB_URI=your-mongodb-uri
    PORT=5000
    JWT_SECRET=your-secret
    ```

5. **Start MongoDB**

    Make sure MongoDB is running. You can start it with:
    ```bash
    mongod
    ```

### Running the Application

- **Start the backend**
    ```bash
    cd nextgenwork-backend
    npm start
    ```

- **Start the frontend**
    ```bash
    cd ../nextgenwork-frontend
    npm start
    ```

- **Access the application**

    Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure

```
NextGenWork/
  ├── nextgenwork-frontend/   # React frontend
  └── nextgenwork-backend/    # Express backend & MongoDB models
```

---

## 🖼️ Screenshots

### Home Page
![Home Page](./screenshots/home.png)

### Learning Hub
![Learning Hub](./screenshots/learning-hub.png)

### Profile (Mobile)
![Profile Mobile](./screenshots/profile-mobile.png)

---

## 💡 Inspiration

Ignite the tech scene in small towns and help bridge the opportunity gap with **NextGenWork**!

---


