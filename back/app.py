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
from bson import ObjectId
import PyPDF2
from collections import Counter

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
        'saved_questions': [],
        'role': 'user'  # Default role is user
    }
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/create-admin', methods=['POST'])
def create_admin():
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
        'saved_questions': [],
        'role': 'admin'
    }
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'Admin user created successfully'}), 201

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
        user_id = ObjectId(get_jwt_identity())
        
        # Update user's skills
        result = mongo.db.users.update_one(
            {'_id': user_id},
            {'$set': {'skills': skills}}  # Replace existing skills with new ones
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Failed to update skills'}), 400
            
        return jsonify({'skills': skills}), 200
    except Exception as e:
        app.logger.error(f"Error processing resume: {str(e)}")
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
        job_description = data.get('jobDescription', '')
        experience_level = data.get('experienceLevel', 'mid')
        question_types = data.get('questionTypes', {
            'technical': True,
            'behavioral': True,
            'situational': True
        })
        difficulty = data.get('difficulty', 'medium')
        
        # Validate that either skills or job description is provided
        if not skills and not job_description:
            return jsonify({'error': 'Either skills or job description must be provided'}), 400

        # Validate skills input if provided
        if skills and (not isinstance(skills, list) or any(not isinstance(s, str) for s in skills)):
            return jsonify({'error': 'Skills must be an array of strings'}), 400

        questions = generate_questions_with_gemini(
            skills,
            app.config['GEMINI_API_KEY'],
            job_description,
            experience_level,
            question_types,
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
    try:
        user_id = get_jwt_identity()
        # Convert string ID to ObjectId
        user = mongo.db.users.find_one(
            {'_id': ObjectId(user_id)},
            {
                '_id': 1,
                'name': 1,
                'email': 1,
                'skills': 1,
                'saved_questions': 1,
                'role': 1
            }
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Convert ObjectId to string for JSON serialization
        user['_id'] = str(user['_id'])
        
        # Ensure skills and saved_questions are initialized as empty arrays if not present
        if 'skills' not in user:
            user['skills'] = []
        if 'saved_questions' not in user:
            user['saved_questions'] = []
        if 'role' not in user:
            user['role'] = 'user'
        
        return jsonify(user), 200
        
    except Exception as e:
        app.logger.error(f"Dashboard error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

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

@app.route('/get-answer', methods=['POST'])
@jwt_required()
def get_answer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        question = data.get('question')
        skill = data.get('skill')
        difficulty = data.get('difficulty', 'medium')

        if not all([question, skill]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Get answer from Gemini
        answer = get_answer_from_gemini(
            question,
            skill,
            difficulty,
            app.config['GEMINI_API_KEY']
        )

        return jsonify({
            'success': True,
            'answer': answer
        }), 200

    except Exception as e:
        app.logger.error(f"Error in get_answer: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to get answer', 'details': str(e)}), 500

def get_answer_from_gemini(question, skill, difficulty, api_key):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
        ROLE: Technical Interview Coach
        TASK: Provide a structured model answer for this interview question.

        QUESTION: {question}
        SKILL AREA: {skill}
        DIFFICULTY: {difficulty}

        Provide a well-structured answer that includes:
        1. A brief introduction
        2. Key points with bullet points
        3. Examples or explanations where relevant
        4. A conclusion

        Format the answer using the following structure:
        - Start each section with a heading followed by a colon (e.g., "Introduction:")
        - Use bullet points (•) for each key point
        - Do not use any asterisks (*) or other special characters
        - Keep the formatting clean and simple

        Example format:
        Introduction:
        [Your introduction text]

        Key Points:
        • First key point
        • Second key point
        • Third key point

        Examples:
        [Your examples if relevant]

        Conclusion:
        [Your conclusion]

        Make sure the answer is:
        1. Clear and concise
        2. Well-organized with proper headings
        3. Easy to read with bullet points
        4. Appropriate for the difficulty level
        5. Demonstrates expertise in the skill area
        6. Does not include any asterisks or special formatting characters

        Return the answer in this clean, structured format.
        """

        response = model.generate_content(prompt)
        # Clean up any potential asterisks or special characters
        cleaned_response = response.text.strip().replace('*', '')
        return cleaned_response

    except Exception as e:
        app.logger.error(f"Gemini answer generation error: {str(e)}")
        return "Unable to generate answer at this time."

@app.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        data = request.get_json()
        user_id = ObjectId(get_jwt_identity())
        
        update_data = {}
        if 'name' in data and data['name'].strip():
            update_data['name'] = data['name'].strip()
        if 'email' in data and data['email'].strip():
            # Check if new email is already taken
            existing_user = mongo.db.users.find_one({'email': data['email'].strip()})
            if existing_user and str(existing_user['_id']) != str(user_id):
                return jsonify({'error': 'Email already in use'}), 400
            update_data['email'] = data['email'].strip()
        if 'password' in data and data['password'].strip():
            update_data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            
        if not update_data:
            return jsonify({'error': 'No fields to update'}), 400
            
        result = mongo.db.users.update_one(
            {'_id': user_id},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
            
        # Fetch updated user data
        updated_user = mongo.db.users.find_one(
            {'_id': user_id},
            {'password': 0}
        )
        updated_user['_id'] = str(updated_user['_id'])
            
        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_user
        }), 200
        
    except Exception as e:
        app.logger.error(f"Profile update error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/save-question', methods=['POST'])
@jwt_required()
def save_question():
    try:
        data = request.get_json()
        if not all(k in data for k in ['question', 'skill', 'type', 'difficulty']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        user_id = ObjectId(get_jwt_identity())
        question_data = {
            'question': data['question'],
            'skill': data['skill'],
            'type': data['type'],
            'difficulty': data['difficulty'],
            'saved_at': datetime.datetime.utcnow()
        }
        
        result = mongo.db.users.update_one(
            {'_id': user_id},
            {'$push': {'saved_questions': question_data}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Failed to save question'}), 400
            
        return jsonify({'message': 'Question saved successfully'}), 200
        
    except Exception as e:
        app.logger.error(f"Error saving question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-saved-questions', methods=['GET'])
@jwt_required()
def get_saved_questions():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one(
            {'_id': user_id},
            {'saved_questions': 1}
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'saved_questions': user.get('saved_questions', [])}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_json_from_text(text):
    """Extract and parse JSON from text response"""
    try:
        # First try direct JSON parsing
        return json.loads(text)
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON using regex
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                raise Exception("Failed to parse JSON from response")
        raise Exception("No valid JSON found in response")

def analyze_resume_with_gemini(resume_text, job_description, api_key):
    """Analyze resume using Gemini API"""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        ACT AS AN EXPERT RESUME ANALYST. Analyze this resume against the job description and provide 
        a detailed technical analysis with actionable insights.

        RESUME CONTENT:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        ANALYSIS REQUIREMENTS:
        1. Evaluate ATS compatibility (0-100 score) considering:
           - Proper section headings (Experience, Education, Skills)
           - Keyword optimization
           - Readable formatting (no complex tables/graphics)
           - Standard file structure

        2. Calculate job match score (0-100) based on:
           - Skill alignment (weight: 40%)
           - Experience relevance (weight: 30%)
           - Qualification match (weight: 20%)
           - Cultural fit indicators (weight: 10%)

        3. Provide specific, actionable suggestions for improvement

        RESPONSE FORMAT (STRICT JSON ONLY):
        {{
            "atsScore": <int 0-100>,
            "jobMatchScore": <int 0-100>,
            "scoreBreakdown": {{
                "skillsMatch": <int 0-100>,
                "experienceMatch": <int 0-100>,
                "educationMatch": <int 0-100>
            }},
            "matchingSkills": [<string>],
            "missingSkills": [<string>],
            "atsIssues": [<string>],
            "suggestions": [
                {{
                    "category": "formatting|content|skills",
                    "suggestion": <string>,
                    "priority": "high|medium|low"
                }}
            ]
        }}

        IMPORTANT:
        - Be critical but constructive
        - Focus on quantifiable improvements
        - Avoid generic advice
        - Return ONLY valid JSON (no commentary)
        - Ensure all arrays are properly formatted
        - Ensure all suggestions have category, suggestion, and priority fields
        """
        
        response = model.generate_content(prompt)
        result = extract_json_from_text(response.text)
        
        # Validate and ensure proper format
        if not isinstance(result, dict):
            raise ValueError("Invalid response format: expected dictionary")
            
        # Ensure all required fields exist with proper types
        required_fields = {
            'atsScore': int,
            'jobMatchScore': int,
            'matchingSkills': list,
            'missingSkills': list,
            'atsIssues': list,
            'suggestions': list
        }
        
        for field, field_type in required_fields.items():
            if field not in result:
                result[field] = [] if field_type == list else 0
            elif not isinstance(result[field], field_type):
                result[field] = [] if field_type == list else 0
                
        # Validate suggestions format
        if result['suggestions']:
            valid_suggestions = []
            for suggestion in result['suggestions']:
                if isinstance(suggestion, dict) and all(k in suggestion for k in ['category', 'suggestion', 'priority']):
                    valid_suggestions.append({
                        'category': str(suggestion['category']),
                        'suggestion': str(suggestion['suggestion']),
                        'priority': str(suggestion['priority'])
                    })
            result['suggestions'] = valid_suggestions
            
        return result
        
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

@app.route('/analyze-resume', methods=['POST'])
@jwt_required()
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
            
        file = request.files['resume']
        job_description = request.form.get('jobDescription', '')
        
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload a PDF or Word document'}), 400
            
        if not job_description:
            return jsonify({'error': 'Job description is required'}), 400

        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from resume
            resume_text = extract_text_from_resume(filepath)
            
            # Analyze resume using Gemini
            analysis = analyze_resume_with_gemini(
                resume_text, 
                job_description,
                app.config['GEMINI_API_KEY']
            )
            
            return jsonify(analysis), 200
            
        finally:
            # Clean up the temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        app.logger.error(f"Resume analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def extract_text_from_resume(filepath):
    """Extract text from PDF resume"""
    try:
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = "".join(page.extract_text() for page in reader.pages)
            return text
    except Exception as e:
        raise Exception(f"Failed to process resume: {str(e)}")

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        # Get the current user
        user_id = get_jwt_identity()
        current_user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check if user is admin
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get all users except the current admin
        users = list(mongo.db.users.find(
            {'_id': {'$ne': ObjectId(user_id)}},
            {'password': 0}  # Exclude password field
        ))
        
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
            
        return jsonify({'users': users}), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)