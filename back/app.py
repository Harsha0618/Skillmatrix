from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
import os
import datetime
import re
from datetime import timedelta
import json
import google.generativeai as genai
from werkzeug.utils import secure_filename
from gemini_utils import extract_skills_from_pdf, generate_questions_with_gemini
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this line after creating your Flask app
# Configuration
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/skillmatrix')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key')
app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# Helper function
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Routes
@app.route('/')
def home():
    return "SkillMatrix Backend Service"

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400

    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already registered'}), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    user = {
    'name': data['name'],
    'email': data['email'],
    'password': hashed,
    'skills': [],
    'resumes': [],
    'answer_history': []  # Add this line
		}
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data.get('email')})
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(
        identity=str(user['_id']),
        expires_delta=timedelta(hours=24))
    return jsonify({'access_token': token}), 200

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        skills = extract_skills_from_pdf(filepath)
        user_id = get_jwt_identity()
        mongo.db.users.update_one(
            {'_id': user_id},
            {'$addToSet': {'skills': {'$each': skills}}}
        )
        return jsonify({'skills': skills}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
            

@app.route('/generate', methods=['POST'])
@jwt_required()
def get_questions():
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        difficulty = data.get('difficulty', 'medium')
        
        if not skills:
            return jsonify({'error': 'No skills provided'}), 400

        # Validate skills input
        if not isinstance(skills, list) or any(not isinstance(s, str) for s in skills):
            return jsonify({'error': 'Skills must be an array of strings'}), 400

        questions = generate_questions_with_gemini(
            skills,
            app.config['GEMINI_API_KEY'],
            difficulty
        )
        
        # Validate the response structure
        if not isinstance(questions, list):
            raise ValueError("Invalid questions format")
            
        return jsonify({'questions': questions}), 200
        
    except ValueError as e:
        app.logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        app.logger.error(f"Question generation error: {str(e)}")
        return jsonify({'error': "Failed to generate questions. Please try again."}), 500

@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user = mongo.db.users.find_one(
        {'_id': get_jwt_identity()},
        {'password': 0}
    )
    return jsonify(user), 200 if user else ({'error': 'User not found'}, 404)

@app.route('/grade-answer', methods=['POST'])
@jwt_required()
def grade_answer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        question = data.get('question')
        user_answer = data.get('userAnswer')
        skill = data.get('skill')

        if not all([question, user_answer, skill]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Grade with Gemini
        grade, strengths, weaknesses, suggestions, model_answer = grade_with_gemini(
            question,
            user_answer,
            skill,
            app.config['GEMINI_API_KEY']
        )

        user_id = get_jwt_identity()
        mongo.db.users.update_one(
            {'_id': user_id},
            {'$push': {
                'answer_history': {
                    'question': question,
                    'skill': skill,
                    'user_answer': user_answer,
                    'grade': grade,
                    'strengths': strengths,
                    'weaknesses': weaknesses,
                    'suggestions': suggestions,
                    'model_answer': model_answer
                    # 'timestamp': datetime.utcnow()
                }
            }}
        )

        return jsonify({
            'success': True,
            'grade': grade,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'suggestions': suggestions,
            'correctAnswer': model_answer
        }), 200

    except Exception as e:
        app.logger.error(f"Error in grade_answer: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to grade answer', 'details': str(e)}), 500

    
def grade_with_gemini(question, user_answer, skill, api_key):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
        ROLE: Technical Interview Coach
        TASK: Evaluate this interview answer and provide detailed, structured feedback.

        QUESTION: {question}
        SKILL AREA: {skill}
        CANDIDATE ANSWER: {user_answer}

        OUTPUT FORMAT (JSON ONLY):
        {{
            "grade": "Poor | Fair | Good | Excellent",
            "strengths": ["Point 1", "Point 2"],
            "weaknesses": ["Point 1", "Point 2"],
            "suggestions": ["Suggestion 1", "Suggestion 2"],
            "modelAnswer": "Ideal concise answer."
        }}
        """

        response = model.generate_content(prompt)
        text = response.text

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            json_str = re.search(r"\{.*\}", text, re.DOTALL)
            if json_str:
                result = json.loads(json_str.group(0))
            else:
                raise ValueError("Invalid JSON from Gemini")

        return (
            result["grade"],
            result["strengths"],
            result["weaknesses"],
            result["suggestions"],
            result["modelAnswer"]
        )

    except Exception as e:
        app.logger.error(f"Gemini grading error: {str(e)}")
        return ("Fair", ["N/A"], ["N/A"], ["N/A"], "Refer to documentation.")

    
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)