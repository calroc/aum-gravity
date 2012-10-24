from flask import Flask, url_for
app = Flask(__name__)

@app.route("/")
def index():
    return 'Index Page <a href="' + url_for('hello') + '">hello!</a>'

@app.route('/hello')
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run(debug=True)
