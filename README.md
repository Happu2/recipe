# Violet Recipe Manager

A beautiful, client-side recipe management application with a purple-themed UI that stores all data locally in your browser using localStorage.

![Recipe Manager](https://img.shields.io/badge/version-1.0.0-purple) ![License](https://img.shields.io/badge/license-MIT-blue)

## Table of Contents
- [How to Run the App](#how-to-run-the-app)
- [Data Structure in localStorage](#data-structure-in-localstorage)
- [Assumptions and Limitations](#assumptions-and-limitations)
- [Known Issues](#known-issues)
- [Features](#features)
- [Browser Compatibility](#browser-compatibility)

---

## How to Run the App

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server installation required - runs entirely in the browser

### Option 1: Direct File Opening (Simplest)
1. Clone or download this repository
2. Navigate to the project folder
3. Double-click `index.html` to open it in your default browser

**Note:** Some browsers may block ES6 modules when opening files directly. If you see a CORS error, use Option 2 instead.

### Option 2: Using a Local Web Server (Recommended)

**Using Python 3:**
```bash
cd /path/to/recipe
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node.js:**
```bash
npx http-server
```
Then open the URL shown in your terminal (usually `http://localhost:8080`).

**Using PHP:**
```bash
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

**Using VS Code:**
Install the "Live Server" extension and click "Go Live" in the status bar.

### Option 3: GitHub Pages Deployment
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select the branch to deploy (usually `main`)
4. Your app will be available at `https://yourusername.github.io/recipe/`

---

## Data Structure in localStorage

The application uses a single localStorage key to store all recipe data.

### Primary Storage Key
```javascript
Key: 'recipes'
Type: JSON Array
```

### Recipe Object Schema
```javascript
{
  "id": "recipe-lx8k9a2bc",           // Unique ID (generated)
  "title": "Classic Dal & Rice",      // String (2-100 chars)
  "description": "A comforting...",   // String (10-500 chars)
  "ingredients": [                     // Array (max 50 items)
    "1 cup yellow lentils",
    "2 tomatoes, chopped",
    // Each ingredient: max 200 chars
  ],
  "steps": [                           // Array (max 100 items)
    "Wash lentils and rice...",
    "Pressure cook lentils...",
    // Each step: max 500 chars
  ],
  "prepTime": 15,                      // Number (minutes, 0-1440)
  "cookTime": 30,                      // Number (minutes, 0-1440)
  "difficulty": "easy",                // String ("easy"|"medium"|"hard")
  "imageUrl": "https://..."            // String (optional, max 500 chars)
}
```

### Complete localStorage Example
```json
[
  {
    "id": "classic-dal-rice",
    "title": "Classic Dal & Rice",
    "description": "A comforting and nutritious Indian lentil dish served with fluffy basmati rice.",
    "ingredients": [
      "1 cup yellow lentils (toor dal)",
      "1/2 cup basmati rice",
      "1 onion, finely chopped"
    ],
    "steps": [
      "Wash lentils and rice separately. Soak rice for 20 minutes.",
      "Pressure cook lentils with turmeric and 3 cups water for 3 whistles."
    ],
    "prepTime": 15,
    "cookTime": 30,
    "difficulty": "easy",
    "imageUrl": "https://example.com/dal-rice.jpg"
  }
]
```

### Data Validation Rules

The app enforces strict validation on all data:

| Field | Validation | Error Handling |
|-------|-----------|----------------|
| `id` | Must be string, auto-generated if missing | Auto-repaired |
| `title` | 2-100 characters, required | Truncated to 100 chars |
| `description` | 10-500 characters, required | Truncated to 500 chars |
| `ingredients` | Array, 1-50 items, each max 200 chars | Truncated |
| `steps` | Array, 1-100 items, each max 500 chars | Truncated |
| `prepTime` | Number, 0-1440 minutes (24 hours) | Clamped to range |
| `cookTime` | Number, 0-1440 minutes (24 hours) | Clamped to range |
| `difficulty` | Must be "easy", "medium", or "hard" | Defaults to "easy" |
| `imageUrl` | Optional, max 500 chars, must be valid URL | Truncated |

### Data Integrity Features

1. **Automatic Repair:** Corrupted data is detected and repaired on app initialization
2. **Validation:** All data is validated before saving using `cleanRecipeData()`
3. **Quota Management:** Checks storage limits before saving (5MB typical limit)
4. **Fallback:** If localStorage fails to load, sample recipes are used as fallback

---

## Assumptions and Limitations

### Assumptions

1. **Single User per Browser:** The app assumes one user per browser/device with no authentication
2. **Modern Browser:** Assumes support for ES6 modules, localStorage, and modern CSS features
3. **localStorage Enabled:** Assumes localStorage is available and not disabled by browser settings
4. **Client-Side Only:** No server-side logic, database, or authentication
5. **Image Hosting:** Assumes images are hosted externally (URLs only, no uploads)
6. **Valid User Input:** While validation exists, assumes users enter reasonable recipe data

### Storage Limitations

| Limitation | Details | Impact |
|-----------|---------|--------|
| **Storage Size** | ~5-10MB per domain (browser-dependent) | ~500-1000 recipes max |
| **No Synchronization** | Data doesn't sync across browsers/devices | Manual export/import needed |
| **Browser-Specific** | Data tied to specific browser on specific device | Not portable by default |
| **Private Browsing** | localStorage may not persist in incognito/private mode | Data loss on session end |
| **Cache Clearing** | Clearing browser data will delete all recipes | No backup by default |

### Functional Limitations

1. **No Image Upload:** Must use external image URLs (e.g., Imgur, Unsplash)
2. **No Collaboration:** Cannot share recipes with other users
3. **No Cloud Backup:** Data only exists locally in browser
4. **No Version History:** Cannot undo recipe edits or deletions
5. **No Export/Import:** Manual backup not implemented (future feature)
6. **No Categories/Tags:** Only difficulty filtering available
7. **Limited Search:** Simple text search only (no fuzzy matching)

### Performance Limitations

1. **Large Collections:** App may slow down with 500+ recipes
2. **Image Loading:** Large external images can cause lag
3. **No Pagination:** All recipes loaded at once
4. **No Lazy Loading:** Recipe cards load immediately

### Security Considerations

1. **Plaintext Storage:** All data stored unencrypted in localStorage
2. **XSS Protection:** Input is sanitized using `escapeHtml()` function
3. **No Authentication:** No user accounts or password protection
4. **Local Access:** Anyone with device access can view/modify recipes
5. **URL Validation:** Image URLs are validated but not verified for content

---

## Known Issues

### Critical Issues

#### 1. Data Loss on Browser Cache Clear
**Problem:** Clearing browser data/cache will delete all recipes permanently.

**Workaround:** 
- Regularly copy recipe data from Developer Tools (F12) → Application → Local Storage
- Future: Implement export to JSON feature

**Status:** 🟡 Enhancement planned

#### 2. Private/Incognito Mode Support
**Problem:** localStorage may not persist in private browsing mode (especially Safari iOS).

**Workaround:** 
- Use regular browsing mode
- Safari Desktop: Works in private mode but data cleared on close
- Chrome/Firefox: Works but data cleared on session end

**Status:** 🔴 Cannot fix (browser limitation)

#### 3. ES6 Module CORS Error
**Problem:** When opening `index.html` directly (file://), some browsers block ES6 module imports.

**Error:** `Access to script at 'file:///.../recipeManager.js' from origin 'null' has been blocked by CORS policy`

**Workaround:** Use a local web server (see [How to Run](#option-2-using-a-local-web-server-recommended))

**Status:** 🟢 Documented workaround

### Major Issues

#### 4. Storage Quota Exceeded
**Problem:** Saving fails when localStorage quota (5MB) is exceeded.

**Symptoms:** "Storage is full" notification appears, new recipes cannot be saved.

**Workaround:**
- Delete old recipes you no longer need
- Use shorter image URLs or remove images
- Avoid base64-encoded images in URLs

**Status:** 🟡 Partial detection implemented

#### 5. Image Loading Failures
**Problem:** External image URLs may break or fail to load.

**Symptoms:** Broken image icons or missing recipe images.

**Workaround:**
- Use reliable image hosts (Imgur, Unsplash, etc.)
- Images automatically hidden if they fail to load
- Use `onerror="this.style.display='none'"` attribute

**Status:** 🟢 Graceful degradation implemented

#### 6. No Undo for Deletions
**Problem:** Deleted recipes cannot be recovered.

**Workaround:** 
- Confirmation dialog appears before deletion
- Be careful when clicking "Delete Recipe"

**Status:** 🔴 No fix planned (by design)

### Minor Issues

#### 7. Time Input Format
**Problem:** Time inputs split into hours/minutes can be confusing for some users.

**Current Behavior:** Users must enter hours and minutes separately.

**Status:** 🟢 Working as designed

#### 8. Long Recipe Titles
**Problem:** Very long titles (>50 chars) may break card layout on mobile.

**Validation:** Titles truncated at 100 characters, but display issues may occur.

**Workaround:** Keep titles under 50 characters for best display.

**Status:** 🟡 CSS improvements planned

#### 9. Search Case Sensitivity
**Problem:** Search is case-insensitive (uses `.toLowerCase()`) but may not handle special characters well.

**Status:** 🟢 Working as designed

#### 10. No Decimal Fractions in Ingredients
**Problem:** Ingredient amounts must be written as text (e.g., "1/2 cup" not "0.5 cup").

**Status:** 🟢 Working as designed (free-form text)

### Browser-Specific Issues

#### 11. Safari iOS Private Browsing
**Problem:** localStorage completely disabled in iOS Safari private mode.

**Status:** 🔴 Cannot fix (iOS limitation)

#### 12. Firefox Private Window Storage Limit
**Problem:** Storage limit reduced to ~2MB in Firefox private windows.

**Status:** 🟡 Known limitation

#### 13. Edge Legacy CSS Issues
**Problem:** Pre-Chromium Edge may not support some CSS features (CSS Grid, backdrop-filter).

**Workaround:** Use modern Edge (Chromium-based) or another browser.

**Status:** 🔴 No support for legacy browsers

### Performance Issues

#### 14. Initial Load with Many Recipes
**Problem:** Page may take 1-2 seconds to render with 500+ recipes.

**Workaround:** Use filters to reduce visible recipes.

**Status:** 🟡 Pagination planned

#### 15. Animation Performance
**Problem:** Background animations may cause lag on older devices.

**Workaround:** Consider disabling animations in CSS for low-end devices.

**Status:** 🟡 Settings toggle planned

---

## Features

### Core Features
✅ Add, edit, and delete recipes  
✅ Search recipes by title or description  
✅ Filter by difficulty (Easy, Medium, Hard)  
✅ Filter by total time  
✅ Real-time form validation with detailed error messages  
✅ Responsive design (mobile, tablet, desktop)  
✅ Beautiful purple gradient theme  
✅ Animated UI elements  
✅ Sample recipes included on first run  
✅ Automatic data validation and repair  
✅ Graceful error handling  

### Form Validation Features
- Title: 2-100 characters
- Description: 10-500 characters
- Ingredients: 1-50 items, each max 200 characters
- Steps: 1-100 items, each max 500 characters
- Time: Separate hour/minute inputs, max 24 hours
- Image URL: Optional, validates URL format
- Real-time validation on blur and input events

### UI/UX Features
- Smooth animations and transitions
- Hover effects on cards
- Loading states for save operations
- Toast notifications for success/error messages
- Empty state guidance
- Confirmation dialogs for destructive actions
- Responsive card grid layout

---

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 61+ | ✅ Full support |
| Firefox | 60+ | ✅ Full support |
| Safari | 11+ | ✅ Full support (iOS 11+ for mobile) |
| Edge | 79+ (Chromium) | ✅ Full support |
| Opera | 48+ | ✅ Full support |
| IE 11 | ❌ Not supported | ES6 modules not supported |

### Required Browser Features
- ES6 JavaScript (modules, arrow functions, template literals)
- localStorage API
- CSS Grid and Flexbox
- CSS custom properties (variables)
- Modern form validation API

---

## Troubleshooting

### Problem: Recipes not saving
**Check:**
1. Is localStorage enabled? (Settings → Privacy)
2. Are you in private/incognito mode?
3. Is storage quota exceeded? (Check console for errors)
4. Open DevTools (F12) → Console for error messages

### Problem: Can't see recipes
**Check:**
1. Clear search box
2. Reset filters to "All Difficulties" and "Any Prep Time"
3. Check console for errors
4. Try refreshing the page

### Problem: CORS error when opening file
**Solution:** Use a local web server (see [How to Run](#option-2-using-a-local-web-server-recommended))

### Problem: Images not loading
**Check:**
1. Is the image URL correct and accessible?
2. Does the URL start with `http://` or `https://`?
3. Try opening the URL in a new browser tab
4. Some websites block hotlinking (direct image links)

---

## Development

### Project Structure
```
recipe/
├── index.html              # Main HTML file
├── styles.css              # All styles (CSS variables, animations)
├── js/
│   ├── main.js            # Application entry point
│   └── recipeManager.js   # Core recipe management logic
└── README.md              # This file
```

### localStorage Structure
```
Key: 'recipes'
Value: JSON array of recipe objects
```

### Adding New Features
1. Add UI elements to `index.html`
2. Add styles to `styles.css`
3. Add logic to `recipeManager.js`
4. Update event listeners in `setupEventListeners()`

---

## Future Enhancements

- [ ] Export/Import recipes to JSON
- [ ] Recipe categories and tags
- [ ] Cooking timer
- [ ] Shopping list generation
- [ ] Print recipe view
- [ ] Recipe sharing (generate shareable links)
- [ ] Nutritional information
- [ ] Serving size calculator
- [ ] Recipe scaling (double/half ingredients)

---

## License

MIT License - Feel free to use and modify for your own projects.

---

## Support

For issues, questions, or feature requests:
1. Check the [Known Issues](#known-issues) section
2. Open an issue on GitHub
3. Check browser console (F12) for error messages

---

**Made with 💜 by the Violet Recipe Team**

Last Updated: November 2024
