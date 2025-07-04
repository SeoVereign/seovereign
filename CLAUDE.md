# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seovereign is a single-page marketing website for a trading/investment company. The site features smooth scrolling animations using GSAP (GreenSock Animation Platform) with ScrollTrigger and ScrollSmoother plugins. The site consists of several sections showcasing the company's services, portfolio charts, and contact information.

## Project Structure

- **HTML**: Single `index.html` file containing all page sections (introduce, defines, charts, contact)
- **CSS**: 
  - `style.css`: Main stylesheet that imports other CSS files
  - `reset.css`: CSS reset and basic styling
  - `variables.css`: Color variables and font imports
  - `index.css`: Page-specific styling for all sections
- **JavaScript**: 
  - `index.js`: Handles all animations and interactions using jQuery and GSAP
- **Assets**:
  - `images/`: Contains all website images
  - `texts/`: Contains SVG text graphics
  - `fonts/`: Custom font files

## Development Environment

### Local Development

To run the website locally, simply open the `index.html` file in a browser. No build process is required as this is a static website.

```bash
# Open index.html in default browser
open index.html
```

## Animation Architecture

The site uses GSAP for animations with two main components:

1. **ScrollSmoother**: Creates smooth scrolling effect
2. **ScrollTrigger**: Triggers animations based on scroll position

Key animation elements:
- Timeline-based animations for each section
- Pinned sections with custom scroll-based animations
- SVG text replacements
- Vertical sliding text animations

## Working with the Code

### Adding New Sections

When adding a new section, follow these steps:

1. Add the HTML structure in `index.html` following the existing pattern
2. Add corresponding CSS in `index.css` 
3. Create animation timelines in `index.js`
4. Configure ScrollTrigger for the new section

### Modifying Animations

Animations are defined in `index.js` using GSAP timelines. To modify:

1. Locate the relevant animation timeline (e.g., `introduceAni` or `definesAni`)
2. Adjust animation parameters as needed
3. Update the corresponding ScrollTrigger configuration

### Updating Content

1. Text content is directly in the HTML
2. SVG text elements are in the `texts/` directory
3. Images are in the `images/` directory

## Notes

- The site uses jQuery for DOM manipulation alongside GSAP
- Custom fonts are loaded from the `fonts/` directory
- The vertical sliding text animation uses a custom function `verticalSlide()`
- SVG images with class `.svg` are processed to allow direct styling