# GitHub Pages Deployment Script
# This script converts the Flask app to static files for GitHub Pages deployment

from flask_frozen import Freezer
from app import app
import glob
import os
import re

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
    
    # Fail loudly on a missing asset rather than writing a placeholder over it.
    # The old behaviour silently created 1x1 PNGs and stub PDFs, so a broken
    # reference froze and deployed as an invisible broken image instead of
    # being caught here.
    referenced = set()
    for template in glob.glob('templates/**/*.html', recursive=True):
        with open(template) as f:
            body = f.read()
        pattern = r"(?:filename=|static_url\()'((?:files|images|js|css)/[^']+)'"
        for match in re.finditer(pattern, body):
            referenced.add(os.path.join('static', match.group(1)))

    missing = sorted(path for path in referenced if not os.path.exists(path))
    if missing:
        print('\n❌ Templates reference files that do not exist:')
        for path in missing:
            print(f'  {path}')
        raise SystemExit(1)

    # Freeze the Flask app into static files
    freezer.freeze()
    print(f"\n✅ Portfolio frozen to docs/ ({len(referenced)} static assets verified)")