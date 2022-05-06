from flask import Flask, render_template, request
import json
import random

# Mateusz Dukat 2022

app = Flask(__name__)

@app.route('/sheet')
def sheet():
    #return render_template('sheet.html', sheet_code='1234')
    return render_template('sheet3-nomenu.html', sheet_code='1234')

@app.route('/')
def index():
    return render_template('index.html')

# TODO sheet save/load and contact endpoints
#@app.route('/save', methods=['POST'])
#@app.route('/load', methods=['GET'])
#@app.route('/auth', methods=['POST'])
#@app.route('/contact', methods=['POST'])

# Pseudo-endpoints

def pseudotokengenerator():
    chars = "0123456789abcdef"
    token = ""
    for i in range(128):
        token = token + chars[random.randint(0,15)]
    return token

@app.route('/save', methods=['POST'])
def save():
    sheet_code = request.form.get('code') # sheet code
    sheet_new_code = request.form.get('new_code') # unused
    sheet_password = request.form.get('password') # sheet password
    sheet_token = request.form.get('token') # unused
    sheet_data = request.form.get('data') # JSON sheet data
    sheet_action = request.form.get('action') # known actions: save

    return json.dumps({'status' : 200, 'code' : sheet_code, 'token' : pseudotokengenerator()})

# Load and save use the same data.

@app.route('/load', methods=['GET'])
def load():
    sheet_code = request.args.get('code')

    return json.dumps({"status":200,"code": sheet_code ,"data":{"page-1":{"alignment":"ali","background":"bkground","class":"classlevel","experience":"9999","name":"cname","player":"pname","race":"race"},"page-2":{"name-2":"cname"}}})

