# Frontend - Organization App

A React + TypeScript frontend for the Organization App, built with Vite.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API connection:**
   - Copy `env.example` to `.env.development`:
     ```bash
     cp env.example .env.development
     ```
   - Edit `.env.development` and set your API base URL:
     ```
     VITE_API_BASE=http://localhost:8000
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5174`

### Environment Variables

- `VITE_API_BASE`: The base URL for the FastAPI backend (default: `http://localhost:8000`)

### Development

- **Hot reload**: Changes to source files will automatically reload the browser
- **TypeScript**: Full TypeScript support with type checking
- **Error boundaries**: Runtime errors are caught and displayed instead of white screens
- **API debugging**: Console logs show API calls and responses for easier debugging

### Project Structure

```
src/
├── components/          # React components
│   ├── ErrorBoundary.tsx
│   ├── ItemList.tsx
│   ├── ItemDetail.tsx
│   ├── CreateItem.tsx
│   └── EditItem.tsx
├── lib/
│   └── api.ts          # API client with error handling
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main app component
├── App.css             # App styles
└── main.tsx            # App entry point
```

### API Integration

The frontend uses a custom API client (`src/lib/api.ts`) that:
- Uses environment-based configuration (`VITE_API_BASE`)
- Includes proper error handling with `res.ok` checks
- Provides structured logging for debugging
- Handles both JSON and file upload requests

### Troubleshooting

**Blank white screen:**
- Check browser console for errors
- Verify backend is running on the configured port
- Check that `VITE_API_BASE` is correctly set

**API connection issues:**
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS configuration in backend
- Ensure no firewall blocking the connection

**Build issues:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility