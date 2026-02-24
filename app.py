from flask import Flask, render_template

app = Flask(__name__)

# Configuration
app.config['GA_MEASUREMENT_ID'] = 'G-0W51208ZBD'  # Your actual GA4 Measurement ID

@app.context_processor
def inject_ga_id():
    return {'GA_MEASUREMENT_ID': app.config['GA_MEASUREMENT_ID']}

@app.route('/')
def home():
    return render_template('index.html')  # Homepage (single-page with sections)

@app.route('/project/<project_name>')
def project_detail(project_name):
    return render_template(f'projects/{project_name}.html')  # Individual project pages

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)