# Lost & Found Campus Platform

A comprehensive, AI-powered Lost & Found platform designed for university campuses. Features include precise geolocation tracking, automated category extraction using ResNet18, and a premium SaaS-style interface.

## 🚀 Features

- **AI Matching**: Automatically categorize items and find similarities using deep learning.
- **Geolocation**: Precise "Locate Me" feature with automated campus address detection.
- **Admin Dashboard**: Comprehensive management of users, items, and audit logs.
- **Premium UI**: Modern light-themed SaaS dashboard built with Tailwind CSS.
- **Secure Auth**: JWT-based authentication with role-based access control.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS v4, Framer Motion, Leaflet Maps.
- **Backend (API)**: Node.js, Express, Prisma ORM, SQLite.
- **AI Engine**: Python, FastAPI, PyTorch (ResNet18).

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd lost-found-campus
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. AI Engine Setup (Python 3.9+)
```bash
cd ../ai-engine
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 📜 License
MIT License. See `LICENSE` for details.
>>>>>>> d8a4110 (Initial commit: Production-ready Lost & Found platform with AI matching)
