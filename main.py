import os
from flask import Flask, url_for, render_template, Response, request
from shim import get_session, as_json


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


@app.route('/x')
def x():
    return render_template(
      'xerblin.html',
      title='Ooo La La!',
      )


@app.route("/step", methods=['POST'])
def step():
    command = request.form['command']
    print command ; print
    w = get_session(None)
    w.step(command.split())
    res = as_json(w)
    print res ; print
    result=Response(
        response='{"result":%s}' % (res,),
        mimetype='application/json',
        )
    print '-' * 70
    return result


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
