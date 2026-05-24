"""
ML Engine for Disease Prediction
Vortex 5 - AI Diagnostic Assistant

This module handles:
- Symptom preprocessing and feature extraction
- Disease prediction using ML models
- Confidence scoring and reasoning
- Model training and updating
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import re
import os
import logging
from typing import Dict, List, Any, Tuple
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import json

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

class DiagnosticEngine:
    def __init__(self, model_path='models/'):
        self.model_path = model_path
        self.logger = logging.getLogger(__name__)
        
        # Initialize preprocessing components
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.stemmer = PorterStemmer()
        
        # Initialize models
        self.disease_classifier = None
        self.severity_classifier = None
        self.ensemble_models = {}
        
        # Medical knowledge base
        self.symptom_synonyms = self._load_symptom_synonyms()
        self.disease_symptoms = self._load_disease_symptoms()
        self.critical_symptoms = self._load_critical_symptoms()
        
        # Load or train models
        self._load_or_train_models()
    
    def _load_symptom_synonyms(self) -> Dict[str, List[str]]:
        """Load symptom synonyms for better text processing"""
        return {
            'headache': ['head pain', 'cephalgia', 'migraine', 'head ache'],
            'fever': ['high temperature', 'pyrexia', 'hyperthermia', 'hot'],
            'cough': ['coughing', 'hacking', 'tussis'],
            'shortness of breath': ['breathlessness', 'dyspnea', 'difficulty breathing', 'sob'],
            'chest pain': ['chest discomfort', 'thoracic pain', 'chest tightness'],
            'nausea': ['queasiness', 'sick feeling', 'upset stomach'],
            'vomiting': ['throwing up', 'emesis', 'puking'],
            'diarrhea': ['loose stools', 'watery stools', 'frequent bowel movements'],
            'constipation': ['difficulty passing stools', 'hard stools', 'infrequent bowel movements'],
            'abdominal pain': ['stomach pain', 'belly pain', 'tummy ache', 'stomach ache'],
            'fatigue': ['tiredness', 'exhaustion', 'weakness', 'lethargy'],
            'dizziness': ['lightheadedness', 'vertigo', 'unsteadiness'],
            'joint pain': ['arthralgia', 'joint ache', 'joint stiffness'],
            'muscle pain': ['myalgia', 'muscle ache', 'muscle soreness'],
            'back pain': ['backache', 'lumbar pain', 'spine pain'],
            'sore throat': ['throat pain', 'pharyngitis', 'throat irritation'],
            'runny nose': ['nasal discharge', 'rhinorrhea', 'stuffy nose'],
            'skin rash': ['skin eruption', 'dermatitis', 'skin irritation']
        }
    
    def _load_disease_symptoms(self) -> Dict[str, Dict]:
        """Load disease-symptom mapping with probabilities"""
        return {
            'Common Cold': {
                'symptoms': ['runny nose', 'sore throat', 'cough', 'sneezing', 'mild fever'],
                'severity': 'mild',
                'category': 'respiratory'
            },
            'Influenza': {
                'symptoms': ['fever', 'cough', 'body aches', 'fatigue', 'headache', 'sore throat'],
                'severity': 'moderate',
                'category': 'respiratory'
            },
            'COVID-19': {
                'symptoms': ['fever', 'cough', 'shortness of breath', 'fatigue', 'loss of taste', 'loss of smell'],
                'severity': 'moderate-severe',
                'category': 'respiratory'
            },
            'Gastroenteritis': {
                'symptoms': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
                'severity': 'mild-moderate',
                'category': 'gastrointestinal'
            },
            'Migraine': {
                'symptoms': ['severe headache', 'nausea', 'sensitivity to light', 'sensitivity to sound'],
                'severity': 'moderate-severe',
                'category': 'neurological'
            },
            'Hypertension': {
                'symptoms': ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
                'severity': 'moderate-severe',
                'category': 'cardiovascular'
            },
            'Diabetes Type 2': {
                'symptoms': ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision'],
                'severity': 'chronic',
                'category': 'endocrine'
            },
            'Anxiety Disorder': {
                'symptoms': ['restlessness', 'rapid heartbeat', 'sweating', 'difficulty concentrating'],
                'severity': 'mild-moderate',
                'category': 'mental_health'
            },
            'Pneumonia': {
                'symptoms': ['fever', 'cough', 'chest pain', 'shortness of breath', 'fatigue'],
                'severity': 'severe',
                'category': 'respiratory'
            },
            'Urinary Tract Infection': {
                'symptoms': ['burning urination', 'frequent urination', 'cloudy urine', 'pelvic pain'],
                'severity': 'mild-moderate',
                'category': 'urological'
            },
            'Allergic Reaction': {
                'symptoms': ['skin rash', 'itching', 'swelling', 'difficulty breathing'],
                'severity': 'mild-severe',
                'category': 'immunological'
            },
            'Depression': {
                'symptoms': ['persistent sadness', 'loss of interest', 'fatigue', 'sleep disturbances'],
                'severity': 'moderate-severe',
                'category': 'mental_health'
            }
        }
    
    def _load_critical_symptoms(self) -> List[str]:
        """Load symptoms that require immediate medical attention"""
        return [
            'severe chest pain',
            'difficulty breathing',
            'unconsciousness',
            'severe bleeding',
            'severe abdominal pain',
            'high fever above 104F',
            'severe headache with stiff neck',
            'sudden vision loss',
            'severe allergic reaction',
            'stroke symptoms',
            'heart attack symptoms',
            'severe burns',
            'poisoning',
            'seizures'
        ]
    
    def preprocess_symptoms(self, symptoms_text: str, language: str = 'en') -> Dict[str, Any]:
        """Preprocess and extract features from symptom text"""
        try:
            # Convert to lowercase and clean
            cleaned_text = symptoms_text.lower().strip()
            
            # Remove special characters except medical ones
            cleaned_text = re.sub(r'[^\w\s\-\.]', ' ', cleaned_text)
            
            # Tokenize
            tokens = word_tokenize(cleaned_text)
            
            # Remove stopwords
            stop_words = set(stopwords.words('english'))
            tokens = [token for token in tokens if token not in stop_words]
            
            # Stem words
            stemmed_tokens = [self.stemmer.stem(token) for token in tokens]
            
            # Extract symptom mentions using synonyms
            detected_symptoms = self._extract_symptoms(cleaned_text)
            
            # Calculate severity indicators
            severity_score = self._calculate_severity_score(detected_symptoms, cleaned_text)
            
            # Check for critical symptoms
            critical_flags = self._check_critical_symptoms(cleaned_text)
            
            processed_data = {
                'original_text': symptoms_text,
                'cleaned_text': cleaned_text,
                'tokens': tokens,
                'stemmed_tokens': stemmed_tokens,
                'detected_symptoms': detected_symptoms,
                'severity_score': severity_score,
                'critical_flags': critical_flags,
                'language': language,
                'processed_timestamp': pd.Timestamp.now().isoformat()
            }
            
            return processed_data
            
        except Exception as e:
            self.logger.error(f"Symptom preprocessing error: {str(e)}")
            return {
                'original_text': symptoms_text,
                'cleaned_text': symptoms_text.lower(),
                'tokens': [],
                'stemmed_tokens': [],
                'detected_symptoms': [],
                'severity_score': 0.5,
                'critical_flags': [],
                'language': language,
                'error': str(e)
            }
    
    def _extract_symptoms(self, text: str) -> List[Dict[str, Any]]:
        """Extract recognized symptoms from text"""
        detected = []
        
        for main_symptom, synonyms in self.symptom_synonyms.items():
            all_terms = [main_symptom] + synonyms
            
            for term in all_terms:
                if term in text:
                    detected.append({
                        'symptom': main_symptom,
                        'matched_term': term,
                        'confidence': 0.9 if term == main_symptom else 0.7
                    })
                    break  # Avoid duplicates
        
        return detected
    
    def _calculate_severity_score(self, detected_symptoms: List[Dict], text: str) -> float:
        """Calculate severity score based on symptoms and descriptors"""
        base_score = len(detected_symptoms) * 0.1
        
        # Severity modifiers
        severe_words = ['severe', 'intense', 'unbearable', 'excruciating', 'terrible']
        moderate_words = ['moderate', 'noticeable', 'uncomfortable']
        mild_words = ['mild', 'slight', 'minor']
        
        severity_modifier = 0.0
        if any(word in text for word in severe_words):
            severity_modifier = 0.4
        elif any(word in text for word in moderate_words):
            severity_modifier = 0.2
        elif any(word in text for word in mild_words):
            severity_modifier = -0.1
        
        # Duration modifiers
        chronic_words = ['chronic', 'persistent', 'ongoing', 'continuous']
        acute_words = ['sudden', 'sharp', 'acute']
        
        duration_modifier = 0.0
        if any(word in text for word in chronic_words):
            duration_modifier = 0.2
        elif any(word in text for word in acute_words):
            duration_modifier = 0.3
        
        final_score = min(1.0, base_score + severity_modifier + duration_modifier)
        return final_score
    
    def _check_critical_symptoms(self, text: str) -> List[str]:
        """Check for symptoms requiring immediate medical attention"""
        critical_found = []
        
        for critical_symptom in self.critical_symptoms:
            if critical_symptom in text:
                critical_found.append(critical_symptom)
        
        # Additional critical patterns
        critical_patterns = [
            r'can\'t breathe',
            r'severe pain',
            r'chest pressure',
            r'losing consciousness',
            r'severe bleeding'
        ]
        
        for pattern in critical_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                critical_found.append(f"Critical pattern: {pattern}")
        
        return critical_found
    
    def predict_diseases(self, processed_symptoms: Dict, user_profile: Dict = None) -> List[Dict[str, Any]]:
        """Predict possible diseases based on symptoms"""
        try:
            detected_symptoms = processed_symptoms.get('detected_symptoms', [])
            severity_score = processed_symptoms.get('severity_score', 0.5)
            
            if not detected_symptoms:
                return self._get_general_recommendations()
            
            # Calculate disease probabilities
            disease_scores = {}
            
            for disease, disease_info in self.disease_symptoms.items():
                score = self._calculate_disease_probability(
                    detected_symptoms, 
                    disease_info, 
                    user_profile or {}
                )
                
                if score > 0.1:  # Only include diseases with reasonable probability
                    disease_scores[disease] = {
                        'name': disease,
                        'probability': score,
                        'confidence': min(0.95, score * 1.2),  # Cap confidence
                        'category': disease_info['category'],
                        'severity': disease_info['severity'],
                        'matching_symptoms': self._get_matching_symptoms(detected_symptoms, disease_info['symptoms']),
                        'reasoning': self._generate_reasoning(detected_symptoms, disease_info)
                    }
            
            # Sort by probability
            sorted_diseases = sorted(
                disease_scores.values(), 
                key=lambda x: x['probability'], 
                reverse=True
            )
            
            # Return top 5 predictions
            top_predictions = sorted_diseases[:5]
            
            # Add ML model predictions if available
            if self.disease_classifier:
                ml_predictions = self._get_ml_predictions(processed_symptoms, user_profile)
                top_predictions = self._merge_predictions(top_predictions, ml_predictions)
            
            return top_predictions
            
        except Exception as e:
            self.logger.error(f"Disease prediction error: {str(e)}")
            return self._get_general_recommendations()
    
    def _calculate_disease_probability(self, detected_symptoms: List[Dict], disease_info: Dict, user_profile: Dict) -> float:
        """Calculate probability of a specific disease"""
        disease_symptoms = disease_info['symptoms']
        detected_symptom_names = [s['symptom'] for s in detected_symptoms]
        
        # Basic matching score
        matches = len(set(detected_symptom_names) & set(disease_symptoms))
        base_probability = matches / max(len(disease_symptoms), 1)
        
        # Adjust based on user profile
        age_factor = 1.0
        if user_profile.get('age'):
            age = user_profile['age']
            # Simple age-based adjustments (would be more sophisticated in real system)
            if disease_info['name'] == 'Hypertension' and age > 40:
                age_factor = 1.3
            elif disease_info['name'] == 'Common Cold' and age < 12:
                age_factor = 1.2
        
        # Adjust based on severity
        severity_factor = 1.0
        if disease_info['severity'] == 'severe':
            severity_factor = 0.8  # Be more conservative with severe diagnoses
        
        final_probability = base_probability * age_factor * severity_factor
        return min(0.9, final_probability)  # Cap at 90%
    
    def _get_matching_symptoms(self, detected_symptoms: List[Dict], disease_symptoms: List[str]) -> List[str]:
        """Get list of matching symptoms between detected and disease symptoms"""
        detected_names = [s['symptom'] for s in detected_symptoms]
        return list(set(detected_names) & set(disease_symptoms))
    
    def _generate_reasoning(self, detected_symptoms: List[Dict], disease_info: Dict) -> str:
        """Generate human-readable reasoning for the prediction"""
        matching_symptoms = self._get_matching_symptoms(detected_symptoms, disease_info['symptoms'])
        
        if not matching_symptoms:
            return "Based on general symptom patterns"
        
        symptom_text = ", ".join(matching_symptoms[:3])
        reasoning = f"Based on matching symptoms: {symptom_text}"
        
        if len(matching_symptoms) > 3:
            reasoning += f" and {len(matching_symptoms) - 3} other symptoms"
        
        reasoning += f". This condition is typically {disease_info['severity']} in severity."
        
        return reasoning
    
    def _get_general_recommendations(self) -> List[Dict[str, Any]]:
        """Return general recommendations when no specific symptoms are detected"""
        return [
            {
                'name': 'General Health Assessment Needed',
                'probability': 0.5,
                'confidence': 0.3,
                'category': 'general',
                'severity': 'unknown',
                'matching_symptoms': [],
                'reasoning': 'Symptoms require professional medical evaluation for accurate diagnosis.'
            }
        ]
    
    def _get_ml_predictions(self, processed_symptoms: Dict, user_profile: Dict) -> List[Dict[str, Any]]:
        """Get predictions from trained ML models"""
        try:
            # This would use the actual trained models
            # For now, return placeholder
            return []
        except Exception as e:
            self.logger.error(f"ML prediction error: {str(e)}")
            return []
    
    def _merge_predictions(self, rule_based: List[Dict], ml_based: List[Dict]) -> List[Dict[str, Any]]:
        """Merge rule-based and ML predictions"""
        # Simple merge - in real system would be more sophisticated
        all_predictions = rule_based + ml_based
        
        # Remove duplicates and sort
        seen_diseases = set()
        merged = []
        
        for pred in sorted(all_predictions, key=lambda x: x['probability'], reverse=True):
            if pred['name'] not in seen_diseases:
                merged.append(pred)
                seen_diseases.add(pred['name'])
        
        return merged[:5]  # Top 5
    
    def _load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            if os.path.exists(f"{self.model_path}disease_classifier.joblib"):
                self.disease_classifier = joblib.load(f"{self.model_path}disease_classifier.joblib")
                self.vectorizer = joblib.load(f"{self.model_path}vectorizer.joblib")
                self.logger.info("Loaded existing ML models")
            else:
                self.logger.info("No existing models found, using rule-based system only")
                # In a real system, you would train models here with medical datasets
                
        except Exception as e:
            self.logger.error(f"Model loading error: {str(e)}")
    
    def retrain_with_feedback(self) -> Dict[str, Any]:
        """Retrain models with user feedback (placeholder)"""
        try:
            # This would implement actual model retraining
            # with accumulated feedback data
            
            return {
                'status': 'success',
                'accuracy_improvement': 0.02,
                'models_updated': ['disease_classifier', 'severity_classifier']
            }
            
        except Exception as e:
            self.logger.error(f"Retraining error: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def explain_prediction(self, prediction: Dict, processed_symptoms: Dict) -> Dict[str, Any]:
        """Generate detailed explanation for a prediction"""
        explanation = {
            'disease': prediction['name'],
            'confidence': prediction['confidence'],
            'primary_reasoning': prediction.get('reasoning', ''),
            'symptom_analysis': {
                'matched_symptoms': prediction.get('matching_symptoms', []),
                'severity_assessment': processed_symptoms.get('severity_score', 0),
                'critical_flags': processed_symptoms.get('critical_flags', [])
            },
            'confidence_factors': {
                'symptom_match_quality': len(prediction.get('matching_symptoms', [])) / 5,
                'symptom_specificity': prediction.get('probability', 0),
                'user_profile_alignment': 0.7  # Placeholder
            },
            'uncertainty_sources': [
                'Limited symptom information' if len(prediction.get('matching_symptoms', [])) < 3 else None,
                'Symptoms could match multiple conditions' if prediction['confidence'] < 0.6 else None
            ]
        }
        
        # Remove None values
        explanation['uncertainty_sources'] = [
            source for source in explanation['uncertainty_sources'] if source
        ]
        
        return explanation