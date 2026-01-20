# Custom CSS - Lemon Theme Example

This is an example of how to create a custom theme for BananaDash using CSS. The Lemon theme demonstrates a bright, cheerful color scheme with yellow and green accents.

## How to Use

1. Go to **Menu → CSS Editor** (or **Settings**)
2. Select **Theme mode: Custom**
3. Paste the CSS code below into the **Custom CSS** textarea
4. Click **Save**

## CSS Code

```css
/* ============================================
   BananaDash - Lemon Theme
   ============================================ */

/* Root Variables - Override theme colors */
:root,
[data-theme="dark"],
[data-theme="light"] {
  --bd-bg: #FFF9E6;
  --bd-surface: #FFFFFF;
  --bd-surface-2: #FFFBF0;
  --bd-border: #FFE066;
  --bd-shadow: rgba(255, 204, 0, 0.15);
  --bd-text: #2D2D1E;
  --bd-text-muted: #6B6B4C;
  --bd-text-faint: #9B9B7A;
  --bd-accent: #FFD700;
  --bd-accent-hover: #FFC700;
  --bd-accent-weak: rgba(255, 215, 0, 0.2);
  --bd-success: #32CD32;
  --bd-warning: #FFA500;
  --bd-danger: #FF6347;
  --bd-focus: rgba(255, 215, 0, 0.4);
}

/* Background */
[data-bd="background"] {
  background: linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%);
}

/* Header (P1) */
[data-bd="p1"] {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

[data-bd="p1"] .bd-header-subtitle {
  color: #2D2D1E;
  font-weight: 500;
}

[data-bd="p1"] span {
  color: #2D2D1E;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* Toolbar (P2) */
[data-bd="p2"] {
  background: #FFFFFF;
  border: 2px solid #FFE066;
  box-shadow: 0 2px 8px rgba(255, 204, 0, 0.1);
}

[data-bd="p2"] button {
  border: 1px solid #FFE066;
}

[data-bd="p2"] button:hover {
  background: #FFFBF0;
}

/* Spaces (P3) */
[data-bd="p3"] {
  background: #FFFFFF;
  border: 2px solid #FFE066;
  box-shadow: 0 4px 12px rgba(255, 204, 0, 0.15);
}

[data-bd="p3"] button {
  border: 1px solid #FFE066;
  transition: all 0.2s;
}

[data-bd="p3"] button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.2);
}

/* Categories (P4) */
[data-bd="p4"] > div {
  background: #FFFFFF;
  border: 2px solid #FFE066;
  box-shadow: 0 4px 12px rgba(255, 204, 0, 0.15);
  transition: all 0.2s;
}

[data-bd="p4"] > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.25);
}

/* Bookmarks */
[data-bd="p4"] [role="button"] {
  background: #FFFBF0;
  border: 1px solid #FFE066;
  transition: all 0.2s;
}

[data-bd="p4"] [role="button"]:hover {
  background: #FFD700;
  border-color: #FFA500;
  transform: scale(1.02);
}

/* New Category Button (P5) */
[data-bd="p5"] button {
  background: #FFD700;
  border: 2px solid #FFA500;
  color: #2D2D1E;
  font-weight: 600;
  transition: all 0.2s;
}

[data-bd="p5"] button:hover {
  background: #FFC700;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
}

/* Footer */
[data-bd="footer"] {
  color: #6B6B4C;
  border-top: 2px solid #FFE066;
  padding-top: 1.5rem;
  margin-top: 2rem;
}

[data-bd="footer"] a {
  color: #FFA500;
  text-decoration: none;
  transition: color 0.2s;
}

[data-bd="footer"] a:hover {
  color: #FFD700;
  text-decoration: underline;
}

/* Input Fields */
input[type="text"],
input[type="password"],
input[type="search"],
textarea,
select {
  background: #FFFFFF;
  border: 1px solid #FFE066;
  color: #2D2D1E;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
  outline: none;
}

/* Buttons */
button {
  transition: all 0.2s;
}

button:not([disabled]):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.2);
}

/* Menu */
.bg-bd-surface {
  border: 2px solid #FFE066;
}

/* Modals */
.bg-bd-surface {
  border: 2px solid #FFE066;
  box-shadow: 0 8px 24px rgba(255, 204, 0, 0.2);
}

/* Search Input */
input[type="search"] {
  background: #FFFFFF;
  border: 2px solid #FFE066;
}

input[type="search"]:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
}

/* Active States */
button.bg-bd-accent,
button.bg-bd-accent-weak {
  background: #FFD700;
  color: #2D2D1E;
  font-weight: 600;
}

/* Scrollbar (optional) */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #FFFBF0;
}

::-webkit-scrollbar-thumb {
  background: #FFE066;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #FFD700;
}
```

## Available Data Attributes

You can target specific areas of the UI using these data attributes:

- `[data-bd="p1"]` - Header area
- `[data-bd="p2"]` - Toolbar/Control bar
- `[data-bd="p3"]` - Spaces section
- `[data-bd="p4"]` - Categories/Grid section
- `[data-bd="p5"]` - New Category Button area
- `[data-bd="footer"]` - Footer
- `[data-bd="background"]` - Page root/background

## CSS Variables

You can override these CSS variables to change the theme colors:

- `--bd-bg` - App background
- `--bd-surface` - Cards/Panels
- `--bd-surface-2` - Secondary panels/Toolbars
- `--bd-border` - Borders/Dividers
- `--bd-text` - Primary text
- `--bd-text-muted` - Secondary text
- `--bd-text-faint` - Hint/Placeholder text
- `--bd-accent` - Accent color (buttons, links)
- `--bd-accent-hover` - Accent hover state
- `--bd-accent-weak` - Weak accent (for active states)
- `--bd-success` - Success color
- `--bd-warning` - Warning color
- `--bd-danger` - Danger/Error color
- `--bd-focus` - Focus ring color

## Tips

1. **Start Simple**: Begin by overriding CSS variables to see immediate changes
2. **Use Data Attributes**: Target specific UI areas using `[data-bd="..."]` selectors
3. **Test Responsively**: Check your theme on different screen sizes
4. **Browser DevTools**: Use browser developer tools to inspect elements and test CSS changes
5. **Save Often**: Save your CSS frequently to see changes in real-time

## Example Variations

### Dark Lemon Theme
Change the background variables to darker shades:
```css
--bd-bg: #2D2D1E;
--bd-surface: #3D3D2E;
--bd-text: #FFF9E6;
```

### Mint Lemon Theme
Combine lemon with mint green:
```css
--bd-accent: #98D8C8;
--bd-accent-hover: #7BC4B0;
```

Enjoy customizing your BananaDash theme!

