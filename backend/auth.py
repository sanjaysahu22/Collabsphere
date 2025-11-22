# auth.py
from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
import os
import json

# Initialize Firebase Admin SDK
def get_firebase_credentials():
    # Try to get credentials from environment variables first (for production/Render)
    if os.getenv('FIREBASE_CREDENTIALS'):
        # Parse the JSON string from environment variable
        cred_dict = json.loads(os.getenv('FIREBASE_CREDENTIALS'))
        return credentials.Certificate(cred_dict)
    
    # Fallback to key.json file for local development
    elif os.path.exists("key.json"):
        return credentials.Certificate("key.json")
    
    else:
        raise ValueError("Firebase credentials not found. Please set FIREBASE_CREDENTIALS environment variable or provide key.json file.")

cred = get_firebase_credentials()

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

#firebase_admin.initialize_app(cred)

# Create a blueprint for authentication
#auth_bp = Blueprint('auth', __name__)

# Custom Decorator for Firebase UID Authentication
def firebase_uid_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        uid = request.cookies.get('uid')
        print(uid,"ss")
        #print("f")
        if not uid:
            return jsonify({"message": "Unauthorized"}), 401

        try:
            user = auth.get_user(uid)
        except firebase_admin.exceptions.FirebaseError as e:
            return jsonify({"message": "Unauthorized"}), 401
        
        # Attach user data to the request
        request.user = user
        return f(*args, **kwargs)
    return decorated_function
