# Personal Portfolio Website

A professional Flask-based portfolio website inspired by modern data science portfolio designs. This portfolio showcases projects, certificates, and professional experience with a clean, responsive layout.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Project Showcase**: Grid layout for displaying projects with detailed individual pages
- **Certificate Gallery**: Carousel display for professional certificates and achievements
- **Professional Navigation**: Fixed top navigation with smooth scrolling
- **Image Slideshow**: Hero section with rotating background images
- **About Section**: Personal introduction with profile photo
- **Activities Section**: Showcase of extracurricular activities and achievements

## Project Structure

```
portfolio/
│
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── README.md                      # This file
│
├── templates/                     # HTML templates
│   ├── base.html                 # Base template with navigation
│   ├── index.html                # Main homepage
│   └── projects/                 # Individual project pages
│       └── data-analysis-project.html
│
└── static/                       # Static files (CSS, images, files)
    ├── css/
    │   └── style.css             # Main stylesheet
    ├── images/                   # Image assets
    │   ├── hero1.jpg            # Hero slideshow images
    │   ├── hero2.jpg
    │   ├── hero3.jpg
    │   ├── profile.jpg          # Profile photo
    │   ├── project1.jpg         # Project thumbnails
    │   ├── project2.jpg
    │   ├── project3.jpg
    │   ├── project4.jpg
    │   ├── cert1.jpg            # Certificate images
    │   ├── cert2.jpg
    │   ├── cert3.jpg
    │   ├── cert4.jpg
    │   ├── activity1.jpg        # Activity images
    │   └── activity2.jpg
    └── files/                    # Downloadable files
        ├── Your_CV.pdf          # Resume/CV
        ├── certificate1.pdf     # Certificate files
        ├── certificate2.pdf
        ├── certificate3.pdf
        └── certificate4.pdf
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Customize Content

#### Update Personal Information:
1. **Navigation Links**: Edit `templates/base.html`
   - Replace `YOUR_GITHUB_USERNAME` with your GitHub username
   - Replace `YOUR_LINKEDIN_USERNAME` with your LinkedIn username

2. **Homepage Content**: Edit `templates/index.html`
   - Replace "Your Name" with your actual name
   - Update the about section text
   - Customize project descriptions
   - Update certificate names and descriptions

3. **Project Pages**: 
   - Duplicate `templates/projects/data-analysis-project.html` for each project
   - Customize content for each project
   - Update project links in `templates/index.html`

#### Add Your Images:
1. **Hero Images**: Add 3 landscape images as `hero1.jpg`, `hero2.jpg`, `hero3.jpg` in `static/images/`
2. **Profile Photo**: Add your photo as `profile.jpg` in `static/images/`
3. **Project Thumbnails**: Add project images as `project1.jpg`, `project2.jpg`, etc.
4. **Certificates**: Add certificate images as `cert1.jpg`, `cert2.jpg`, etc.
5. **Activities**: Add activity photos as `activity1.jpg`, `activity2.jpg`

#### Add Your Files:
1. **Resume**: Add your CV as `Your_CV.pdf` in `static/files/`
2. **Certificates**: Add certificate PDFs as `certificate1.pdf`, `certificate2.pdf`, etc.

### 3. Run Development Server

```bash
python app.py
```

Visit `http://localhost:5000` to view your portfolio.

### 4. Deploy to GitHub Pages

For static deployment to GitHub Pages, you'll need to export your Flask app to static HTML files:

1. Install frozen-flask:
   ```bash
   pip install Frozen-Flask
   ```

2. Create a build script:
   ```python
   # freeze.py
   from flask_frozen import Freezer
   from app import app

   freezer = Freezer(app)

   if __name__ == '__main__':
       freezer.freeze()
   ```

3. Build static files:
   ```bash
   python freeze.py
   ```

4. Deploy the `build/` directory to GitHub Pages.

## Customization Tips

### Colors & Styling
- Edit `static/css/style.css` to change colors, fonts, and layout
- Main color variables are used throughout the CSS for easy theming

### Adding New Sections
- Create new routes in `app.py`
- Add corresponding HTML templates
- Update navigation in `templates/base.html`

### Project Pages
- Each project should have its own HTML file in `templates/projects/`
- Follow the structure in the example project template
- Include images, code snippets, and detailed descriptions

### Analytics
- Add your Google Analytics ID to `app.py` (optional)
- Update the `GA_MEASUREMENT_ID` configuration

## Image Requirements

- **Hero Images**: 1920x500px, landscape orientation
- **Profile Photo**: 500x500px, square format (will be cropped to circle)
- **Project Thumbnails**: 400x300px, landscape orientation  
- **Certificates**: Any size, will be scaled to fit
- **Activities**: 800x600px recommended

All images should be optimized for web (JPEG format, compressed for faster loading).

## Technologies Used

- **Backend**: Flask (Python web framework)
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with responsive design
- **Animations**: CSS transitions and keyframe animations
- **Icons**: Text-based icons and symbols

## License

This portfolio template is open source. Feel free to use and modify for your own portfolio.

## Credits

Inspired by professional data science portfolio designs and modern web development best practices.

---

**Need Help?** 
- Check that all image files are properly named and placed in the correct directories
- Ensure all links in the HTML templates point to existing files
- Test the website locally before deploying
- Make sure to replace all placeholder text with your actual content