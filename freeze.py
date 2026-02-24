# GitHub Pages Deployment Script
# This script converts the Flask app to static files for GitHub Pages deployment

from flask_frozen import Freezer
from app import app
import os

# Configuration for static site generation
app.config['FREEZER_DESTINATION'] = 'docs'  # GitHub Pages can serve from /docs folder
app.config['FREEZER_RELATIVE_URLS'] = True
app.config['FREEZER_REDIRECT_POLICY'] = 'ignore'
app.config['FREEZER_IGNORE_404_NOT_FOUND'] = True

freezer = Freezer(app)

# Tell Frozen-Flask which URL rules to skip (redirect-only routes)
@freezer.register_generator
def skip_redirects():
    # Only yield the routes that actually render templates
    return []

if __name__ == '__main__':
    # Create the docs directory if it doesn't exist
    if not os.path.exists('docs'):
        os.makedirs('docs')
    
    # Create placeholder static files if they don't exist yet
    # (prevents 404 errors during freeze)
    placeholders = {
        'static/files/Your_CV.pdf': b'%PDF-1.4 placeholder',
        'static/files/certificate1.pdf': b'%PDF-1.4 placeholder',
        'static/files/certificate2.pdf': b'%PDF-1.4 placeholder',
        'static/files/certificate3.pdf': b'%PDF-1.4 placeholder',
        'static/files/certificate4.pdf': b'%PDF-1.4 placeholder',
    }
    
    for filepath, content in placeholders.items():
        if not os.path.exists(filepath):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                f.write(content)
            print(f"  Created placeholder: {filepath}")
    
    # Also create placeholder images if missing
    # (1x1 transparent PNG)
    png_placeholder = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89'
        b'\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01'
        b'\r\n\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    
    image_files = [
        'static/images/profile.jpg',
        'static/images/hero1.jpg', 'static/images/hero2.jpg', 'static/images/hero3.jpg',
        'static/images/project1.jpg', 'static/images/project2.jpg',
        'static/images/project3.jpg', 'static/images/project4.jpg',
        'static/images/cert1.jpg', 'static/images/cert2.jpg',
        'static/images/cert3.jpg', 'static/images/cert4.jpg',
        'static/images/activity1.jpg', 'static/images/activity2.jpg',
        'static/images/analysis_chart1.png',
    ]
    
    for img in image_files:
        if not os.path.exists(img):
            os.makedirs(os.path.dirname(img), exist_ok=True)
            with open(img, 'wb') as f:
                f.write(png_placeholder)
            print(f"  Created placeholder: {img}")
    
    # Freeze the Flask app into static files
    freezer.freeze()
    
    print("\nPortfolio has been frozen into static files!")
    print("You can now deploy the 'docs' folder to GitHub Pages.")
    print("\nTo deploy to GitHub Pages:")
    print("1. Commit all changes to your repository")
    print("2. Push to GitHub")
    print("3. In repository settings, enable GitHub Pages and set source to 'docs' folder")
    print("4. Your portfolio will be available at https://yourusername.github.io/repository-name/")