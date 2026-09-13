import hashlib
from pathlib import Path

from flask import Flask, render_template, url_for

app = Flask(__name__)

# Configuration
app.config['GA_MEASUREMENT_ID'] = 'G-0W51208ZBD'  # Your actual GA4 Measurement ID

@app.context_processor
def inject_ga_id():
    return {'GA_MEASUREMENT_ID': app.config['GA_MEASUREMENT_ID']}


@app.template_global()
def static_url(filename):
    """Static URL carrying a content hash.

    GitHub Pages serves assets with cache-control: max-age=600, so for ten
    minutes after a deploy a returning visitor can get the new HTML against
    the stylesheet they already had cached. The hash changes whenever the
    file does, which makes that impossible.

    Resolves through the Jinja environment's url_for rather than Flask's.
    Frozen-Flask implements FREEZER_RELATIVE_URLS by swapping the Jinja
    global for its own relative_url_for; calling flask.url_for here would
    bypass that and emit a root-absolute /static/... path, which 404s on
    GitHub Pages because the site is served from /portfolio/.
    """
    resolve = app.jinja_env.globals.get('url_for', url_for)
    path = Path(app.static_folder) / filename
    if not path.exists():
        return resolve('static', filename=filename)
    digest = hashlib.md5(path.read_bytes()).hexdigest()[:8]
    return resolve('static', filename=filename, v=digest)

@app.route('/')
def home():
    return render_template('index.html')  # Homepage (single-page with sections)

@app.route('/project/<project_name>/')
def project_detail(project_name):
    return render_template(f'projects/{project_name}.html')  # Individual project pages

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)