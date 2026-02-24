# Oliver Donaldson — Portfolio

**Live site: [oliverdonaldson.github.io/portfolio](https://oliverdonaldson.github.io/portfolio/)**

Personal portfolio showcasing my data science and analytics projects, professional certifications, and experience. Built to give recruiters and collaborators a clear picture of who I am and what I do.

## What's Inside

- **Projects** — detailed write-ups of data analysis, visualisation, machine learning, and statistical work
- **Certificates** — professional certifications and achievements
- **CV** — downloadable resume
- **About** — background, skills, and interests
- **Activities** — extracurricular work and achievements

## Tech Stack

| Layer | Technology |
|---|---|
| Templating / local dev | Python, Flask, Jinja2 |
| Styling | Custom CSS3, responsive design |
| Animations | CSS transitions & keyframe animations |
| Analytics | Google Analytics 4 |
| Deployment | GitHub Pages (static, via Frozen-Flask) |

The site is built as a Flask app locally for easy template reuse, then "frozen" into static HTML by `freeze.py` and deployed from the `docs/` folder to GitHub Pages.

## Running Locally

```bash
pip install -r requirements.txt
python app.py
# visit http://localhost:5000
```

To rebuild the static site for GitHub Pages:

```bash
python freeze.py
# output goes to docs/ — commit and push to deploy
```
