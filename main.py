from flask import Flask, url_for, render_template
app = Flask(__name__)


@app.route("/")
def index():
    return render_template(
      'hello.html',
      title='This is Certainly a Title',
      hello_url=url_for('hello'),
      )


@app.route('/hello')
def hello():
    return "Hello World!"


if __name__ == "__main__":
    app.run(debug=True)
