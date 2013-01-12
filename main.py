import os
from flask import Flask, url_for, render_template


WEBFACTION_TEMPLATES = '/home/calroc/webapps/smlaum/templates'


if os.path.exists(WEBFACTION_TEMPLATES):
    app = Flask(__name__, template_folder=WEBFACTION_TEMPLATES)
else:
    app = Flask(__name__)
    app.debug = True


@app.route("/")
def index():
    return render_template(
      'index.html',
      title='This is Certainly a Title',
      hello_url=url_for('hello'),
      )


@app.route('/hello')
def hello():
    return render_template(
      'mk.html',
      title='Eye Bleeding',
      )


@app.route('/circ')
def circ():
    return render_template(
      'circ.html',
      title='Circ',
      )


@app.route('/skew')
def skew():
    return render_template(
      'skew.html',
      title='Skew',
      )


if __name__ == "__main__":
    app.run(debug=True)
