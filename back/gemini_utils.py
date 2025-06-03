import PyPDF2
import re
import json
import google.generativeai as genai
import os

def extract_skills_from_pdf(filepath):
    """Extract skills from PDF resume"""
    try:
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = "".join(page.extract_text() for page in reader.pages)
            return extract_skills(text)
    except Exception as e:
        raise Exception(f"Failed to process PDF: {str(e)}")

def extract_skills(text):
    """Identify skills in text using pattern matching"""
    patterns = [
        r'\bPython\b', r'\bJavaScript\b', r'\bJava\b', r'\bC\+\+\b', r'\bC#\b',
        r'\bReact\b', r'\bAngular\b', r'\bVue\b', r'\bNode\.js\b',
        r'\bDjango\b', r'\bFlask\b', r'\bSpring\b',
        r'\bSQL\b', r'\bMongoDB\b', r'\bPostgreSQL\b',
        r'\bAWS\b', r'\bAzure\b', r'\bDocker\b', r'\bKubernetes\b',
        r'\bMachine Learning\b', r'\bDeep Learning\b', r'\bTensorFlow\b', r'\bPyTorch\b',
        r'\bData Structures\b', r'\bAlgorithms\b',
        r'\bGit\b', r'\bCI/CD\b', r'\bREST API\b', r'\bGraphQL\b'
    ]
    return list({re.search(p, text, re.I).group(0) for p in patterns if re.search(p, text, re.I)})


def extract_json_from_text(text):
    """Extract JSON from potentially malformed text response"""
    try:
        # First try to parse directly
        return json.loads(text)
    except json.JSONDecodeError:
        # If direct parse fails, try to extract JSON from markdown or code blocks
        json_match = re.search(r'```json\n([\s\S]*?)\n```', text)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Try to find the first valid JSON structure
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
                
        raise ValueError(f"Could not extract valid JSON from response: {text[:200]}...")

def generate_questions_with_gemini(skills, api_key, job_description="", experience_level="mid", question_types=None, difficulty="medium"):
    """Generate questions with robust JSON handling"""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Convert question types to a more readable format
        question_types_str = []
        if question_types:
            if question_types.get('technical'):
                question_types_str.append('technical')
            if question_types.get('behavioral'):
                question_types_str.append('behavioral')
            if question_types.get('situational'):
                question_types_str.append('situational')
        
        # Determine if we should use skills or job description as the primary source
        use_job_description = bool(job_description) and not skills
        
        prompt = f"""
        Generate interview questions based on the following parameters:
        
        {'Job Description: ' + job_description if use_job_description else 'Skills: ' + ', '.join(skills)}
        Experience Level: {experience_level}
        Difficulty Level: {difficulty}
        Question Types: {', '.join(question_types_str) if question_types_str else 'all types'}
        
        Generate 3-5 questions {'based on the job description' if use_job_description else 'for each skill'}, considering:
        1. The experience level of the candidate
        2. The specific question types requested
        3. The difficulty level specified
        {'4. The context and requirements from the job description' if use_job_description else ''}
        
        Return ONLY a valid JSON array where each object has:
        - 'skill' (string - {'extracted from job description' if use_job_description else 'matching the provided skills'})
        - 'question' (string)
        - 'difficulty' (string matching one of: 'easy', 'medium', 'hard')
        - 'type' (string matching one of: 'technical', 'behavioral', 'situational')
        
        Example format:
        [
          {{
            "skill": "Python",
            "question": "Explain the difference between lists and tuples in Python.",
            "difficulty": "easy",
            "type": "technical"
          }},
          {{
            "skill": "React",
            "question": "Describe a challenging project you worked on and how you handled it.",
            "difficulty": "medium",
            "type": "behavioral"
          }}
        ]
        
        Important:
        - Return ONLY the JSON array
        - Do not include any markdown syntax
        - Do not include any additional text or explanations
        - Ensure all brackets and quotes are properly closed
        - Questions should be relevant to {'the job description' if use_job_description else 'the specified skills'}
        - Difficulty should match the specified difficulty level
        - Experience level should be considered in question complexity
        """
        
        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("Empty response from Gemini API")
            
        # Try to parse the response
        try:
            questions = extract_json_from_text(response.text)
            
            # Validate the structure
            if not isinstance(questions, list):
                raise ValueError("Response is not a JSON array")
                
            for q in questions:
                if not all(k in q for k in ['skill', 'question', 'difficulty', 'type']):
                    raise ValueError("Missing required fields in question object")
                    
            return questions
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response: {response.text[:200]}...") from e
            
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")