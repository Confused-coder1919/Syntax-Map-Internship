Syntax Map – Digital English Tense Learning Platform**

Syntax Map is an interactive web application designed to digitalize English tense learning for French classrooms. It replaces traditional grammar books with a modern, engaging experience that includes a Tense Map, quizzes, notepad, and multiplayer features.

---

Features**

* **Tense Map Visualization**: Interactive diagram to understand English tenses.
* **Notepad**: Students can take notes and track mistakes.
* **Question Bank**: Admin/teachers can add and manage questions.
* **Admin Panel**: Manage courses, items, and questions.
* **Multiplayer Mode**: (Upcoming) Real-time quiz competition like Kahoot.
* **Role-based Access**:

  * **Admin** – Full control over content and users.
  * **Teacher** – Create classes, assign homework, track students.
  * **Student** – Access lessons, take quizzes, join multiplayer.
* **Guest Mode**: Public users can try features without signing up (coming soon).

---

Tech Stack**

* **Frontend**: React (Create React App)
* **Backend**: Node.js (Express), Colyseus (for multiplayer)
* **Database**: Supabase (PostgreSQL)
* **Authentication**: JWT
* **Deployment**: Vercel (Frontend) + Render/Heroku (Backend)

---

Project Structure**

```
SyntaxMap/
│
├── SyntaxMap-Front-main 2/      # React Frontend
│   ├── src/
│   ├── package.json
│   ├── .env.example
│
└── SyntaxMap-Back-main 2/       # Node.js Backend
    ├── routes/
    ├── app.js
    ├── package.json
    ├── .env.example
```



Getting Started**

1. Prerequisites**

* Node.js (v18+ recommended)
* npm or yarn
* Supabase account (for database)

---

2. Clone the Repository**

```bash
git clone <your-repo-url>
cd SyntaxMap
```

---

3. Set Up Environment Variables**

Create `.env` files for both **frontend** and **backend** based on `.env.example`.

Frontend `.env`**

```
REACT_APP_API_BASE_URL=http://localhost:3000
SUPABASE_URL=https://<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
```

Backend `.env`**

```
PORT=3000
SUPABASE_URL=https://<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=your-secret
```

---

4. Install Dependencies**

**Frontend**

```bash
cd "SyntaxMap-Front-main 2"
npm install
```

**Backend**

```bash
cd "../SyntaxMap-Back-main 2"
npm install
```

---

5. Run the App**

**Backend**

```bash
cd "SyntaxMap-Back-main 2"
npm start
```

**Frontend**

In a new terminal:

```bash
cd "SyntaxMap-Front-main 2"
npm start
```

* Frontend will run on: `http://localhost:3001`
* Backend will run on: `http://localhost:3000`

---

**6. Login Credentials (Test Account)**

```
Admin:
Email: admin@test.com
Password: 1234
```

---

**Database Setup (Supabase)**

1. Create a new **Supabase project**.
2. Create the following tables:

   * `users` (id, name, email, role)
   * `questions` (id, question, options, answer)
   * `courses` (id, title, description)
   * `notes`, `classes`, etc.
3. Enable **Row Level Security** and policies for roles.
4. Insert sample data (see `sample-data.sql` if provided).

---

**Roadmap**

* [x] Tense Map
* [x] Notepad
* [x] Question Management
* [ ] Guest Mode
* [ ] Teacher & Student Dashboards
* [ ] Multiplayer Quiz Game
* [ ] Mobile Optimization



License

MIT License © 2025 Linguistic Communication




