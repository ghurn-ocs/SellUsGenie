# Genie Image Mapping

This document describes how the original genie image files were mapped to mood-based naming for automatic loading in the GenieMascot component.

## Image Mappings

| Original Filename | New Filename | Mood | Usage Context |
|------------------|--------------|------|---------------|
| `SellUsGenie-Logo-Hover-Translucent-Purple.png` | `SellUsGenie-Logo-Hover-Translucent-Purple.png` | **main** / **hover** | Main logo, headers, default fallback |
| `SellUsGenie-Logo-Hover-Clapping-Translucent-Purple.png` | `SellUsGenie-Excited.png` | **excited** | Landing page hero, celebrations |
| `SellUsGenie-Logo-Flying-Translucent-Purple.png` | `SellUsGenie-Happy.png` | **happy** | API documentation, positive interactions |
| `SellUsGenie-Logo-Standing-Translucent-Purple.png` | `SellUsGenie-Helpful.png` | **helpful** | Help section, support areas |
| `SellUsGenie-Logo-Seated-Translucent-Purple.png` | `SellUsGenie-Thinking.png` | **thinking** | Video tutorials, learning content |
| `SellUsGenie-Logo-AhOh-Translucent-Purple.png` | `SellUsGenie-Confused.png` | **confused** | Error states, troubleshooting |

## Component Usage

The GenieMascot component automatically loads the appropriate image based on the mood prop:

```tsx
import { GenieMascot, GenieLogotype } from '../components/ui/GenieMascot'

// Different mood examples
<GenieMascot mood="excited" size="xl" showBackground />
<GenieMascot mood="helpful" size="lg" />
<GenieLogotype size="md" /> // Uses main logo
```

## Mood Applications

- **Main Logo**: Headers, navigation, branding
- **Excited**: Landing page, success states, achievements
- **Happy**: General positive interactions, API docs
- **Helpful**: Help sections, support, guidance
- **Thinking**: Educational content, tutorials, learning
- **Confused**: Error states, troubleshooting, FAQ

## Fallback System

The component includes automatic fallback to the main logo if a specific mood image is not found, ensuring robust operation even if some image files are missing.