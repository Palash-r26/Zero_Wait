"""
Safety Checker System
Vortex 5 - AI Diagnostic Assistant

This module handles:
- Risk assessment and critical symptom detection
- Provider referral recommendations
- Safety compliance checks
- Emergency case identification
"""

import logging
import re
from typing import Dict, List, Any, Tuple
from datetime import datetime

class SafetyChecker:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Load safety databases
        self.emergency_symptoms = self._load_emergency_symptoms()
        self.high_risk_combinations = self._load_high_risk_combinations()
        self.age_based_risks = self._load_age_based_risks()
        self.referral_triggers = self._load_referral_triggers()
        
    def _load_emergency_symptoms(self) -> Dict[str, Dict]:
        """Load emergency symptoms that require immediate attention"""
        return {
            'cardiac_emergency': {
                'keywords': [
                    'severe chest pain', 'crushing chest pain', 'chest pressure',
                    'left arm pain with chest pain', 'jaw pain with chest pain',
                    'shortness of breath with chest pain', 'sweating with chest pain',
                    'heart attack', 'cardiac arrest'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Call emergency services immediately',
                'time_sensitivity': 'minutes'
            },
            'stroke': {
                'keywords': [
                    'sudden weakness', 'facial drooping', 'slurred speech',
                    'sudden confusion', 'sudden vision loss', 'sudden severe headache',
                    'loss of balance', 'stroke symptoms', 'paralysis'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Call emergency services immediately',
                'time_sensitivity': 'minutes'
            },
            'respiratory_failure': {
                'keywords': [
                    'severe difficulty breathing', 'cannot breathe', 'gasping for air',
                    'blue lips', 'blue fingers', 'respiratory distress',
                    'choking', 'severe asthma attack'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Call emergency services immediately',
                'time_sensitivity': 'minutes'
            },
            'severe_allergic_reaction': {
                'keywords': [
                    'severe allergic reaction', 'anaphylaxis', 'swelling of face',
                    'swelling of throat', 'difficulty swallowing', 'hives with breathing difficulty'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Call emergency services immediately',
                'time_sensitivity': 'minutes'
            },
            'severe_bleeding': {
                'keywords': [
                    'severe bleeding', 'heavy bleeding', 'uncontrolled bleeding',
                    'blood loss', 'hemorrhage', 'bleeding that won\'t stop'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Apply pressure and call emergency services',
                'time_sensitivity': 'minutes'
            },
            'loss_of_consciousness': {
                'keywords': [
                    'unconscious', 'passed out', 'fainting repeatedly', 'blackouts',
                    'loss of consciousness', 'unresponsive', 'collapsed'
                ],
                'risk_level': 'CRITICAL',
                'action': 'Call emergency services immediately',
                'time_sensitivity': 'minutes'
            },
            'severe_neurological': {
                'keywords': [
                    'seizure', 'convulsions', 'severe headache with fever',
                    'stiff neck with fever', 'severe confusion', 'delirium',
                    'sudden memory loss', 'severe dizziness with vomiting'
                ],
                'risk_level': 'HIGH',
                'action': 'Seek immediate medical attention',
                'time_sensitivity': 'hours'
            },
            'severe_abdominal': {
                'keywords': [
                    'severe abdominal pain', 'excruciating stomach pain',
                    'rigid abdomen', 'abdominal pain with vomiting blood',
                    'severe pain right lower abdomen', 'appendicitis symptoms'
                ],
                'risk_level': 'HIGH',
                'action': 'Seek immediate medical attention',
                'time_sensitivity': 'hours'
            },
            'high_fever': {
                'keywords': [
                    'fever over 104', 'very high fever', 'fever with stiff neck',
                    'fever with severe headache', 'fever with rash',
                    'fever in newborn', 'hyperthermia'
                ],
                'risk_level': 'HIGH',
                'action': 'Seek immediate medical attention',
                'time_sensitivity': 'hours'
            },
            'severe_trauma': {
                'keywords': [
                    'head injury', 'severe trauma', 'broken bones',
                    'deep cuts', 'severe burns', 'fall from height',
                    'car accident', 'major injury'
                ],
                'risk_level': 'HIGH',
                'action': 'Seek immediate medical attention',
                'time_sensitivity': 'hours'
            }
        }
    
    def _load_high_risk_combinations(self) -> List[Dict]:
        """Load high-risk symptom combinations"""
        return [
            {
                'symptoms': ['chest pain', 'shortness of breath', 'sweating'],
                'condition': 'Possible heart attack',
                'risk_level': 'CRITICAL',
                'confidence_threshold': 0.7
            },
            {
                'symptoms': ['severe headache', 'stiff neck', 'fever'],
                'condition': 'Possible meningitis',
                'risk_level': 'CRITICAL',
                'confidence_threshold': 0.6
            },
            {
                'symptoms': ['abdominal pain', 'vomiting', 'fever', 'right lower quadrant pain'],
                'condition': 'Possible appendicitis',
                'risk_level': 'HIGH',
                'confidence_threshold': 0.7
            },
            {
                'symptoms': ['difficulty breathing', 'chest pain', 'cough with blood'],
                'condition': 'Possible pulmonary embolism',
                'risk_level': 'CRITICAL',
                'confidence_threshold': 0.6
            },
            {
                'symptoms': ['severe abdominal pain', 'vomiting blood', 'black stools'],
                'condition': 'Possible GI bleeding',
                'risk_level': 'HIGH',
                'confidence_threshold': 0.7
            },
            {
                'symptoms': ['confusion', 'fever', 'neck stiffness', 'sensitivity to light'],
                'condition': 'Possible central nervous system infection',
                'risk_level': 'CRITICAL',
                'confidence_threshold': 0.6
            }
        ]
    
    def _load_age_based_risks(self) -> Dict[str, Dict]:
        """Load age-specific risk factors"""
        return {
            'infant': {  # 0-2 years
                'high_risk_symptoms': ['fever', 'difficulty breathing', 'lethargy', 'poor feeding'],
                'referral_threshold': 0.3,  # Lower threshold for infants
                'special_considerations': [
                    'Any fever in infants under 3 months requires immediate attention',
                    'Dehydration develops rapidly in infants',
                    'Breathing difficulties are especially concerning'
                ]
            },
            'child': {  # 2-12 years
                'high_risk_symptoms': ['high fever', 'difficulty breathing', 'severe dehydration'],
                'referral_threshold': 0.4,
                'special_considerations': [
                    'Children can deteriorate quickly',
                    'Watch for signs of dehydration',
                    'Behavioral changes may indicate serious illness'
                ]
            },
            'adolescent': {  # 12-18 years
                'high_risk_symptoms': ['severe headache', 'chest pain', 'difficulty breathing'],
                'referral_threshold': 0.5,
                'special_considerations': [
                    'Consider mental health factors',
                    'Sports-related injuries common',
                    'Risk-taking behaviors may mask symptoms'
                ]
            },
            'adult': {  # 18-65 years
                'high_risk_symptoms': ['chest pain', 'severe headache', 'abdominal pain'],
                'referral_threshold': 0.6,
                'special_considerations': [
                    'Consider work-related stress factors',
                    'Lifestyle factors may contribute',
                    'May delay seeking care'
                ]
            },
            'elderly': {  # 65+ years
                'high_risk_symptoms': ['falls', 'confusion', 'weakness', 'chest pain'],
                'referral_threshold': 0.4,  # Lower threshold for elderly
                'special_considerations': [
                    'Multiple chronic conditions common',
                    'Drug interactions more likely',
                    'Atypical presentations common',
                    'Higher risk of complications'
                ]
            }
        }
    
    def _load_referral_triggers(self) -> Dict[str, float]:
        """Load conditions that automatically trigger provider referral"""
        return {
            'suspected_heart_attack': 1.0,
            'suspected_stroke': 1.0,
            'suspected_appendicitis': 0.9,
            'suspected_meningitis': 1.0,
            'severe_allergic_reaction': 1.0,
            'severe_trauma': 1.0,
            'psychiatric_emergency': 0.9,
            'drug_overdose': 1.0,
            'severe_dehydration': 0.8,
            'high_fever_infant': 1.0,
            'difficulty_breathing': 0.9,
            'severe_pain': 0.7,
            'neurological_symptoms': 0.8,
            'gastrointestinal_bleeding': 0.9
        }
    
    def assess_risk(self, predictions: List[Dict], processed_symptoms: Dict) -> Dict[str, Any]:
        """Main risk assessment function"""
        try:
            symptoms_text = processed_symptoms.get('original_text', '').lower()
            detected_symptoms = processed_symptoms.get('detected_symptoms', [])
            critical_flags = processed_symptoms.get('critical_flags', [])
            
            # Initialize risk assessment
            risk_assessment = {
                'risk_level': 'LOW',
                'refer_to_provider': False,
                'emergency_level': 0,  # 0-5 scale
                'reasoning': '',
                'specific_warnings': [],
                'recommended_actions': [],
                'time_sensitivity': 'routine',
                'emergency_contacts': []
            }
            
            # Check for emergency symptoms
            emergency_check = self._check_emergency_symptoms(symptoms_text)
            if emergency_check['is_emergency']:
                risk_assessment.update({
                    'risk_level': 'CRITICAL',
                    'refer_to_provider': True,
                    'emergency_level': 5,
                    'reasoning': emergency_check['reasoning'],
                    'specific_warnings': emergency_check['warnings'],
                    'recommended_actions': emergency_check['actions'],
                    'time_sensitivity': emergency_check['time_sensitivity'],
                    'emergency_contacts': self._get_emergency_contacts()
                })
                return risk_assessment
            
            # Check high-risk combinations
            combination_risk = self._check_symptom_combinations(detected_symptoms, symptoms_text)
            if combination_risk['high_risk']:
                risk_assessment.update({
                    'risk_level': combination_risk['risk_level'],
                    'refer_to_provider': True,
                    'emergency_level': combination_risk['emergency_level'],
                    'reasoning': combination_risk['reasoning'],
                    'specific_warnings': combination_risk['warnings'],
                    'recommended_actions': combination_risk['actions'],
                    'time_sensitivity': combination_risk['time_sensitivity']
                })
                return risk_assessment
            
            # Check prediction-based risks
            prediction_risk = self._assess_prediction_risks(predictions)
            if prediction_risk['refer']:
                risk_assessment.update({
                    'risk_level': prediction_risk['risk_level'],
                    'refer_to_provider': True,
                    'emergency_level': prediction_risk['emergency_level'],
                    'reasoning': prediction_risk['reasoning']
                })
                return risk_assessment
            
            # Check critical flags from symptom processing
            if critical_flags:
                risk_assessment.update({
                    'risk_level': 'HIGH',
                    'refer_to_provider': True,
                    'emergency_level': 3,
                    'reasoning': f"Critical symptoms detected: {', '.join(critical_flags)}",
                    'specific_warnings': critical_flags,
                    'recommended_actions': ['Seek immediate medical attention'],
                    'time_sensitivity': 'urgent'
                })
                return risk_assessment
            
            # Standard risk assessment for non-critical cases
            standard_risk = self._standard_risk_assessment(predictions, processed_symptoms)
            risk_assessment.update(standard_risk)
            
            return risk_assessment
            
        except Exception as e:
            self.logger.error(f"Risk assessment error: {str(e)}")
            # Return conservative assessment on error
            return {
                'risk_level': 'MODERATE',
                'refer_to_provider': True,
                'emergency_level': 2,
                'reasoning': 'Unable to complete full risk assessment. Recommend professional evaluation.',
                'specific_warnings': ['System error occurred during assessment'],
                'recommended_actions': ['Consult healthcare provider'],
                'time_sensitivity': 'routine',
                'error': str(e)
            }
    
    def _check_emergency_symptoms(self, symptoms_text: str) -> Dict[str, Any]:
        """Check for emergency symptoms requiring immediate attention"""
        for emergency_type, emergency_info in self.emergency_symptoms.items():
            for keyword in emergency_info['keywords']:
                if keyword.lower() in symptoms_text:
                    return {
                        'is_emergency': True,
                        'emergency_type': emergency_type,
                        'risk_level': emergency_info['risk_level'],
                        'reasoning': f"Emergency symptoms detected: {keyword}",
                        'warnings': [f"EMERGENCY: {keyword} requires immediate attention"],
                        'actions': [emergency_info['action']],
                        'time_sensitivity': emergency_info['time_sensitivity']
                    }
        
        return {'is_emergency': False}
    
    def _check_symptom_combinations(self, detected_symptoms: List[Dict], symptoms_text: str) -> Dict[str, Any]:
        """Check for dangerous symptom combinations"""
        symptom_names = [s['symptom'] for s in detected_symptoms]
        
        for combo in self.high_risk_combinations:
            matches = sum(1 for symptom in combo['symptoms'] if any(s in symptom_names for s in [symptom]))
            
            # Also check in raw text for phrases not captured by symptom extraction
            text_matches = sum(1 for symptom in combo['symptoms'] if symptom in symptoms_text)
            total_matches = max(matches, text_matches)
            
            match_ratio = total_matches / len(combo['symptoms'])
            
            if match_ratio >= combo['confidence_threshold']:
                emergency_level = 5 if combo['risk_level'] == 'CRITICAL' else 4
                time_sensitivity = 'minutes' if combo['risk_level'] == 'CRITICAL' else 'hours'
                
                return {
                    'high_risk': True,
                    'risk_level': combo['risk_level'],
                    'emergency_level': emergency_level,
                    'reasoning': f"High-risk symptom combination detected: {combo['condition']}",
                    'warnings': [f"Symptom pattern suggests {combo['condition']}"],
                    'actions': ['Seek immediate medical attention'],
                    'time_sensitivity': time_sensitivity
                }
        
        return {'high_risk': False}
    
    def _assess_prediction_risks(self, predictions: List[Dict]) -> Dict[str, Any]:
        """Assess risks based on predicted diseases"""
        for prediction in predictions:
            disease_name = prediction['name'].lower()
            confidence = prediction.get('confidence', 0)
            
            # Check for high-risk conditions
            high_risk_conditions = [
                'heart attack', 'stroke', 'appendicitis', 'meningitis',
                'pneumonia', 'sepsis', 'anaphylaxis', 'pulmonary embolism'
            ]
            
            for condition in high_risk_conditions:
                if condition in disease_name and confidence > 0.5:
                    return {
                        'refer': True,
                        'risk_level': 'HIGH',
                        'emergency_level': 4,
                        'reasoning': f"High-risk condition predicted: {prediction['name']} (confidence: {confidence:.2f})"
                    }
            
            # Check referral triggers
            for trigger, threshold in self.referral_triggers.items():
                if trigger.replace('_', ' ') in disease_name and confidence >= threshold:
                    return {
                        'refer': True,
                        'risk_level': 'HIGH',
                        'emergency_level': 3,
                        'reasoning': f"Referral triggered by: {prediction['name']} (confidence: {confidence:.2f})"
                    }
        
        return {'refer': False}
    
    def _standard_risk_assessment(self, predictions: List[Dict], processed_symptoms: Dict) -> Dict[str, Any]:
        """Standard risk assessment for non-emergency cases"""
        severity_score = processed_symptoms.get('severity_score', 0.5)
        num_symptoms = len(processed_symptoms.get('detected_symptoms', []))
        
        # Calculate overall risk score
        risk_score = (severity_score * 0.6) + (min(num_symptoms / 10, 0.4) * 0.4)
        
        if risk_score >= 0.7:
            risk_level = 'MODERATE'
            refer = True
            emergency_level = 2
            reasoning = "Multiple symptoms with moderate to high severity"
            actions = ['Schedule appointment with healthcare provider within 24-48 hours']
            time_sensitivity = 'urgent'
        elif risk_score >= 0.4:
            risk_level = 'LOW-MODERATE' 
            refer = False
            emergency_level = 1
            reasoning = "Symptoms suggest common conditions treatable with first-line medications"
            actions = ['Monitor symptoms', 'Try recommended medications', 'Seek care if symptoms worsen']
            time_sensitivity = 'routine'
        else:
            risk_level = 'LOW'
            refer = False
            emergency_level = 0
            reasoning = "Mild symptoms likely to resolve with basic care"
            actions = ['Rest and supportive care', 'Monitor symptoms', 'Seek care if symptoms persist']
            time_sensitivity = 'routine'
        
        return {
            'risk_level': risk_level,
            'refer_to_provider': refer,
            'emergency_level': emergency_level,
            'reasoning': reasoning,
            'recommended_actions': actions,
            'time_sensitivity': time_sensitivity,
            'specific_warnings': self._get_general_warnings(predictions)
        }
    
    def _get_general_warnings(self, predictions: List[Dict]) -> List[str]:
        """Get general warnings based on predictions"""
        warnings = []
        
        for prediction in predictions:
            disease_name = prediction['name'].lower()
            
            if 'respiratory' in prediction.get('category', ''):
                warnings.append("Monitor breathing difficulty - seek help if it worsens")
            
            if 'cardiovascular' in prediction.get('category', ''):
                warnings.append("Watch for chest pain, shortness of breath, or dizziness")
            
            if 'neurological' in prediction.get('category', ''):
                warnings.append("Seek immediate care for severe headache, confusion, or vision changes")
            
            if prediction.get('confidence', 0) < 0.5:
                warnings.append("Diagnosis uncertain - monitor symptoms closely")
        
        # Add general warnings
        warnings.extend([
            "Seek immediate care if symptoms suddenly worsen",
            "Don't ignore persistent or worsening symptoms",
            "This is not a substitute for professional medical advice"
        ])
        
        return list(set(warnings))  # Remove duplicates
    
    def _get_emergency_contacts(self) -> List[Dict[str, str]]:
        """Get emergency contact information"""
        return [
            {'service': 'Ambulance (India)', 'number': '108'},
            {'service': 'Police', 'number': '100'},
            {'service': 'Fire Emergency', 'number': '101'},
            {'service': 'National Emergency Number', 'number': '112'},
            {'service': 'Poison Control', 'number': '1066'},
            {'service': 'Women Helpline', 'number': '1091'},
            {'service': 'Child Helpline', 'number': '1098'}
        ]
    
    def check_medication_safety(self, medications: List[Dict], user_profile: Any) -> Dict[str, Any]:
        """Check safety of recommended medications for user"""
        try:
            safety_issues = []
            warnings = []
            
            user_age = getattr(user_profile, 'age', None)
            user_allergies = getattr(user_profile, 'allergies', '') or ''
            chronic_conditions = getattr(user_profile, 'chronic_conditions', '') or ''
            
            for med in medications:
                med_name = med['name']
                
                # Age-based safety checks
                if user_age:
                    if user_age < 18 and 'Not recommended under 18' in med.get('pediatric_dosage', ''):
                        safety_issues.append(f"{med_name}: Not recommended for patients under 18")
                    
                    if user_age > 65:
                        elderly_cautions = [
                            'Benzodiazepine', 'Anticholinergic', 'Sedating antihistamine'
                        ]
                        if any(caution in med.get('medication_class', '') for caution in elderly_cautions):
                            warnings.append(f"{med_name}: Use with caution in elderly patients")
                
                # Allergy checks
                if user_allergies:
                    allergy_list = [allergy.strip().lower() for allergy in user_allergies.split(',')]
                    for allergy in allergy_list:
                        if allergy in med_name.lower():
                            safety_issues.append(f"{med_name}: Patient allergic to this medication")
                
                # Chronic condition interactions
                if chronic_conditions:
                    condition_list = [cond.strip().lower() for cond in chronic_conditions.split(',')]
                    for condition in condition_list:
                        if condition == 'kidney disease' and 'kidney' in ' '.join(med.get('contraindications', [])).lower():
                            safety_issues.append(f"{med_name}: Contraindicated in kidney disease")
                        elif condition == 'liver disease' and 'liver' in ' '.join(med.get('contraindications', [])).lower():
                            safety_issues.append(f"{med_name}: Contraindicated in liver disease")
            
            return {
                'is_safe': len(safety_issues) == 0,
                'safety_issues': safety_issues,
                'warnings': warnings,
                'requires_monitoring': len(warnings) > 0 or len(safety_issues) > 0
            }
            
        except Exception as e:
            self.logger.error(f"Medication safety check error: {str(e)}")
            return {
                'is_safe': False,
                'safety_issues': ['Unable to complete safety check'],
                'warnings': ['Consult healthcare provider before taking any medications'],
                'requires_monitoring': True,
                'error': str(e)
            }
    
    def generate_safety_summary(self, risk_assessment: Dict, medication_safety: Dict) -> Dict[str, Any]:
        """Generate comprehensive safety summary"""
        try:
            summary = {
                'overall_safety_level': 'SAFE',
                'primary_concerns': [],
                'action_required': False,
                'timeline': 'routine',
                'key_recommendations': [],
                'monitoring_requirements': [],
                'when_to_seek_help': []
            }
            
            # Assess overall safety based on risk and medication safety
            if risk_assessment.get('risk_level') == 'CRITICAL':
                summary['overall_safety_level'] = 'CRITICAL'
                summary['action_required'] = True
                summary['timeline'] = 'immediate'
            elif risk_assessment.get('risk_level') == 'HIGH' or not medication_safety.get('is_safe', True):
                summary['overall_safety_level'] = 'HIGH_RISK'
                summary['action_required'] = True
                summary['timeline'] = 'urgent'
            elif risk_assessment.get('risk_level') == 'MODERATE':
                summary['overall_safety_level'] = 'MODERATE_RISK'
                summary['timeline'] = 'prompt'
            
            # Collect primary concerns
            if risk_assessment.get('specific_warnings'):
                summary['primary_concerns'].extend(risk_assessment['specific_warnings'])
            
            if medication_safety.get('safety_issues'):
                summary['primary_concerns'].extend(medication_safety['safety_issues'])
            
            # Add recommendations
            if risk_assessment.get('recommended_actions'):
                summary['key_recommendations'].extend(risk_assessment['recommended_actions'])
            
            summary['key_recommendations'].append("This is not a substitute for professional medical advice")
            summary['key_recommendations'].append("Always consult healthcare providers for serious symptoms")
            
            # When to seek help
            summary['when_to_seek_help'] = [
                "Symptoms worsen or don't improve as expected",
                "New severe symptoms develop", 
                "Signs of allergic reaction to medications",
                "Any symptoms that concern you"
            ]
            
            if risk_assessment.get('emergency_level', 0) >= 3:
                summary['when_to_seek_help'].insert(0, "Seek immediate medical attention")
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Safety summary generation error: {str(e)}")
            return {
                'overall_safety_level': 'UNKNOWN',
                'primary_concerns': ['Unable to complete safety assessment'],
                'action_required': True,
                'timeline': 'prompt',
                'key_recommendations': ['Consult healthcare provider'],
                'when_to_seek_help': ['For any health concerns'],
                'error': str(e)
            }