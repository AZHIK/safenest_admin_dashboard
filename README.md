# SafeNest Response Coordination Center

A production-grade Next.js dashboard for emergency response coordination and case management in the SafeNest ecosystem.

## 🚀 Overview

This is the stakeholder web platform for SafeNest - a comprehensive GBV (Gender-Based Violence) safety and emergency response system. The dashboard serves as the central command center for administrators, law enforcement, legal authorities, counselors, and other verified response stakeholders.

## 🏗️ Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **API Client**: Axios
- **Real-time**: WebSocket (Socket.IO)
- **Maps**: Leaflet/React-Leaflet with OpenStreetMap
- **Charts**: Recharts

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main command center
│   ├── sos/              # SOS monitoring
│   ├── cases/            # Case management
│   ├── messages/         # Encrypted communication
│   ├── support/          # Support center management
│   ├── training/         # Training content
│   ├── users/            # User & stakeholder management
│   ├── analytics/        # Analytics & reporting
│   ├── audit/            # Audit logs
│   └── settings/         # System settings
├── components/            # Reusable UI components
│   ├── ui/               # Base shadcn/ui components
│   ├── layout/           # Dashboard layout components
│   ├── forms/            # Form components
│   ├── tables/           # Table components
│   ├── maps/             # Map components
│   └── charts/           # Chart components
├── features/             # Feature-specific components
│   ├── dashboard/        # Dashboard features
│   ├── sos-monitoring/    # SOS monitoring features
│   ├── case-management/  # Case management features
│   ├── communication/     # Messaging features
│   ├── support-centers/   # Support center features
│   ├── training-content/  # Training features
│   ├── user-management/   # User management features
│   ├── analytics/        # Analytics features
│   └── audit-logs/       # Audit features
├── services/             # API and service layer
│   ├── api-client.ts     # Axios HTTP client
│   ├── sos-service.ts    # SOS API service
│   ├── case-service.ts   # Case management service
│   ├── message-service.ts # Messaging service
│   └── websocket-service.ts # WebSocket service
├── store/                # Zustand state management
│   ├── auth-store.ts     # Authentication state
│   ├── sos-store.ts      # SOS state
│   └── ui-store.ts       # UI state
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── config/               # Configuration files
```

## 🔐 Authentication & Authorization

### Stakeholder Roles
- **super_admin**: Full system access
- **police**: Law enforcement access
- **legal_officer**: Legal case management
- **counselor**: Counseling and support
- **help_center**: Support center operations
- **ngo_manager**: NGO coordination
- **regional_manager**: Regional oversight

### Permission System
Role-based access control with granular permissions for:
- Dashboard viewing
- SOS management
- Case handling
- User management
- Analytics access
- Audit log viewing

## 🎯 Core Modules

### 1. Real-time Command Center
- Live SOS alert feed
- Active incident map
- Quick action panel
- Recent case updates
- Online responder status

### 2. SOS Monitoring
- Real-time alert tracking
- Location history visualization
- Alert severity management
- Responder assignment
- Status updates

### 3. Case Management
- Incident report handling
- Evidence management
- Case workflow tracking
- Assignment and escalation
- Timeline activity logs

### 4. Encrypted Communication
- Secure messaging with users
- Internal responder coordination
- File sharing capabilities
- Message history
- Real-time notifications

### 5. Support Center Management
- Center registration and verification
- Geographic mapping
- Service categorization
- Status management
- Contact information

### 6. Training Content Management
- Lesson creation and editing
- Category management
- Publishing workflow
- Content organization
- User progress tracking

### 7. User & Stakeholder Management
- User account management
- Stakeholder verification
- Permission assignment
- Activity monitoring
- Profile management

### 8. Analytics & Reporting
- SOS trend analysis
- Response time metrics
- Regional incident data
- Stakeholder activity reports
- Case closure statistics

### 9. Audit Logs
- Comprehensive activity tracking
- Access logging
- Change history
- Compliance reporting
- Security monitoring

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (for backend)
- Redis (for caching/sessions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AZHIK/safenest_admin_dashboard.git
cd safenest-admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Map Configuration (OpenStreetMap - no API key required)
NEXT_PUBLIC_DEFAULT_LAT=40.7128
NEXT_PUBLIC_DEFAULT_LNG=-74.0060

# Development
NODE_ENV=development
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t safenest-dashboard .
docker run -p 3000:3000 safenest-dashboard
```

## 🔌 API Integration

The dashboard integrates with the SafeNest FastAPI backend:

- **Authentication**: JWT-based with refresh tokens
- **Real-time**: WebSocket connections for live updates
- **File Upload**: Multipart form data for evidence
- **Pagination**: Consistent across all endpoints
- **Error Handling**: Centralized error management

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Stakeholder login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Current user info

#### SOS Management
- `GET /api/v1/sos/active` - Active alerts
- `POST /api/v1/sos/trigger` - Create alert
- `PATCH /api/v1/sos/{id}/status` - Update status

#### Case Management
- `GET /api/v1/reports/my-reports` - User reports
- `POST /api/v1/reports/create` - New report
- `GET /api/v1/reports/{id}` - Report details

## 🎨 UI Components

### Design System
- **Colors**: Emergency-focused color palette
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable shadcn/ui components

### Responsive Design
- Desktop-first approach
- Mobile-responsive layouts
- Touch-friendly interactions
- Accessible design patterns

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based permissions
- **Data Protection**: Encrypted communications
- **Audit Trail**: Comprehensive logging
- **Input Validation**: Client and server-side
- **CSRF Protection**: Built-in Next.js security

## 📊 Real-time Features

- **WebSocket Integration**: Live updates
- **Event Types**: SOS triggers, case updates, messages
- **Connection Management**: Auto-reconnection
- **Room-based**: Targeted updates
- **Error Handling**: Graceful degradation

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📈 Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: API response caching
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Performance Monitoring**: Built-in metrics

## 🔧 Configuration

### Next.js Configuration
- App Router enabled
- Image optimization
- API routes
- Middleware support

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured
- Type checking
- IDE integration

## 📚 Documentation

- **API Documentation**: OpenAPI/Swagger
- **Component Docs**: Storybook
- **Architecture Docs**: System design
- **Deployment Guide**: Production setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Proprietary - SafeNest Project

## 🆘 Support

For technical support:
- Development Team: dev@safenest.org
- Documentation: docs@safenest.org

---

**⚠️ Emergency System**: This is a safety-critical application. All changes must undergo thorough testing and review before deployment.
