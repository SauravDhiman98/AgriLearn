# 🌾 AgriLearn — Agriculture EdTech Platform

A full-stack agriculture education platform inspired by Byju's, purpose-built for farmers, agriculture students, and agri-entrepreneurs.

## 🏗️ Architecture

```
AgriLearn/
├── backend/        # Spring Boot REST API (Java 17)
├── web/            # React 18 + TypeScript (Vite)
└── mobile/         # React Native + TypeScript (Expo)
```

Both `web` and `mobile` share the **same Spring Boot backend**.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📹 **Video Courses** | Structured courses with chapters & video lessons |
| 📝 **Quizzes & Assessments** | MCQ/True-False quizzes with progress tracking |
| 🎥 **Live Classes** | Scheduled live sessions with WebRTC |
| 💬 **Community Forum** | Q&A forum with upvotes, tags, comments |
| 🛒 **Marketplace** | Buy/sell agricultural products & paid courses |
| 💳 **Subscription Plans** | Free + Premium via Razorpay |
| 🌍 **Multi-language** | English, Hindi, and regional languages (i18n) |
| 🏆 **Certificates** | Auto-generated on course completion |
| 📊 **Analytics Dashboard** | Progress, leaderboards, admin insights |
| 🔔 **Notifications** | Push + email notifications |

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** + **JWT** authentication
- **Spring Data JPA** + **PostgreSQL**
- **Redis** (caching + session)
- **Flyway** (DB migrations)
- **Razorpay** (payments)
- **AWS S3 / MinIO** (file & video storage)
- **WebSocket** (live class, notifications)

### Web Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Redux Toolkit** (state management)
- **React Router v6**
- **Axios** (API client)
- **TailwindCSS** (styling)
- **React Query** (server state)
- **i18next** (multi-language)

### Mobile App
- **React Native** + **TypeScript** (Expo)
- **React Navigation** (navigation)
- **Redux Toolkit** (shared store logic)
- **Axios** (same API services as web)
- **Expo AV** (video player)
- **i18next** (multi-language)

---

## 🐳 Quick Start (Docker)

```bash
# Start all services
docker-compose up -d

# Backend runs on: http://localhost:8080
# Web frontend runs on: http://localhost:3000
# PostgreSQL on: localhost:5432
# Redis on: localhost:6379
```

## 📁 Manual Setup

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Web
```bash
cd web
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## 🗄️ Database Schema (Key Entities)

```
users ──< enrollments >── courses ──< chapters ──< lessons
users ──< quiz_attempts >── quizzes ──< questions
users ──< forum_posts ──< forum_comments
users ──< orders >── products
users ──< subscriptions
```

---

## 🌐 API Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://api.agrilearn.in/api/v1`

## 📄 License
MIT
