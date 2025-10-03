# DoMyService

**Connecting Communities, Building Trust**

DoMyService is a community-focused platform that bridges the gap between local service providers and customers. Built to address the Local Services Trust Problem, it empowers communities by facilitating reliable service exchanges while strengthening local bonds.

## 🎯 Problem Statement

**Community Connection Challenge - The Local Services Trust Problem**

Local service providers struggle to reach customers beyond word-of-mouth, while community members have difficulty finding reliable, trustworthy local services. Existing platforms extract high fees (15-30%) and prioritize transactions over community building and relationships.

## 💡 Our Solution

DoMyService addresses the fundamental trust and connection problems in local service economies by:
- Creating a low-barrier platform for service providers
- Building community trust through transparent connections
- Offering an intuitive, accessible interface for all users
- Supporting multiple languages for diverse communities
- Designing for users of all literacy levels with icon-based navigation

## ✨ Features

### 🌍 Multi-Language Support
- English, हिंदी (Hindi), and मराठी (Marathi)
- Easy language switching with dropdown selector
- Seamless translation across all pages

### ♿ Accessibility-First Design
- Icon-based navigation for illiterate-friendly experience
- Large, clear visual elements
- Color-coded cards with intuitive symbols
- Touch-friendly interface for mobile devices

### 👥 Dual User Roles
**Customers:**
- Browse and find local services
- Simple registration process
- Direct connection to service providers

**Service Providers:**
- Create detailed service profiles
- Showcase skills and experience
- Connect with local customers

### 📱 Fully Responsive
- Optimized for mobile, tablet, and desktop
- Multiple breakpoints (768px, 480px, 360px)
- Consistent experience across all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router DOM** - Client-side routing
- **React Icons** - Scalable icon library
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom responsive styling

### Backend
- **Python** - Backend language
- **Flask/FastAPI** - (To be implemented)

## 📁 Project Structure

```
do-my-service/
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable components
│   │   │   └── LanguageSwitcher.jsx
│   │   ├── contexts/        # React context providers
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUpCustomer.jsx
│   │   │   ├── SignUpProvider.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── styles/          # CSS stylesheets
│   │   │   ├── Landing.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   └── LanguageSwitcher.css
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py
│   └── requirements.txt
├── LICENSE
├── NOTICE
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ParthShikhare19/do-my-service.git
   cd do-my-service
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 📱 Pages Overview

### Landing Page (`/`)
The entry point featuring:
- Handshake logo with bouncing animation
- Language selector in the top-right
- Two large action cards for user type selection
- Sign-in link at the bottom

**Key Components:**
- Visual icons (🤝 handshake, 👤 user, 🔧 tools)
- Gradient background (blue theme)
- Hover effects with color transitions

### Sign In Page (`/signin`)
Authentication page with:
- Email/Mobile input field
- Password input field
- Submit button
- Link to sign-up pages

**Features:**
- Icon-based form inputs
- Focus states with blue highlighting
- Responsive form validation

### Customer Sign Up (`/signup/customer`)
Registration form for customers:
- Name field with 👤 icon
- Location field with 📍 icon
- Email field with 📧 icon
- Mobile number field with 📱 icon
- Password field with 🔒 icon

### Service Provider Sign Up (`/signup/provider`)
Extended registration for providers:
- All customer fields
- Service name field with 🔧 icon
- Service description textarea with 📝 icon
- Years of experience field with 🕐 icon
- Password field with 🔒 icon

### Dashboard (`/dashboard`)
Placeholder dashboard with:
- Floating rocket icon animation
- "Coming Soon" message
- Language selector

## 📄 License

This project is licensed under Apache License, the terms are specified in the LICENSE file.

## 👥 Contributors

| Name | GitHub |
|------|--------|
| Aarya Khatate | [@AaryaKhatate](https://github.com/AaryaKhatate) |
| Chetan Chaudhari | [@Ai-Chetan](https://github.com/Ai-Chetan) |
| Nischay Chavan | [@Nischay-loq](https://github.com/Nischay-loq) |
| Parth Shikhare | [@ParthShikhare19](https://github.com/ParthShikhare19) |
| Vinay Gone | [@vinaygone2006](https://github.com/vinaygone2006) |
| Yashraj Patil | [@Yashrajpatil22](https://github.com/Yashrajpatil22) |