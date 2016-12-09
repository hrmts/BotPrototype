#!flask/bin/python
from flask import Flask, request

app = Flask(__name__)

def processText(text):
    return text + ' PROCESSED'

@app.route('/messages/', methods=['POST'])
def get_response():
    input = request.json['message']
    output = processText(input)
    return output

if __name__ == '__main__':
    app.run(debug=True)
