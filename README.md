# 🎬 cinescope movies

Cinescope is a high-performance, aesthetically pleasing web application built with **React.js** and **Tailwind CSS**. It allows users to explore a vast library of films and television shows using real-time data from the TMDB API, featuring smooth GSAP typography animations, a persistent watchlist, and dynamic media details.

---

## 🚀 Live Demo
**[https://cinescopemovienew.vercel.app/]**

---

## ✨ Key Features

* **Movies & TV Shows:** Discover both trending cinematic releases and popular television shows with a seamless toggle.
* **Premium Typography Animations:** Integrated **GSAP** and React Bits `<SplitText />` for beautiful, modern text reveals on scroll.
* **Real-time Search:** Optimized search functionality using debouncing to minimize API overhead.
* **Dynamic Routing:** Seamless navigation between home and detailed movie views using `react-router-dom`.
* **Persistent Watchlist:** A custom-built favorite system that saves data to `localStorage`, ensuring user data is kept across browser sessions.
* **Responsive UI:** A "Mobile-First" design approach using Tailwind CSS for a premium look on all devices.
* **Data Integration:** Live data synchronization with The Movie Database (TMDB) API.

---

## 🛠️ Tech Stack

* **Library:** React.js (Functional Components, Hooks, Context API)
* **Styling:** Tailwind CSS (Utility-first CSS)
* **Animations:** GSAP (`@gsap/react`), motion
* **Icons:** Lucide-React
* **Routing:** React Router v6
* **Deployment:** Vercel

---

## ⚙️ Local Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [PASTE YOUR GITHUB REPO LINK HERE]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your API credentials:
    ```env
    VITE_TMDB_TOKEN=your_tmdb_bearer_token_here
    ```
4.  **Start Development Server:**
    ```bash
    npm run dev
    ```

---

## 🧠 Technical Implementation Details

* **State Management:** Utilized the React Context API to manage the global "Watchlist" state, allowing for a consistent user experience across different components.
* **Optimization:** Implemented `useEffect` cleanup functions and dependency arrays to handle rapid navigation and prevent memory leaks/race conditions.
* **Security:** Environment variables were used to keep sensitive API tokens out of the version control history, following industry security standards.

---

## 👤 Author

**Tobiloba Akala (Buildwithtobi)**
*Computer Science Undergraduate, University of Lagos (UNILAG)*
axia cohort 9 student 2025/2026

---

## 📄 License
This project was developed as a Capstone Project for academic assessment.

