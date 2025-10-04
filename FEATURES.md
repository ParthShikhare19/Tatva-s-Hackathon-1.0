# 🎯 DoMyService - Complete Features Documentation

## 📋 Project Overview

**DoMyService** is a community-focused platform that bridges the gap between local service providers and customers. Built to address the Local Services Trust Problem, it empowers communities by facilitating reliable service exchanges while strengthening local bonds.

### 🎯 Problem Statement
Local service providers struggle to reach customers beyond word-of-mouth, while community members have difficulty finding reliable, trustworthy local services. Existing platforms extract high fees (15-30%) and prioritize transactions over community building.

---

## 🌟 Core Features

### 1. 🌍 Multi-Language Support
- **Languages Supported**: English, हिंदी (Hindi), and मराठी (Marathi)
- **Real-time Language Switching**: Instant translation across all pages and components
- **Dropdown Language Selector**: Easily accessible in header
- **Full Localization**: All UI elements, messages, and content translated
- **Context-Aware Translations**: Language preference persists across sessions

### 2. ♿ Accessibility-First Design
- **Icon-Based Navigation**: Visual symbols for illiterate-friendly experience
- **Large, Clear Visual Elements**: Easy-to-read typography and buttons
- **Color-Coded Cards**: Intuitive color schemes with meaningful symbols
- **Touch-Friendly Interface**: Optimized for mobile touch interactions
- **High Contrast Design**: Enhanced visibility for visually impaired users
- **Responsive Icons**: Scalable vector icons (React Icons library)

### 3. 👥 Dual User Role System

#### 🛒 Customer Features
- Browse and discover local service providers
- Simple registration process with OTP verification
- Advanced search and filtering capabilities
- Save favorite providers
- Book services (immediate or scheduled)
- Real-time booking status tracking
- Mandatory review system after service completion
- Dashboard with comprehensive statistics

#### 🔧 Service Provider Features
- Create detailed service profiles
- Showcase skills, experience, and bio
- Accept/reject booking requests
- Manage active jobs
- View customer reviews and ratings
- Track completed jobs and earnings
- Location-based visibility
- Years of experience display

---

## 🔐 Authentication & Security

### 1. 📱 OTP-Based Authentication
- **Multiple OTP Providers**: 
  - MSG91 (Primary) with DLT template support
  - Twilio SMS (Fallback)
- **6-Digit OTP Generation**: Secure random numeric codes
- **5-Minute Expiry**: Time-limited verification codes
- **Rate Limiting**: 1-minute cooldown between OTP requests
- **Max Attempts**: 3 attempts per OTP before regeneration required
- **Development Mode**: Console logging for testing without SMS costs

### 2. 🔒 Secure Password Management
- **BCrypt Hashing**: Industry-standard password encryption
- **Salt Generation**: Automatic salt for each password
- **72-Character Limit**: Protection against DoS attacks
- **Password Verification**: Secure comparison without exposing hashes

### 3. 🎫 JWT Token Authentication
- **Access Tokens**: 8-hour validity period
- **Token Payload**: User ID, role, and expiration
- **HTTP Bearer Authentication**: Secure header-based auth
- **Token Verification**: Automatic expiry checking
- **Protected Routes**: Role-based access control

### 4. 🛡️ Role-Based Access Control (RBAC)
- **User Roles**: Customer and Provider roles
- **Endpoint Protection**: Role-specific API access
- **Frontend Route Guards**: Protected dashboard routes
- **Permission Validation**: Automatic role verification

---

## 📊 Dashboard Features

### 🛒 Customer Dashboard

#### Statistics Overview
- **Active Bookings**: Real-time count of pending/accepted bookings
- **Booking History**: Total bookings made
- **Saved Providers**: Favorite providers count
- **Pending Bookings**: Awaiting provider acceptance
- **Accepted Bookings**: Confirmed services
- **Completed Bookings**: Finished services with reviews
- **Cancelled Bookings**: Rejected or cancelled services

#### Provider Discovery
- **Advanced Search**:
  - Search by name, service, location, or description
  - Service type filtering (Plumber, Electrician, Carpenter, etc.)
  - Location-based filtering
  - Minimum rating filter
  - Pagination support (100 providers per page)
  
- **Provider Cards Display**:
  - Provider name and phone
  - Service specialization
  - Average rating (⭐ 1-5 stars)
  - Number of reviews
  - Location information
  - Description/bio
  - Save/Unsave functionality
  - Click to view full profile

#### Booking Management
- **Create Bookings**:
  - Immediate booking option
  - Scheduled booking with date/time selection
  - Service description
  - Automatic location detection
  - 6-digit one-time booking code generation
  
- **View Bookings**:
  - Filter by status (Active, Pending, Accepted, Completed, Cancelled)
  - Booking details (service, provider, location, date/time)
  - Status indicators with color coding
  - Acceptance code display
  - Completion code for review verification
  
- **Booking Actions**:
  - Cancel pending bookings
  - Cancel accepted bookings
  - Verify acceptance codes
  - Mark work as finished
  - Submit mandatory reviews

#### Saved Providers
- Save favorite providers for quick access
- Unsave providers
- Visual bookmark indicators
- Quick booking from saved list

#### Profile Management
- **Edit Personal Information**:
  - Name update
  - Email update
  - Phone number (read-only)
  - Profile picture support
  
- **View Profile**:
  - Complete profile details
  - Account creation date
  - Role information

### 🔧 Provider Dashboard

#### Statistics Overview
- **Average Rating**: Overall rating from all reviews (⭐ 1-5)
- **Total Reviews**: Number of customer reviews
- **Customers Served**: Unique customers with completed bookings
- **Active Bookings**: Current pending + accepted bookings
- **Pending Requests**: Awaiting provider action
- **Accepted Jobs**: Confirmed jobs in progress

#### Booking Request Management
- **View Pending Requests**:
  - Customer name and phone
  - Service requested
  - Booking type (immediate/scheduled)
  - Scheduled date/time
  - Location
  - Description
  - One-time booking code
  
- **Accept/Reject Requests**:
  - Accept button generates 6-digit acceptance code
  - Reject button with reason option
  - Automatic status updates
  - Customer notification via WhatsApp

#### Active Job Management
- **View Accepted Jobs**:
  - Customer contact information
  - Service details
  - Location and navigation
  - Acceptance code verification
  - Job timeline
  
- **Job Actions**:
  - Cancel accepted jobs
  - Mark job as completed
  - Generate completion codes
  - View customer feedback

#### Reviews & Ratings
- **Detailed Review List**:
  - Customer name and contact
  - Rating (1-5 stars)
  - Written comments
  - Service type reviewed
  - Review date/time
  
- **Served Customers List**:
  - Customer names and contacts
  - Services provided
  - Booking dates
  - Job completion status

#### Profile Management
- **Provider Profile**:
  - Bio/description (1000 characters)
  - Location information
  - Years of experience
  - Average rating display
  - Jobs completed count
  - Verification status
  
- **Profile Updates**:
  - Edit name, email, bio
  - Update location
  - Update experience
  - All changes reflected in real-time

---

## 📱 Booking System

### 1. 🎫 Booking Types
- **Immediate Bookings**: Instant service requests
- **Scheduled Bookings**: Date and time selection for future services

### 2. 🔄 Booking Workflow

#### Customer Journey
1. **Browse Providers** → Search and filter
2. **View Profile** → Check ratings, reviews, experience
3. **Create Booking** → Select type (immediate/scheduled)
4. **Receive Code** → 6-digit one-time booking code
5. **Wait for Acceptance** → Provider notification via WhatsApp
6. **Get Acceptance Code** → 6-digit code when accepted
7. **Verify Provider** → Match acceptance code
8. **Service Completion** → Request completion code
9. **Submit Review** → Mandatory review with rating
10. **Booking Complete** → Status changed to completed

#### Provider Journey
1. **Receive Notification** → WhatsApp alert for new booking
2. **View Request** → Check customer details, service, location
3. **Accept/Reject** → Decision with automatic code generation
4. **Provide Service** → Use acceptance code for verification
5. **Complete Job** → Generate completion code
6. **Receive Review** → Customer submits mandatory review
7. **Rating Update** → Average rating recalculated

### 3. 📋 Booking Status Flow
```
PENDING → ACCEPTED → COMPLETED
   ↓          ↓
REJECTED   CANCELLED
```

- **PENDING**: Awaiting provider response
- **ACCEPTED**: Provider confirmed, service in progress
- **REJECTED**: Provider declined request
- **COMPLETED**: Service finished with review submitted
- **CANCELLED**: Customer or provider cancelled

### 4. 🔑 Code Verification System

#### One-Time Booking Code (Deprecated)
- 6-digit numeric code
- Generated at booking creation
- Used for initial booking verification

#### Acceptance Code
- 6-digit numeric code
- Generated when provider accepts booking
- Shared with both customer and provider
- Used for service commencement verification
- Prevents fraudulent service claims

#### Completion Code
- 6-digit numeric code
- Generated when customer marks work as finished
- Required for review submission
- Ensures review authenticity
- Links review to specific booking

### 5. 📞 Phone Number Normalization
- Removes all non-digit characters
- Handles country codes (91 for India)
- Consistent phone number matching
- Prevents booking errors due to format differences

---

## ⭐ Review & Rating System

### 1. 📝 Review Features
- **Mandatory Reviews**: Required to complete bookings
- **Rating Scale**: 1.0 to 5.0 stars (decimal precision)
- **Written Comments**: Optional text feedback
- **Completion Code Verification**: Prevents fake reviews
- **One Review Per Booking**: Duplicate prevention
- **Timestamp Tracking**: Review creation date/time

### 2. 📊 Rating Calculations
- **Average Rating**: Calculated from all reviews for a provider
- **Review Count**: Total number of reviews
- **Real-time Updates**: Instant recalculation after new review
- **Decimal Precision**: Ratings stored as NUMERIC(3,1)
- **Display Rounding**: Rounded to 1 decimal place in UI

### 3. 👀 Review Display
- **Provider Dashboard**: Full list of all reviews received
- **Customer Cards**: Average rating and review count
- **Review Modal**: Detailed view with customer info
- **Chronological Order**: Newest reviews first

---

## 📱 Real-Time Notifications

### 🔔 WhatsApp Integration (Twilio)

#### 1. Provider Notifications
- **New Booking Request**:
  ```
  🔔 New Booking Request!
  👤 Customer: [Name]
  🔧 Service: [Service Type]
  📅 Type: IMMEDIATE/SCHEDULED
  📝 Details: [Description]
  🌐 Dashboard Link
  ```

- **Booking Cancelled by Customer**:
  ```
  🚫 Booking Cancelled by Customer
  👤 Customer: [Name]
  🔧 Service: [Service Type]
  📅 Type: [Booking Type]
  ```

#### 2. Customer Notifications
- **Booking Accepted**:
  ```
  ✅ Booking Accepted!
  👨‍🔧 Provider: [Name]
  🔧 Service: [Service Type]
  🔑 Acceptance Code: [6-digit code]
  ✨ Please verify this code when provider arrives
  ```

- **Booking Rejected**:
  ```
  ❌ Booking Not Available
  👨‍🔧 Provider: [Name]
  🔧 Service: [Service Type]
  💡 Browse other providers on dashboard
  ```

- **Job Cancelled by Provider**:
  ```
  ⚠️ Job Cancelled by Provider
  👨‍🔧 Provider: [Name]
  🔧 Service: [Service Type]
  💡 You can book another provider
  ```

#### 3. Notification Features
- Formatted WhatsApp messages with emojis
- Direct dashboard links
- Code highlighting with bold text
- Instructions for next steps
- Twilio sandbox and production support
- Error handling with fallback logging

---

## 🗄️ Database Architecture

### PostgreSQL Database (Neon)

#### 1. **Users Table**
```sql
- id (PK, Auto-increment)
- name (VARCHAR 100)
- phone_number (VARCHAR 15, Unique, Indexed)
- email_id (VARCHAR 255, Optional)
- password_hash (VARCHAR 255, Optional)
- role (ENUM: 'customer', 'provider')
- created_at (TIMESTAMP with timezone)
```

#### 2. **Providers Table**
```sql
- user_id (PK, FK to users.id)
- bio (TEXT, 1000 chars)
- location_name (VARCHAR 255)
- years_of_experience (INTEGER)
- average_rating (NUMERIC 3,1, Default 0.0)
- jobs_completed (INTEGER, Default 0)
- is_verified (BOOLEAN, Default false)
```

#### 3. **Customers Table**
```sql
- user_id (PK, FK to users.id)
- address (VARCHAR 500, Optional)
- location_name (VARCHAR 255, Optional)
- preferences (VARCHAR 500, Optional)
```
*Note: Currently using Users table directly for customer data*

#### 4. **Bookings Table**
```sql
- id (PK, Auto-increment)
- customer_phone (VARCHAR 15, Indexed)
- provider_phone (VARCHAR 15, Indexed)
- service (VARCHAR 100)
- description (TEXT)
- location (VARCHAR 255)
- status (ENUM: pending, accepted, rejected, completed, cancelled, Indexed)
- booking_type (VARCHAR 20: immediate/scheduled, Default 'scheduled')
- scheduled_date (VARCHAR 20, Optional)
- scheduled_time (VARCHAR 20, Optional)
- one_time_code (VARCHAR 6, Optional)
- acceptance_code (VARCHAR 6, Optional)
- completion_code (VARCHAR 6, Optional)
- created_at (TIMESTAMP with timezone)
```

#### 5. **Reviews Table**
```sql
- id (PK, Auto-increment)
- provider_id (INTEGER, FK to users.id, Indexed)
- customer_id (INTEGER, FK to users.id, Indexed)
- booking_id (INTEGER, FK to bookings.id, Indexed)
- job_code (VARCHAR 20, Optional, Legacy)
- rating (NUMERIC 3,1: 1.0 to 5.0)
- comment (TEXT, Optional)
- created_at (TIMESTAMP with timezone)
```

#### 6. **Saved Providers Table**
```sql
- id (PK, Auto-increment)
- customer_phone (VARCHAR 15, Indexed)
- provider_phone (VARCHAR 15, Indexed)
- created_at (TIMESTAMP with timezone)
```

#### 7. **OTP Verification Table**
```sql
- id (PK, Auto-increment)
- phone (VARCHAR 15, Indexed)
- otp (VARCHAR 6)
- expires_at (TIMESTAMP with timezone)
- is_used (BOOLEAN, Default false)
- attempts (INTEGER, Default 0)
- created_at (TIMESTAMP with timezone)
```

#### 8. **Job Codes Table** (Legacy - for future use)
```sql
- id (PK, Auto-increment)
- code (VARCHAR 20, Unique, Indexed)
- provider_id (INTEGER, FK to users.id)
- status (ENUM: active, used, expired)
- expires_at (TIMESTAMP with timezone)
- used_at (TIMESTAMP with timezone, Optional)
- created_at (TIMESTAMP with timezone)
```

### Database Features
- **SQLAlchemy ORM**: Object-relational mapping
- **Alembic Migrations**: Version-controlled schema changes
- **GeoAlchemy2**: Geographic data support
- **Timezone-Aware Timestamps**: UTC timestamps with timezone
- **Indexes**: Optimized queries on phone numbers, status, IDs
- **Foreign Keys**: Referential integrity
- **Enums**: Type-safe status values
- **Connection Pooling**: Efficient database connections

---

## 🎨 User Interface

### 1. 📄 Pages

#### Landing Page (`/`)
- Handshake logo with bouncing animation
- Language selector in top-right
- Two large action cards:
  - "I Need a Service" → Customer sign-up
  - "I Provide Services" → Provider sign-up
- Sign-in link at bottom
- Gradient background (blue theme)
- Hover effects with color transitions

#### Sign In Page (`/signin`)
- Phone number input with 📱 icon
- Password input with 🔒 icon
- OTP login option
- Submit button with loading state
- Links to sign-up pages
- Responsive form validation
- Remember me checkbox
- Forgot password link

#### Customer Sign Up (`/signup/customer`)
- Name field with 👤 icon
- Phone number field with 📱 icon
- Email field with 📧 icon (optional)
- Password field with 🔒 icon
- OTP verification modal
- Terms & conditions checkbox
- Sign-up button with loading state

#### Service Provider Sign Up (`/signup/provider`)
- All customer fields
- Bio/description field with 📝 icon
- Service type selection
- Location field with 📍 icon
- Years of experience field with 🕐 icon
- OTP verification modal
- Professional information section

#### Customer Dashboard (`/dashboard`)
- **Header**:
  - User avatar (clickable for profile)
  - Welcome message with name
  - Language switcher
  - Logout button
  
- **Statistics Cards**:
  - Active bookings
  - Booking history
  - Saved providers
  - Pending bookings
  - Accepted bookings
  - Completed bookings
  
- **Search & Filters**:
  - Search bar with icon
  - Service type dropdown
  - Location filter
  - Minimum rating filter
  - Clear filters button
  
- **Provider Cards Grid**:
  - Responsive 3-column layout (desktop)
  - Provider name and service
  - Rating stars with count
  - Location badge
  - Save/bookmark button
  - Book button
  
- **Bookings Section**:
  - Status filter tabs
  - Booking cards with details
  - Action buttons (Cancel, Verify, Review)
  - Timeline indicators
  
- **Modals**:
  - Provider profile modal
  - Booking creation modal
  - Code verification modal
  - Review submission modal
  - Success confirmation modal

#### Provider Dashboard (`/dashboard`)
- **Header**:
  - Provider avatar and name
  - Average rating display
  - Language switcher
  - Logout button
  
- **Statistics Cards**:
  - Average rating with stars
  - Total reviews
  - Customers served
  - Active bookings
  - Pending requests
  - Accepted jobs
  
- **Tabs**:
  - Pending Requests
  - Accepted Jobs
  - Reviews
  - Served Customers
  - Profile Settings
  
- **Pending Requests**:
  - Request cards with customer info
  - Accept button (green)
  - Reject button (red)
  - Booking details
  
- **Accepted Jobs**:
  - Job cards with status
  - Customer contact
  - Service details
  - Cancel job button
  - Mark complete button
  
- **Reviews Display**:
  - Review cards with ratings
  - Customer names
  - Service types
  - Comments
  - Timestamps
  
- **Profile Editor**:
  - Editable fields
  - Save changes button
  - Profile preview
  - Verification badge

### 2. 🎨 Design System

#### Colors
- **Primary**: Blue gradient (#3498db → #2980b9)
- **Success**: Green (#2ecc71)
- **Danger**: Red (#e74c3c)
- **Warning**: Orange (#f39c12)
- **Info**: Light blue (#3498db)
- **Background**: Light gray (#f5f5f5)
- **Card**: White (#ffffff)
- **Text**: Dark gray (#333333)

#### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold, larger sizes (1.5rem - 2rem)
- **Body**: Regular, 1rem
- **Small Text**: 0.875rem
- **Icons**: Inline with text, scalable

#### Components
- **Buttons**: 
  - Primary (blue gradient)
  - Secondary (white with border)
  - Danger (red)
  - Success (green)
  - Rounded corners (8px)
  - Hover animations (scale, shadow)
  
- **Cards**:
  - White background
  - Box shadow
  - Rounded corners (12px)
  - Hover lift effect
  - Padding (1.5rem)
  
- **Inputs**:
  - Icon prefixes
  - Placeholder text
  - Focus states (blue border)
  - Validation indicators
  - Error messages in red
  
- **Modals**:
  - Centered overlay
  - Backdrop blur
  - Slide-in animation
  - Close button (×)
  - Responsive sizing

#### Icons (React Icons)
- FaUserCircle - User profiles
- FaSearch - Search functionality
- FaTools - Services
- FaCalendarAlt - Scheduling
- FaHeart - Favorites
- FaStar - Ratings
- FaMoneyBillWave - Payments (future)
- FaClipboardList - Bookings
- FaChartLine - Statistics
- FaMapMarkerAlt - Location
- FaClock - Time/scheduling
- FaCheckCircle - Success states
- FaTimes - Close/cancel
- FaEdit - Edit actions
- FaSave - Save actions
- FaEnvelope - Email
- FaPhone - Phone number
- FaHome - Address
- FaBriefcase - Work/services
- FaBookmark - Saved items
- FaLock - Security/password
- FaShieldAlt - Verification
- FaKey - Codes
- FaHistory - History
- FaClipboardCheck - Completion

### 3. 📱 Responsive Design
- **Desktop** (>768px): 3-column grid, full features
- **Tablet** (480px-768px): 2-column grid, optimized spacing
- **Mobile** (360px-480px): Single column, stacked layout
- **Small Mobile** (<360px): Compact view, minimal spacing

---

## 🔧 Technical Stack

### Frontend
- **React 18.3.1**: Modern UI library with hooks
- **React Router DOM 6.28.0**: Client-side routing
- **React Icons 5.4.0**: Scalable icon library
- **Vite 5.4.10**: Fast build tool and dev server
- **CSS3**: Custom responsive styling
- **Context API**: Global state management (Language)
- **LocalStorage**: Token and user data persistence

### Backend
- **FastAPI 0.104.1**: Modern Python web framework
- **Uvicorn 0.24.0**: ASGI server with hot reload
- **SQLAlchemy 2.0.34**: ORM for database operations
- **Alembic 1.12.1**: Database migrations
- **Pydantic 2.5.0**: Data validation
- **Python-Jose 3.3.0**: JWT token handling
- **BCrypt 4.0.1**: Password hashing
- **Passlib 1.7.4**: Password utilities
- **Python-Multipart 0.0.6**: File upload support
- **HTTPX 0.25.2**: Async HTTP client
- **Requests 2.31.0**: HTTP library

### Database
- **PostgreSQL** (via Neon): Cloud-hosted database
- **Psycopg2-binary 2.9.7**: PostgreSQL adapter
- **GeoAlchemy2 0.14.2**: Geographic data types

### External Services
- **Twilio 9.8.3**: SMS and WhatsApp messaging
- **MSG91**: SMS OTP service (alternative)

### Development Tools
- **Python-dotenv 1.0.0**: Environment variable management
- **ESLint**: JavaScript/React linting
- **Hot Reload**: Auto-refresh on code changes

---

## 🚀 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/resend-otp` - Resend OTP
- `GET /auth/test` - Test database connection

### Providers (`/providers`)
- `POST /providers/profile` - Create provider profile
- `PUT /providers/profile` - Update provider profile
- `GET /providers/profile` - Get my provider profile
- `GET /providers/profile/{provider_id}` - Get provider by ID (public)
- `DELETE /providers/profile` - Delete provider profile

### Customers (`/customers`)
- `POST /customers/profile` - Create customer profile
- `PUT /customers/profile` - Update customer profile
- `GET /customers/profile` - Get my customer profile
- `GET /customers/profile/{customer_id}` - Get customer by ID (public)
- `DELETE /customers/profile` - Delete customer profile

### Dashboard (`/dashboard`)

#### Customer Endpoints
- `GET /dashboard/customer/stats` - Get customer statistics
- `GET /dashboard/customer/providers` - Get providers list (with filters)
- `GET /dashboard/customer/bookings` - Get customer bookings
- `POST /dashboard/customer/create-booking` - Create new booking
- `POST /dashboard/customer/cancel-booking` - Cancel booking
- `POST /dashboard/customer/verify-acceptance-code` - Verify acceptance code
- `POST /dashboard/customer/complete-booking` - Mark work as finished
- `POST /dashboard/customer/create-review` - Submit mandatory review
- `POST /dashboard/customer/save-provider` - Save provider to favorites
- `POST /dashboard/customer/unsave-provider` - Remove from favorites

#### Provider Endpoints
- `GET /dashboard/provider/stats` - Get provider statistics
- `GET /dashboard/provider/pending-requests` - Get pending booking requests
- `GET /dashboard/provider/accepted-jobs` - Get accepted jobs
- `POST /dashboard/provider/accept-booking` - Accept booking request
- `POST /dashboard/provider/reject-booking` - Reject booking request
- `POST /dashboard/provider/cancel-job` - Cancel accepted job

### Job Codes (`/job-codes`) - Legacy
- `POST /job-codes/generate/{provider_id}` - Generate job code
- `POST /job-codes/validate` - Validate job code
- `GET /job-codes/provider/{provider_id}` - Get provider codes

### OTP (`/auth`)
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/resend-otp` - Resend OTP

### Health
- `GET /` - API root (health check)
- `GET /health` - Health status

---

## 🔒 Security Features

### 1. Input Validation
- Pydantic schemas for all API requests
- Phone number validation (10-15 digits)
- Email format validation
- Password strength requirements
- SQL injection prevention (parameterized queries)
- XSS protection (sanitized inputs)

### 2. Authentication Security
- JWT token expiration (8 hours)
- Token revocation on logout
- Secure password hashing (BCrypt with salt)
- OTP expiry (5 minutes)
- OTP attempt limiting (3 attempts max)
- Rate limiting on OTP requests (1 minute cooldown)

### 3. Authorization
- Role-based access control (RBAC)
- Protected API endpoints
- Frontend route guards
- Token validation middleware
- User ownership verification

### 4. Data Protection
- HTTPS enforcement (production)
- CORS configuration
- Environment variable security (.env)
- Database connection security
- Phone number normalization (privacy)

### 5. Error Handling
- Graceful error responses
- No sensitive data in error messages
- Logging for debugging (without PII)
- HTTP status codes (401, 403, 404, 500)

---

## 🌐 Internationalization (i18n)

### Supported Languages
1. **English** (en)
2. **हिंदी** (hi) - Hindi
3. **मराठी** (mr) - Marathi

### Translation Coverage
- Navigation menus
- Form labels and placeholders
- Buttons and CTAs
- Error messages
- Success messages
- Dashboard statistics
- Booking status
- Review prompts
- Notification text

### Language Context
```javascript
{
  welcomeBack: "Welcome Back",
  logout: "Logout",
  dashboard: "Dashboard",
  bookings: "Bookings",
  providers: "Providers",
  profile: "Profile",
  // ... 100+ translations
}
```

---

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading routes
- **Vite Build**: Fast HMR and bundling
- **CSS Optimization**: Minimal, scoped styles
- **Image Optimization**: Compressed assets
- **Caching**: LocalStorage for user data
- **Debouncing**: Search input optimization
- **Pagination**: Limited results per page (100)

### Backend
- **Database Indexing**: Phone numbers, IDs, status fields
- **Query Optimization**: 
  - JOIN reduction
  - Selective field queries
  - Aggregation functions (AVG, COUNT)
- **Connection Pooling**: SQLAlchemy engine
- **Async Operations**: FastAPI async endpoints
- **Caching**: Future Redis integration planned

### Database
- **Indexes**: On frequently queried fields
- **Foreign Keys**: Efficient relationships
- **Enum Types**: Type-safe status values
- **Timestamp Indexes**: Date range queries
- **Composite Indexes**: Multi-column searches (future)

---

## 🎬 User Flows

### Customer Booking Flow
```
1. Sign Up/Login
   ↓
2. Browse Providers (Search, Filter)
   ↓
3. View Provider Profile
   ↓
4. Create Booking (Immediate/Scheduled)
   ↓
5. Receive One-Time Code
   ↓
6. Wait for Provider Acceptance
   ↓
7. Receive Acceptance Code (WhatsApp)
   ↓
8. Verify Provider on Arrival
   ↓
9. Service Completed
   ↓
10. Request Completion Code
    ↓
11. Submit Mandatory Review
    ↓
12. Booking Complete ✅
```

### Provider Workflow
```
1. Sign Up/Login
   ↓
2. Complete Provider Profile
   ↓
3. Receive Booking Notification (WhatsApp)
   ↓
4. View Booking Request Details
   ↓
5. Accept/Reject Request
   ↓
6. Generate Acceptance Code (if accepted)
   ↓
7. Contact Customer
   ↓
8. Arrive & Verify Code
   ↓
9. Provide Service
   ↓
10. Generate Completion Code
    ↓
11. Customer Submits Review
    ↓
12. Rating Updated ⭐
```

---

## 🔮 Future Enhancements (Planned)

### Phase 2 Features
- [ ] Payment Integration (Razorpay/Stripe)
- [ ] In-app Chat System
- [ ] Real-time Location Tracking
- [ ] Service Categories Expansion
- [ ] Multi-image Upload for Services
- [ ] Video Testimonials
- [ ] Promotional Offers/Coupons
- [ ] Subscription Plans for Providers
- [ ] Advanced Analytics Dashboard
- [ ] Mobile App (React Native)

### Phase 3 Features
- [ ] AI-Powered Provider Recommendations
- [ ] Voice-Based Booking (Accessibility)
- [ ] Background Verification for Providers
- [ ] Insurance Integration
- [ ] Emergency Service Bookings (24/7)
- [ ] Multi-city Expansion
- [ ] Corporate Accounts
- [ ] API for Third-party Integration

---

## 📊 Key Metrics & Analytics

### Customer Metrics
- Total registered customers
- Active customers (last 30 days)
- Average bookings per customer
- Customer retention rate
- Saved providers per customer
- Review submission rate

### Provider Metrics
- Total registered providers
- Active providers (last 30 days)
- Average rating per provider
- Jobs completed per provider
- Acceptance rate (accepted/total requests)
- Rejection rate
- Cancellation rate

### Booking Metrics
- Total bookings created
- Booking completion rate
- Average time to acceptance
- Average service duration
- Immediate vs Scheduled bookings ratio
- Cancellation reasons

### System Metrics
- API response times
- Database query performance
- OTP delivery success rate
- WhatsApp notification delivery rate
- Error rates by endpoint
- User session duration

---

## 🛠️ Development & Deployment

### Local Development Setup
```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Backend
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# JWT
SECRET_KEY=your-secret-key

# OTP Services
OTP_PROVIDER=TWILIO  # or MSG91
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
MSG91_AUTH_KEY=your-key
MSG91_SENDER_ID=your-sender-id
MSG91_DLT_TEMPLATE_ID=your-template-id

# Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=3
DEVELOPMENT_MODE=false
WEBSITE_URL=http://localhost:5175
```

### Production Deployment
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Render, or AWS EC2
- **Database**: Neon PostgreSQL (already configured)
- **CDN**: Cloudflare for static assets
- **Monitoring**: Sentry for error tracking
- **Logging**: CloudWatch or Datadog

---

## 📄 License & Contributors

### License
Apache License 2.0 - See LICENSE file for details

### Contributors
| Name | GitHub | Role |
|------|--------|------|
| Aarya Khatate | [@AaryaKhatate](https://github.com/AaryaKhatate) | Frontend Developer |
| Chetan Chaudhari | [@Ai-Chetan](https://github.com/Ai-Chetan) | Backend Developer |
| Nischay Chavan | [@Nischay-loq](https://github.com/Nischay-loq) | Full Stack Developer |
| Parth Shikhare | [@ParthShikhare19](https://github.com/ParthShikhare19) | Project Lead |
| Vinay Gone | [@vinaygone2006](https://github.com/vinaygone2006) | Backend Developer |
| Yashraj Patil | [@Yashrajpatil22](https://github.com/Yashrajpatil22) | UI/UX Designer |

---

## 📞 Support & Contact

### Repository
- **GitHub**: [github.com/ParthShikhare19/do-my-service](https://github.com/ParthShikhare19/do-my-service)
- **Issues**: Report bugs or feature requests via GitHub Issues
- **Pull Requests**: Contributions welcome!

### Project Website
- **Production URL**: [To be deployed]
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **API Redoc**: `http://localhost:8000/redoc`

---

## 🎯 Project Goals & Impact

### Social Impact
- **Empower Local Businesses**: Low-barrier entry for service providers
- **Build Community Trust**: Transparent reviews and ratings
- **Digital Inclusion**: Multi-language support and accessibility
- **Fair Pricing**: No high commission fees (unlike competitors)
- **Local Economy Growth**: Keep money in local communities

### Technical Excellence
- **Modern Tech Stack**: React, FastAPI, PostgreSQL
- **Scalable Architecture**: Microservices-ready design
- **Security First**: Industry-standard authentication
- **Performance**: Fast load times and real-time updates
- **Maintainability**: Clean code and documentation

### User Experience
- **Simplicity**: Intuitive interface for all literacy levels
- **Reliability**: High uptime and error handling
- **Accessibility**: Icon-based navigation and multi-language
- **Trust**: Verified reviews and code verification system
- **Convenience**: Immediate and scheduled bookings

---

## 📸 Demo Screenshots & Video Guide

### For Pitch Video
1. **Landing Page**: Show handshake logo and language selection
2. **Sign Up Flow**: Demonstrate OTP verification
3. **Customer Dashboard**: Browse providers, search, filters
4. **Provider Profile**: Show ratings, reviews, bio
5. **Booking Creation**: Immediate vs Scheduled booking
6. **WhatsApp Notifications**: Show real notifications
7. **Provider Dashboard**: Pending requests, accept/reject
8. **Review System**: Show mandatory review submission
9. **Multi-language**: Switch between English, Hindi, Marathi
10. **Mobile Responsive**: Show on different screen sizes

### Demo Script Suggestions
```
"DoMyService bridges the gap between local service providers
and customers, addressing the Local Services Trust Problem.

✅ Multi-language support (English, Hindi, Marathi)
✅ Icon-based navigation for all literacy levels
✅ OTP-based authentication for security
✅ Real-time WhatsApp notifications
✅ Mandatory review system for trust building
✅ Dual dashboards for customers and providers
✅ Immediate and scheduled booking options
✅ Advanced search and filtering
✅ Save favorite providers
✅ Code verification system for authenticity

Built with React, FastAPI, and PostgreSQL
Deployed on modern cloud infrastructure
Ready to scale and serve communities!
"
```

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
