from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import math
import re

app = FastAPI(title="CareerForge AI Service", version="1.0.0")

class AnalysisRequest(BaseModel):
    resume_text: str
    extracted_skills: List[str]
    target_role: str

class AnalysisResponse(BaseModel):
    readiness_score: float
    matched_skills: List[str]
    skill_gaps: List[str]
    roadmap: List[Dict[str, Any]]

# Comprehensive skill dictionary for extraction
EXTENDED_SKILLS = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin",
    "react", "next.js", "nextjs", "vue", "angular", "html", "css", "tailwind", "redux", "graphql",
    "node.js", "nodejs", "express", "nestjs", "django", "flask", "fastapi", "spring",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "linux", "git",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "sql",
    "rest api", "microservices", "graphql", "kafka", "rabbitmq", "agile", "scrum"
]

# Mock database of required skills by role
ROLE_REQUIREMENTS = {
    "frontend developer": ["javascript", "typescript", "react", "html", "css", "nextjs", "tailwind", "redux", "git", "rest api"],
    "backend developer": ["nodejs", "python", "java", "postgresql", "mongodb", "docker", "aws", "nestjs", "express", "rest api", "git", "microservices"],
    "full stack developer": ["javascript", "typescript", "react", "nodejs", "postgresql", "docker", "aws", "nextjs", "css", "git", "rest api"],
    "data scientist": ["python", "sql", "machine learning", "pandas", "numpy", "tensorflow", "pytorch", "statistics"],
    "devops engineer": ["linux", "docker", "kubernetes", "aws", "terraform", "ci/cd", "python", "bash", "git"],
    "ml engineer": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "docker", "aws", "git", "rest api"],
    "mobile developer": ["react", "javascript", "typescript", "swift", "kotlin", "git", "rest api", "firebase"],
    "cloud engineer": ["aws", "gcp", "azure", "docker", "kubernetes", "terraform", "linux", "python", "git"]
}

def normalize_skill(name: str) -> str:
    # Keep alphanumeric characters, plus signs, and hashes
    name_clean = re.sub(r'[^a-z0-9+#]', '', name.lower())
    synonyms = {
        "js": "javascript",
        "ts": "typescript",
        "cpp": "c++",
        "csharp": "c#",
        "reactjs": "react",
        "react.js": "react",
        "postgres": "postgresql",
        "mongodb": "mongo",
        "kubernetes": "k8s",
        "googlecloud": "gcp",
        "googlecloudplatform": "gcp",
        "amazonwebservices": "aws",
    }
    return synonyms.get(name_clean, name_clean)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(request: AnalysisRequest):
    # Extract additional skills from resume_text safely with spacer-agnostic regex
    text_lower = request.resume_text.lower()
    additional_skills = []
    for skill in EXTENDED_SKILLS:
        # Create a flexible pattern: replace any spaces, dots, hyphens, or slashes with a character class matching any spacer
        parts = re.split(r'[\s.\-/]+', skill)
        if len(parts) > 1:
            spacer = r'[\s.\-/]*'
            flexible_pattern = spacer.join([re.escape(p) for p in parts])
        else:
            flexible_pattern = re.escape(skill)
            
        pattern = r'(^|[^a-z0-9+#])' + flexible_pattern + r'([^a-z0-9+#]|$)'
        if re.search(pattern, text_lower):
            additional_skills.append(skill)
            
    # Combine and normalize skills
    user_skills = set([s.lower() for s in request.extracted_skills] + additional_skills)
    
    target_role = request.target_role.lower()
    # Find best matching role
    role_key = next((k for k in ROLE_REQUIREMENTS.keys() if k in target_role or target_role in k), "full stack developer")
    
    # Default to a generic profile if role not matched perfectly
    required_skills = ROLE_REQUIREMENTS.get(role_key, ["javascript", "python", "sql", "git", "rest api", "docker"])
    
    matched_skills = []
    skill_gaps = []
    
    for req_skill in required_skills:
        req_norm = normalize_skill(req_skill)
        match_found = False
        
        for us in user_skills:
            us_norm = normalize_skill(us)
            
            # Direct match on normalized forms
            if req_norm == us_norm:
                match_found = True
                break
                
            # Substring match for longer words (e.g. postgresql in postgres or vice versa)
            if len(req_norm) > 3 and len(us_norm) > 3:
                if req_norm in us_norm or us_norm in req_norm:
                    match_found = True
                    break
                    
        if match_found:
            matched_skills.append(req_skill)
        else:
            skill_gaps.append(req_skill)
            
    # Calculate score
    total_required = len(required_skills)
    matched_count = len(matched_skills)
    readiness_score = math.floor((matched_count / total_required) * 100) if total_required > 0 else 0
    
    # Generate Roadmap
    roadmap = []
    priority_level = 1
    
    for gap in skill_gaps:
        roadmap.append({
            "step": priority_level,
            "skill": gap.title(),
            "title": f"Master {gap.title()}",
            "description": f"Learn the core concepts of {gap} and build a small project.",
            "priority": "high" if priority_level <= 2 else "medium",
            "completed": False,
            "duration": "2 weeks",
            "resources": [
                {"name": f"{gap.title()} Crash Course on YouTube", "url": f"https://youtube.com/results?search_query={gap}+tutorial", "type": "Free"},
                {"name": f"Coursera {gap.title()} Specialization", "url": f"https://www.coursera.org/search?query={gap}", "type": "Paid"},
                {"name": f"Simplilearn {gap.title()} Training", "url": f"https://www.simplilearn.com/search?q={gap}", "type": "Paid"}
            ]
        })
        priority_level += 1

    return AnalysisResponse(
        readiness_score=readiness_score,
        matched_skills=matched_skills,
        skill_gaps=skill_gaps,
        roadmap=roadmap
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "CareerForge AI"}
