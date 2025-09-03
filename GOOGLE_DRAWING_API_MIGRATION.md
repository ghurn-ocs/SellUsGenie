# Google Drawing API Migration Plan

## Overview
Google deprecated the Maps JavaScript API Drawing Library in August 2025, with full removal scheduled for May 2026. This document outlines the migration strategy for SellUsGenie's delivery area creation functionality.

## Current Implementation
- **Component**: `src/components/settings/DeliveryAreasSettings.tsx`
- **Feature**: Interactive map-based delivery area creation
- **API Used**: `google.maps.drawing.DrawingManager`
- **Functionality**: Circle and polygon drawing tools for defining delivery zones

## Deprecation Timeline
- **Deprecation Date**: August 2025
- **End of Support**: May 2026
- **Current Status**: Still functional, deprecation warning appears in console

## Migration Strategy

### Phase 1: Immediate (Current)
✅ **Document the deprecation** - Add warning comments to affected files
✅ **Continue using current implementation** - API remains functional until May 2026
✅ **Monitor for updates** - Check Google's documentation for replacement announcements

### Phase 2: Planning (Q1 2026)
🔄 **Research replacement options**:
   - Custom drawing implementation using Maps JavaScript API overlays
   - Third-party drawing libraries that work with Google Maps
   - Alternative map providers (Mapbox, OpenStreetMap) with drawing capabilities

### Phase 3: Implementation (Q2 2026 - Before May deadline)
📋 **Replace DrawingManager with custom solution**:
   - Implement circle drawing using `google.maps.Circle`
   - Implement polygon drawing using `google.maps.Polygon`
   - Create custom UI controls for drawing mode selection
   - Maintain existing UX and functionality

## Technical Requirements for Replacement

### Circle Drawing
```javascript
// Replace DrawingManager circle with manual implementation
const circle = new google.maps.Circle({
  center: { lat: lat, lng: lng },
  radius: radiusInMeters,
  fillColor: '#FF0000',
  fillOpacity: 0.35,
  strokeWeight: 2,
  clickable: false,
  editable: true,
  zIndex: 1
});
```

### Polygon Drawing
```javascript
// Replace DrawingManager polygon with click-to-draw implementation
const polygon = new google.maps.Polygon({
  paths: coordinatesArray,
  fillColor: '#FF0000',
  fillOpacity: 0.35,
  strokeWeight: 2,
  clickable: false,
  editable: true
});
```

### Custom Drawing Controls
- Create toolbar buttons for circle/polygon mode selection
- Handle map click events to capture user drawing input
- Implement drawing state management
- Add edit/delete functionality for created shapes

## Risk Assessment
- **Low Risk**: 9+ month timeline until forced migration
- **Medium Complexity**: Custom implementation required but well-documented patterns exist
- **No Data Loss**: Current delivery areas stored in database remain unaffected
- **User Impact**: Minimal if migration completed before May 2026

## Action Items
- [ ] Monitor Google's developer announcements for potential replacement APIs
- [ ] Create proof-of-concept custom drawing implementation (Q1 2026)
- [ ] Test custom implementation with existing delivery area data
- [ ] Deploy replacement before May 2026 deadline

## Related Files
- `src/components/settings/DeliveryAreasSettings.tsx` - Main component using DrawingManager
- `src/utils/googleMapsLoader.ts` - Google Maps API loader with 'drawing' library
- `src/types/deliveryAreas.ts` - Delivery area data types (unaffected)

## Resources
- [Google Maps Deprecations](https://developers.google.com/maps/deprecations)
- [Maps JavaScript API Overlays](https://developers.google.com/maps/documentation/javascript/overlays)
- [Drawing Tools Example](https://developers.google.com/maps/documentation/javascript/examples/drawing-tools)