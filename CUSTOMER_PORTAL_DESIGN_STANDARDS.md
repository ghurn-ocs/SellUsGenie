# Customer Portal Design Standards

## Overview

This document defines the standardized design system for the SellUsGenie Customer Portal, based on the Analytics page layout which serves as the baseline standard for all pages in terms of layout and design for headings, buttons, tabs, and tiles.

## Design Principles

1. **Consistency**: All pages follow the same visual patterns and component styling
2. **Accessibility**: Clear visual hierarchy with appropriate contrast and spacing
3. **Responsive**: Layouts adapt gracefully across all screen sizes
4. **Professional**: Dark theme with purple accent color matching brand identity

## CSS Classes Reference

### Page Layout

#### Page Container
```css
.portal-page
```
- **Purpose**: Main page wrapper with consistent spacing
- **Usage**: Applied to the root container of each tab content area
- **Styles**: `space-y-6` - 1.5rem vertical spacing between sections

### Headers

#### Main Page Title
```css
.portal-title
```
- **Purpose**: Primary page headings
- **Styles**: `text-2xl font-bold text-white flex items-center space-x-3`
- **Usage**: Main tab titles with icon

#### Title Icon
```css
.portal-title-icon  
```
- **Purpose**: Icons next to main titles
- **Styles**: `w-7 h-7 text-[#9B51E0]` - Purple brand color

#### Subtitle
```css
.portal-subtitle
```
- **Purpose**: Descriptive text under main titles
- **Styles**: `text-[#A0A0A0] mt-1` - Muted gray text

#### Section Headers
```css
.portal-tile-header
```
- **Purpose**: Headers within content tiles/cards
- **Styles**: `text-lg font-semibold text-white mb-4 flex items-center space-x-2`

#### Header Icon
```css
.portal-tile-header-icon
```
- **Purpose**: Icons in section headers
- **Styles**: `w-5 h-5 text-[#9B51E0]`

### Navigation

#### Tab Container
```css
.portal-tabs
```
- **Purpose**: Main tab navigation container
- **Styles**: Full-width pill-style navigation with dark background
- **Features**: `flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm w-full`

#### Tab Button
```css
.portal-tab
```
- **Purpose**: Individual tab buttons
- **Styles**: Centered content with equal width distribution
- **Features**: `flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap`

#### Active Tab
```css
.portal-tab-active
```
- **Purpose**: Styling for selected/active tab
- **Styles**: `bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]`

#### Inactive Tab
```css
.portal-tab-inactive
```
- **Purpose**: Styling for unselected tabs
- **Styles**: `text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]`

#### Tab Icon
```css
.portal-tab-icon
```
- **Purpose**: Icons within tab buttons
- **Styles**: `w-4 h-4`

### Buttons

#### Primary Button
```css
.portal-btn-primary
```
- **Purpose**: Main action buttons (Add, Save, Submit, etc.)
- **Styles**: Purple background with white text
- **Features**: `flex items-center space-x-2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors`

#### Secondary Button  
```css
.portal-btn-secondary
```
- **Purpose**: Secondary actions (Cancel, Export, Filter, etc.)
- **Styles**: Gray background with muted text
- **Features**: `flex items-center space-x-2 px-3 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors`

#### Button Icon
```css
.portal-btn-icon
```
- **Purpose**: Icons within buttons
- **Styles**: `w-4 h-4`

### Content Areas

#### Main Content
```css
.portal-content
```
- **Purpose**: Main content areas within tabs
- **Styles**: `space-y-6` - Consistent vertical spacing

#### Tiles/Cards
```css
.portal-tile
```
- **Purpose**: Primary content containers
- **Styles**: Dark background with border and padding
- **Features**: `bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6`

#### Inner Tiles
```css
.portal-tile-inner
```
- **Purpose**: Nested content containers within tiles
- **Styles**: Darker background for visual hierarchy
- **Features**: `bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-4`

### KPI Cards

#### KPI Grid
```css
.portal-kpi-grid
```
- **Purpose**: Grid layout for KPI/metric cards
- **Styles**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

#### KPI Card
```css
.portal-kpi-card
```
- **Purpose**: Individual KPI/metric cards
- **Styles**: `bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6`

#### KPI Content Layout
```css
.portal-kpi-content
```
- **Purpose**: Internal layout for KPI cards
- **Styles**: `flex items-center justify-between`

#### KPI Text Styles
```css
.portal-kpi-label    /* Metric labels */
.portal-kpi-value    /* Main metric values */
.portal-kpi-metric   /* Secondary metrics */
```

#### KPI Icons
```css
.portal-kpi-icon-container  /* Icon background containers */
.portal-kpi-icon           /* Icons themselves */
```

### Data Lists

#### List Item
```css
.portal-list-item
```
- **Purpose**: Individual items in data lists
- **Styles**: `flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]`

#### List Item Layout
```css
.portal-list-item-content  /* Left side content */
.portal-list-item-actions  /* Right side actions */
```

### Notices & Alerts

#### Notice Banner
```css
.portal-notice
```
- **Purpose**: Important notices and alerts
- **Styles**: Purple gradient background
- **Features**: `bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-6 mb-6`

#### Notice Layout
```css
.portal-notice-content      /* Main content layout */
.portal-notice-icon-container  /* Icon container */
.portal-notice-icon         /* Notice icon */
.portal-notice-body         /* Text content */
.portal-notice-title        /* Notice title */
.portal-notice-text         /* Notice description */
```

### Empty States

#### Empty State Container
```css
.portal-empty-state
```
- **Purpose**: Empty state placeholders
- **Styles**: `py-12 text-center`

#### Empty State Elements
```css
.portal-empty-state-icon    /* Large placeholder icon */
.portal-empty-state-title   /* Empty state title */
.portal-empty-state-text    /* Empty state description */
```

### Utility Classes

#### Text Colors
```css
.portal-text-positive  /* Green for positive values */
.portal-text-negative  /* Red for negative values */
.portal-text-info      /* Blue for informational text */
.portal-text-warning   /* Yellow for warnings */
.portal-text-muted     /* Gray for secondary text */
.portal-text-subtle    /* Light gray for subtle text */
```

## Implementation Guidelines

### 1. Page Structure
Every page should follow this structure:
```jsx
<div className="portal-page">
  {/* Tab navigation */}
  <div className="portal-tabs">
    {/* Tab buttons with portal-tab classes */}
  </div>
  
  {/* Content areas */}
  <div className="portal-content">
    <div className="portal-tile">
      <h3 className="portal-tile-header">
        <IconComponent className="portal-tile-header-icon" />
        Section Title
      </h3>
      {/* Content */}
    </div>
  </div>
</div>
```

### 2. Color Scheme
- **Background**: `#1A1A1A` (main), `#2A2A2A` (tiles), `#1E1E1E` (inner)
- **Borders**: `#3A3A3A` (primary), `#4A4A4A` (active states)
- **Text**: `#FFFFFF` (primary), `#A0A0A0` (secondary), `#6B7280` (subtle)
- **Accent**: `#9B51E0` (purple brand color)
- **States**: Green (`#22C55E`), Red (`#EF4444`), Blue (`#3B82F6`), Yellow (`#EAB308`)

### 3. Spacing System
- **Page sections**: `space-y-6` (1.5rem)
- **Card padding**: `p-6` (1.5rem)
- **Inner padding**: `p-4` (1rem)
- **Button padding**: `px-3 py-2`
- **Grid gaps**: `gap-6`

### 4. Typography
- **Main titles**: `text-2xl font-bold`
- **Section headers**: `text-lg font-semibold`
- **Body text**: `text-sm font-medium`
- **Labels**: `text-sm font-medium`
- **Values**: `text-2xl font-bold`

### 5. Icons
- **Title icons**: `w-7 h-7`
- **Header icons**: `w-5 h-5`
- **Button icons**: `w-4 h-4`
- **KPI icons**: `w-6 h-6`
- **Large icons**: `w-16 h-16` (empty states)

## Usage Examples

### Basic Page Structure
```jsx
import { BarChart3, Plus, Download } from 'lucide-react'

const MyPage = () => (
  <div className="portal-page">
    <div className="portal-header">
      <div>
        <h1 className="portal-title">
          <BarChart3 className="portal-title-icon" />
          <span>Page Title</span>
        </h1>
        <p className="portal-subtitle">Page description</p>
      </div>
      <div className="portal-header-actions">
        <button className="portal-btn-secondary">
          <Download className="portal-btn-icon" />
          <span>Export</span>
        </button>
        <button className="portal-btn-primary">
          <Plus className="portal-btn-icon" />
          <span>Add Item</span>
        </button>
      </div>
    </div>
    
    <div className="portal-tile">
      <h3 className="portal-tile-header">
        <BarChart3 className="portal-tile-header-icon" />
        <span>Section Title</span>
      </h3>
      {/* Content */}
    </div>
  </div>
)
```

### KPI Grid
```jsx
<div className="portal-kpi-grid">
  <div className="portal-kpi-card">
    <div className="portal-kpi-content">
      <div>
        <p className="portal-kpi-label">Revenue</p>
        <p className="portal-kpi-value">$12,345</p>
        <p className="portal-kpi-metric portal-text-positive">+15.2%</p>
      </div>
      <div className="portal-kpi-icon-container bg-green-500/20">
        <DollarSign className="portal-kpi-icon text-green-400" />
      </div>
    </div>
  </div>
</div>
```

## Files Modified

1. **`src/index.css`** - Added all portal CSS classes
2. **`src/pages/StoreOwnerDashboard.tsx`** - Applied standards to all tabs
3. **`src/components/analytics/WorldClassAnalyticsDashboard.tsx`** - Original baseline reference

## Benefits

1. **Consistency**: All pages now have identical visual appearance and behavior
2. **Maintainability**: Changes to design can be made in one place (CSS)
3. **Developer Experience**: Clear, semantic class names make development faster
4. **Scalability**: New pages can easily adopt the standard patterns
5. **Quality**: Professional appearance across the entire Customer Portal

The Analytics page layout now serves as the authoritative design standard for the entire Customer Portal, ensuring a cohesive and professional user experience.