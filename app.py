from flask import Flask, render_template, request, session, redirect, jsonify
import os
import pyrebase
import base64


app = Flask(__name__)
app.secret_key = "secret_key"
app.config['UPLOAD_FOLDER'] = '/uploads'


# Configure your Firebase credentials
config = {    
    "apiKey": "AIzaSyCpfOuK_FbsAyIxXiAPtbrI-Tef1gfDhKk",
  "authDomain": "ocr-connect-ce1c5.firebaseapp.com",
  "projectId": "ocr-connect-ce1c5",
  "storageBucket": "ocr-connect-ce1c5.appspot.com",
  "messagingSenderId": "127348668776",
  "appId": "1:127348668776:web:d27731c396f917e628fedd",
  "measurementId": "G-74PNR2KGY3",
  "databaseURL":'https://ocr-connect-ce1c5-default-rtdb.asia-southeast1.firebasedatabase.app/'
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
storage = firebase.storage()
db = firebase.database()  # Initialize Firestore


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.create_user_with_email_and_password(email, password)
            session['email'] = email
            return redirect('/dashboard')
        except Exception as e:
            error = str(e)
            return render_template('signup.html', error=error)
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            session['email'] = email
            session['user_token'] = user['idToken']  # Save the idToken into the session
            return redirect('/')
        except Exception as e:
            error = str(e)
            return render_template('login.html', error=error)
    return render_template('login.html')



@app.route('/')
def home():
    if 'email' in session:         
        return render_template('index.html')
    else:
        return redirect('/login')




@app.route('/upload', methods=['POST'])
def handle_data():
    data = request.get_json()
    

    # Get the file name and image base64 strings from the received data
    file_name = data.get('fileName')
    image_base64s = data.get('imageUrls', [])

    # Create a directory to store the images
    dir_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

    # For each base64 string, decode it into an image and save it to the directory
    for i, image_base64 in enumerate(image_base64s):
        # Remove the prefix from the base64 string and decode it
        prefix, image_base64 = image_base64.split(";base64,")
        img_data = base64.b64decode(image_base64)

        # Save the image locally
        local_file_path = os.path.join(dir_path, f'image_{i}.png')
        with open(local_file_path, 'wb') as f:
            f.write(img_data)

        # Upload the local file to Firebase Storage
        file_path = f"{file_name}/image_{i}.png"
        storage.child("{}/{}".format(session['email'], file_path)).put(local_file_path)

        # Get the download url and save it to Firestore
        url = storage.child("{}/{}".format(session['email'], file_path)).get_url(None)
        data = {"email": session['email'], "folder_name": file_name, "file_name": f"image_{i}.png", "url": url}
        db.child("user_files").push(data)

        # Remove the local file
        os.remove(local_file_path)

    return jsonify({'message': 'Uploaded Successfully!'})



@app.route('/service-worker.js')
def sw():
    return app.send_static_file('service-worker.js')



if __name__ == "__main__":
    app.run(port=5000, debug=True)
