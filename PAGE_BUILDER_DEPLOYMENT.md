# Page Builder Separate Deployment Guide

The Visual Page Builder has been separated from the main SellUsGenie application and can now be deployed independently.

## 📁 **Architecture Overview**

### Main Application
- **Entry Point**: `index.html` → `src/main.tsx` → `src/App.tsx`
- **Purpose**: Core e-commerce platform with store management, products, orders, etc.
- **URL**: `http://localhost:5173/` (development) or your main domain

### Page Builder Application  
- **Entry Point**: `page-builder.html` → `src/page-builder-main.tsx` → `src/PageBuilderApp.tsx`
- **Purpose**: Standalone WYSIWYG visual page builder with canvas functionality
- **URL**: `http://localhost:5173/page-builder.html` (development) or separate subdomain

## 🚀 **Development**

### Run Both Applications
```bash
npm run dev
```
- Main app: http://localhost:5173/
- Page builder: http://localhost:5173/page-builder.html

### Build for Production
```bash
npm run build
```
This creates both applications in the `dist/` folder:
- `dist/index.html` - Main application
- `dist/page-builder.html` - Page builder application

## 📦 **Deployment Options**

### Option 1: Same Server, Different Paths
Deploy both to the same server:
- Main app: `https://yoursite.com/`
- Page builder: `https://yoursite.com/page-builder.html`

### Option 2: Separate Subdomains (Recommended)
Deploy to different subdomains:
- Main app: `https://app.sellUsgenie.com/`
- Page builder: `https://builder.sellUsgenie.com/`

### Option 3: Completely Separate Deployments
Deploy to different servers/services:
- Main app: `https://sellUsgenie.com/`
- Page builder: `https://pagebuilder.sellUsgenie.com/`

## 🔧 **Configuration**

### Vite Configuration
The `vite.config.ts` has been updated to support multiple entry points:

```typescript
export default defineConfig({
  // ...
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        'page-builder': './page-builder.html'
      }
    }
  }
})
```

### Shared Dependencies
Both applications share:
- ✅ Authentication contexts
- ✅ Store contexts  
- ✅ UI components
- ✅ Styling (Tailwind CSS)
- ✅ Database connections (Supabase)

## 🎯 **Page Builder Features**

The standalone page builder includes:

- 🎨 **Sandboxed iframe canvas** with style isolation
- 🏗️ **Element templates library** (headings, buttons, layouts, etc.)
- 🎯 **Advanced drag-and-drop** with visual indicators
- 📱 **Responsive breakpoint controls** (mobile/tablet/desktop)
- ✏️ **Real-time style editing** with comprehensive style panel
- 🍞 **Breadcrumb navigation** for element hierarchy
- ⚡ **Error handling** with user-friendly boundaries
- ⌨️ **Keyboard shortcuts** (Ctrl+Z/Y, Delete, Escape)
- 💾 **Save/load functionality** (TODO: implement persistence)

## 🔐 **Authentication**

Both applications use the same authentication system:
- Users must be logged in to access the page builder
- Shared session state between applications
- Automatic redirect to login if not authenticated

## 📝 **Files Structure**

```
src/
├── main.tsx                    # Main app entry
├── page-builder-main.tsx       # Page builder entry  
├── App.tsx                     # Main app routes
├── PageBuilderApp.tsx          # Page builder routes
├── pageBuilder/
│   └── canvas/                 # Canvas components
│       ├── CanvasEditor.tsx    # Main editor
│       ├── components/         # UI components
│       ├── store/              # State management
│       └── types/              # TypeScript types
└── ...

# Root files
├── index.html                  # Main app HTML
├── page-builder.html           # Page builder HTML
└── vite.config.ts             # Build configuration
```

## 🚀 **Next Steps**

1. **Deploy separately** to test performance and isolation
2. **Implement save/load** functionality for pages
3. **Add page management** UI in main app to launch builder
4. **Set up CDN** for optimal performance
5. **Configure proper CORS** if using different domains

## 💡 **Benefits of Separation**

- ✅ **Better performance** - Smaller bundle sizes
- ✅ **Independent scaling** - Scale page builder separately
- ✅ **Isolated deployments** - Update without affecting main app
- ✅ **Security** - Separate access controls if needed
- ✅ **Development** - Teams can work independently