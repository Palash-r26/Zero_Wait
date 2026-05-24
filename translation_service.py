"""
Translation Service - Multilingual Support
Vortex 5 - AI Diagnostic Assistant

This module handles:
- Medical term translation
- Symptom simplification
- Multilingual response generation
- Cultural adaptation of medical advice
"""

import logging
from typing import Dict, List, Any, Optional
import json
import re

class TranslationService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Load translation dictionaries
        self.medical_terms = self._load_medical_translations()
        self.symptom_translations = self._load_symptom_translations()
        self.medication_translations = self._load_medication_translations()
        self.simple_explanations = self._load_simple_explanations()
        self.cultural_adaptations = self._load_cultural_adaptations()
        
        # Supported languages
        self.supported_languages = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'zh', 'ar']
    
    def _load_medical_translations(self) -> Dict[str, Dict[str, str]]:
        """Load medical term translations"""
        return {
            'en': {  # English (base)
                'fever': 'fever',
                'headache': 'headache',
                'nausea': 'nausea',
                'vomiting': 'vomiting',
                'diarrhea': 'diarrhea',
                'constipation': 'constipation',
                'fatigue': 'fatigue',
                'dizziness': 'dizziness',
                'chest_pain': 'chest pain',
                'shortness_of_breath': 'shortness of breath',
                'abdominal_pain': 'abdominal pain',
                'back_pain': 'back pain',
                'joint_pain': 'joint pain',
                'muscle_pain': 'muscle pain',
                'sore_throat': 'sore throat',
                'runny_nose': 'runny nose',
                'cough': 'cough',
                'skin_rash': 'skin rash'
            },
            'hi': {  # Hindi
                'fever': 'बुखार',
                'headache': 'सिरदर्द',
                'nausea': 'मतली',
                'vomiting': 'उल्टी',
                'diarrhea': 'दस्त',
                'constipation': 'कब्ज़',
                'fatigue': 'थकान',
                'dizziness': 'चक्कर आना',
                'chest_pain': 'छाती में दर्द',
                'shortness_of_breath': 'सांस लेने में तकलीफ',
                'abdominal_pain': 'पेट दर्द',
                'back_pain': 'कमर दर्द',
                'joint_pain': 'जोड़ों का दर्द',
                'muscle_pain': 'मांसपेशियों का दर्द',
                'sore_throat': 'गले में खराश',
                'runny_nose': 'नाक बहना',
                'cough': 'खांसी',
                'skin_rash': 'चकत्ते'
            },
            'es': {  # Spanish
                'fever': 'fiebre',
                'headache': 'dolor de cabeza',
                'nausea': 'náusea',
                'vomiting': 'vómito',
                'diarrhea': 'diarrea',
                'constipation': 'estreñimiento',
                'fatigue': 'fatiga',
                'dizziness': 'mareo',
                'chest_pain': 'dolor en el pecho',
                'shortness_of_breath': 'falta de aire',
                'abdominal_pain': 'dolor abdominal',
                'back_pain': 'dolor de espalda',
                'joint_pain': 'dolor articular',
                'muscle_pain': 'dolor muscular',
                'sore_throat': 'dolor de garganta',
                'runny_nose': 'secreción nasal',
                'cough': 'tos',
                'skin_rash': 'erupción cutánea'
            }
        }
    
    def _load_symptom_translations(self) -> Dict[str, Dict[str, str]]:
        """Load symptom description translations"""
        return {
            'en': {
                'mild_pain': 'mild pain',
                'moderate_pain': 'moderate pain', 
                'severe_pain': 'severe pain',
                'sharp_pain': 'sharp pain',
                'dull_pain': 'dull ache',
                'burning_pain': 'burning sensation',
                'throbbing_pain': 'throbbing pain',
                'intermittent': 'comes and goes',
                'constant': 'continuous',
                'worsening': 'getting worse',
                'improving': 'getting better'
            },
            'hi': {
                'mild_pain': 'हल्का दर्द',
                'moderate_pain': 'मध्यम दर्द',
                'severe_pain': 'तेज दर्द',
                'sharp_pain': 'तीखा दर्द',
                'dull_pain': 'मंद दर्द',
                'burning_pain': 'जलन',
                'throbbing_pain': 'धड़कता दर्द',
                'intermittent': 'कभी कभी',
                'constant': 'लगातार',
                'worsening': 'बढ़ता जा रहा',
                'improving': 'ठीक हो रहा'
            },
            'es': {
                'mild_pain': 'dolor leve',
                'moderate_pain': 'dolor moderado',
                'severe_pain': 'dolor severo',
                'sharp_pain': 'dolor agudo',
                'dull_pain': 'dolor sordo',
                'burning_pain': 'sensación de quemadura',
                'throbbing_pain': 'dolor pulsátil',
                'intermittent': 'intermitente',
                'constant': 'constante',
                'worsening': 'empeorando',
                'improving': 'mejorando'
            }
        }
    
    def _load_medication_translations(self) -> Dict[str, Dict[str, str]]:
        """Load medication name translations"""
        return {
            'en': {
                'paracetamol': 'Paracetamol (Acetaminophen)',
                'ibuprofen': 'Ibuprofen',
                'aspirin': 'Aspirin',
                'cetirizine': 'Cetirizine',
                'loratadine': 'Loratadine',
                'omeprazole': 'Omeprazole',
                'metformin': 'Metformin',
                'amlodipine': 'Amlodipine'
            },
            'hi': {
                'paracetamol': 'पैरासिटामोल',
                'ibuprofen': 'इबुप्रोफेन',
                'aspirin': 'एस्पिरिन',
                'cetirizine': 'सेटिरिज़िन',
                'loratadine': 'लॉराटाडीन',
                'omeprazole': 'ओमेप्राज़ोल',
                'metformin': 'मेटफॉर्मिन',
                'amlodipine': 'एम्लोडिपीन'
            },
            'es': {
                'paracetamol': 'Paracetamol',
                'ibuprofen': 'Ibuprofeno',
                'aspirin': 'Aspirina',
                'cetirizine': 'Cetirizina',
                'loratadine': 'Loratadina',
                'omeprazole': 'Omeprazol',
                'metformin': 'Metformina',
                'amlodipine': 'Amlodipino'
            }
        }
    
    def _load_simple_explanations(self) -> Dict[str, Dict[str, str]]:
        """Load simple explanations for medical terms"""
        return {
            'en': {
                'hypertension': 'high blood pressure - when blood pushes too hard against blood vessel walls',
                'diabetes': 'high blood sugar - when your body cannot properly process sugar from food',
                'pneumonia': 'lung infection - germs cause swelling and fluid in the lungs',
                'gastroenteritis': 'stomach bug - infection causing stomach upset and diarrhea',
                'migraine': 'severe headache - intense head pain often with nausea and light sensitivity',
                'anxiety': 'feeling very worried or nervous about things',
                'depression': 'feeling very sad or hopeless for a long time',
                'allergic_reaction': 'your body fighting against something it thinks is harmful',
                'urinary_tract_infection': 'infection in the system that makes and stores urine',
                'common_cold': 'viral infection that affects your nose and throat'
            },
            'hi': {
                'hypertension': 'उच्च रक्तचाप - जब खून नसों की दीवारों पर बहुत जोर डालता है',
                'diabetes': 'मधुमेह - जब शरीर भोजन से चीनी को सही तरीके से इस्तेमाल नहीं कर पाता',
                'pneumonia': 'फेफड़ों का संक्रमण - कीटाणु फेफड़ों में सूजन और तरल पदार्थ का कारण बनते हैं',
                'gastroenteritis': 'पेट की खराबी - संक्रमण जो पेट में परेशानी और दस्त का कारण बनता है',
                'migraine': 'तेज़ सिरदर्द - जिसमें मतली और रोशनी से परेशानी होती है',
                'anxiety': 'चीज़ों को लेकर बहुत चिंता या घबराहट महसूस करना',
                'depression': 'लंबे समय तक बहुत उदास या निराश महसूस करना',
                'allergic_reaction': 'आपका शरीर किसी चीज़ से लड़ रहा है जिसे वह हानिकारक समझता है',
                'urinary_tract_infection': 'पेशाब बनाने और स्टोर करने वाली प्रणाली में संक्रमण',
                'common_cold': 'वायरल संक्रमण जो आपकी नाक और गले को प्रभावित करता है'
            },
            'es': {
                'hypertension': 'presión arterial alta - cuando la sangre empuja demasiado fuerte contra las paredes de los vasos sanguíneos',
                'diabetes': 'azúcar alta en sangre - cuando su cuerpo no puede procesar adecuadamente el azúcar de los alimentos',
                'pneumonia': 'infección pulmonar - los gérmenes causan inflamación y líquido en los pulmones',
                'gastroenteritis': 'infección estomacal - infección que causa malestar estomacal y diarrea',
                'migraine': 'dolor de cabeza severo - dolor intenso de cabeza a menudo con náuseas y sensibilidad a la luz',
                'anxiety': 'sentirse muy preocupado o nervioso por las cosas',
                'depression': 'sentirse muy triste o sin esperanza durante mucho tiempo',
                'allergic_reaction': 'su cuerpo luchando contra algo que cree que es dañino',
                'urinary_tract_infection': 'infección en el sistema que produce y almacena orina',
                'common_cold': 'infección viral que afecta su nariz y garganta'
            }
        }
    
    def _load_cultural_adaptations(self) -> Dict[str, Dict[str, Any]]:
        """Load cultural adaptations for different regions"""
        return {
            'hi': {  # Indian/Hindi context
                'greeting': 'नमस्ते',
                'polite_address': 'आप',
                'cultural_considerations': [
                    'Consider traditional remedies alongside modern medicine',
                    'Family involvement in health decisions is common',
                    'Religious/cultural dietary restrictions may affect medication timing'
                ],
                'local_emergency_numbers': {
                    'ambulance': '108',
                    'police': '100',
                    'fire': '101'
                },
                'common_home_remedies': {
                    'fever': 'गुनगुना पानी पिएं, आराम करें',
                    'cough': 'शहद और गुनगुना पानी',
                    'sore_throat': 'नमक के पानी से गरारे करें'
                }
            },
            'es': {  # Spanish context
                'greeting': 'Hola',
                'polite_address': 'Usted',
                'cultural_considerations': [
                    'Family support systems are very important',
                    'Religious beliefs may influence health decisions',
                    'Traditional remedies are often used alongside modern medicine'
                ],
                'local_emergency_numbers': {
                    'ambulance': '911',
                    'police': '911',
                    'fire': '911'
                },
                'common_home_remedies': {
                    'fever': 'beber mucha agua, descansar',
                    'cough': 'miel y agua tibia',
                    'sore_throat': 'gárgaras con agua salada'
                }
            }
        }
    
    def translate_response(self, response_data: Dict, target_language: str) -> Dict[str, Any]:
        """Translate complete response to target language"""
        try:
            if target_language == 'en' or target_language not in self.supported_languages:
                return response_data
            
            translated_response = response_data.copy()
            
            # Translate disease predictions
            if 'predictions' in translated_response:
                translated_response['predictions'] = self._translate_predictions(
                    response_data['predictions'], target_language
                )
            
            # Translate medications
            if 'medications' in translated_response:
                translated_response['medications'] = self._translate_medications(
                    response_data['medications'], target_language
                )
            
            # Translate safety information
            if 'safety' in translated_response:
                translated_response['safety'] = self._translate_safety_info(
                    response_data['safety'], target_language
                )
            
            # Translate reasoning
            if 'reasoning' in translated_response:
                translated_response['reasoning'] = self._translate_text(
                    response_data['reasoning'], target_language
                )
            
            # Add cultural adaptations
            cultural_info = self.cultural_adaptations.get(target_language, {})
            if cultural_info:
                translated_response['cultural_info'] = cultural_info
            
            translated_response['language'] = target_language
            translated_response['translation_note'] = self._get_translation_note(target_language)
            
            return translated_response
            
        except Exception as e:
            self.logger.error(f"Translation error: {str(e)}")
            # Return original response with error note
            response_data['translation_error'] = f"Translation to {target_language} failed"
            return response_data
    
    def _translate_predictions(self, predictions: List[Dict], target_language: str) -> List[Dict]:
        """Translate disease predictions"""
        translated_predictions = []
        
        for prediction in predictions:
            translated_pred = prediction.copy()
            
            # Translate disease name to simple explanation
            disease_name = prediction['name'].lower().replace(' ', '_')
            if disease_name in self.simple_explanations.get(target_language, {}):
                translated_pred['simple_explanation'] = self.simple_explanations[target_language][disease_name]
            
            # Translate reasoning
            if 'reasoning' in translated_pred:
                translated_pred['reasoning'] = self._translate_text(
                    translated_pred['reasoning'], target_language
                )
            
            # Translate matching symptoms
            if 'matching_symptoms' in translated_pred:
                translated_symptoms = []
                for symptom in translated_pred['matching_symptoms']:
                    symptom_key = symptom.lower().replace(' ', '_')
                    if symptom_key in self.medical_terms.get(target_language, {}):
                        translated_symptoms.append(self.medical_terms[target_language][symptom_key])
                    else:
                        translated_symptoms.append(symptom)
                translated_pred['matching_symptoms'] = translated_symptoms
            
            translated_predictions.append(translated_pred)
        
        return translated_predictions
    
    def _translate_medications(self, medications: List[Dict], target_language: str) -> List[Dict]:
        """Translate medication information"""
        translated_meds = []
        
        for medication in medications:
            translated_med = medication.copy()
            
            # Translate medication name
            med_name = medication['name'].lower()
            if med_name in self.medication_translations.get(target_language, {}):
                translated_med['local_name'] = self.medication_translations[target_language][med_name]
            
            # Translate instructions
            if 'instructions' in medication:
                translated_instructions = []
                for instruction in medication['instructions']:
                    translated_instructions.append(self._translate_text(instruction, target_language))
                translated_med['instructions'] = translated_instructions
            
            # Translate side effects
            if 'side_effects' in medication:
                translated_side_effects = []
                for side_effect in medication['side_effects']:
                    translated_side_effects.append(self._translate_text(side_effect, target_language))
                translated_med['side_effects'] = translated_side_effects
            
            # Translate precautions
            if 'precautions' in medication:
                translated_precautions = []
                for precaution in medication['precautions']:
                    translated_precautions.append(self._translate_text(precaution, target_language))
                translated_med['precautions'] = translated_precautions
            
            # Add local dosing considerations
            translated_med['dosing_notes'] = self._get_local_dosing_notes(medication, target_language)
            
            translated_meds.append(translated_med)
        
        return translated_meds
    
    def _translate_safety_info(self, safety_info: Dict, target_language: str) -> Dict:
        """Translate safety information"""
        translated_safety = safety_info.copy()
        
        # Translate warnings
        if 'specific_warnings' in safety_info:
            translated_warnings = []
            for warning in safety_info['specific_warnings']:
                translated_warnings.append(self._translate_text(warning, target_language))
            translated_safety['specific_warnings'] = translated_warnings
        
        # Translate recommended actions
        if 'recommended_actions' in safety_info:
            translated_actions = []
            for action in safety_info['recommended_actions']:
                translated_actions.append(self._translate_text(action, target_language))
            translated_safety['recommended_actions'] = translated_actions
        
        # Translate reasoning
        if 'reasoning' in safety_info:
            translated_safety['reasoning'] = self._translate_text(
                safety_info['reasoning'], target_language
            )
        
        # Add local emergency contacts if available
        cultural_info = self.cultural_adaptations.get(target_language, {})
        if 'local_emergency_numbers' in cultural_info:
            translated_safety['local_emergency_contacts'] = cultural_info['local_emergency_numbers']
        
        return translated_safety
    
    def _translate_text(self, text: str, target_language: str) -> str:
        """Translate general text (simplified version)"""
        # This is a simplified translation function
        # In a real system, you would use proper translation APIs like Google Translate
        
        if target_language == 'hi':
            return self._simple_hindi_translation(text)
        elif target_language == 'es':
            return self._simple_spanish_translation(text)
        else:
            return text  # Return original if translation not available
    
    def _simple_hindi_translation(self, text: str) -> str:
        """Simple Hindi translation for common medical phrases"""
        translation_map = {
            'seek medical attention': 'चिकित्सा सहायता लें',
            'consult doctor': 'डॉक्टर से सलाह लें',
            'take medication': 'दवाई लें',
            'rest and hydration': 'आराम करें और पानी पिएं',
            'monitor symptoms': 'लक्षणों पर नज़र रखें',
            'if symptoms worsen': 'यदि लक्षण बढ़ें',
            'emergency': 'आपातकाल',
            'severe': 'गंभीर',
            'mild': 'हल्का',
            'moderate': 'मध्यम'
        }
        
        translated_text = text.lower()
        for english, hindi in translation_map.items():
            translated_text = translated_text.replace(english, hindi)
        
        return translated_text
    
    def _simple_spanish_translation(self, text: str) -> str:
        """Simple Spanish translation for common medical phrases"""
        translation_map = {
            'seek medical attention': 'buscar atención médica',
            'consult doctor': 'consultar al médico',
            'take medication': 'tomar medicamento',
            'rest and hydration': 'descansar e hidratarse',
            'monitor symptoms': 'monitorear síntomas',
            'if symptoms worsen': 'si los síntomas empeoran',
            'emergency': 'emergencia',
            'severe': 'severo',
            'mild': 'leve',
            'moderate': 'moderado'
        }
        
        translated_text = text.lower()
        for english, spanish in translation_map.items():
            translated_text = translated_text.replace(english, spanish)
        
        return translated_text
    
    def _get_local_dosing_notes(self, medication: Dict, target_language: str) -> str:
        """Get local dosing considerations"""
        cultural_info = self.cultural_adaptations.get(target_language, {})
        
        notes = []
        
        if target_language == 'hi':
            notes.append("भोजन के साथ या बाद में लें यदि पेट में समस्या हो")
            notes.append("दवा की दुकान से सलाह लें")
            if 'cultural_considerations' in cultural_info:
                notes.extend(cultural_info['cultural_considerations'])
        
        elif target_language == 'es':
            notes.append("Tomar con alimentos si causa malestar estomacal")
            notes.append("Consulte con el farmacéutico")
        
        return '; '.join(notes) if notes else ""
    
    def _get_translation_note(self, target_language: str) -> str:
        """Get translation disclaimer"""
        notes = {
            'hi': "यह अनुवाद सहायता के लिए है। महत्वपूर्ण चिकित्सा निर्णयों के लिए डॉक्टर से सलाह लें।",
            'es': "Esta traducción es para asistencia. Para decisiones médicas importantes, consulte a un médico.",
            'fr': "Cette traduction est pour assistance. Pour des décisions médicales importantes, consultez un médecin.",
            'de': "Diese Übersetzung dient der Unterstützung. Konsultieren Sie für wichtige medizinische Entscheidungen einen Arzt.",
            'pt': "Esta tradução é para assistência. Para decisões médicas importantes, consulte um médico.",
            'zh': "此翻译仅供参考。重要医疗决定请咨询医生。",
            'ar': "هذه الترجمة للمساعدة. استشر طبيباً للقرارات الطبية المهمة."
        }
        
        return notes.get(target_language, "This translation is for assistance. For important medical decisions, consult a healthcare provider.")
    
    def translate_and_simplify(self, text: str, target_language: str, make_simple: bool = True) -> str:
        """Translate and simplify medical text for patients"""
        try:
            # First, simplify medical terms if requested
            if make_simple:
                text = self._simplify_medical_terms(text, target_language)
            
            # Then translate
            translated_text = self._translate_text(text, target_language)
            
            return translated_text
            
        except Exception as e:
            self.logger.error(f"Translation and simplification error: {str(e)}")
            return f"Translation failed: {text}"
    
    def _simplify_medical_terms(self, text: str, language: str) -> str:
        """Replace complex medical terms with simple explanations"""
        simple_explanations = self.simple_explanations.get(language, self.simple_explanations['en'])
        
        # Replace medical terms with simple explanations
        simplified_text = text.lower()
        
        for medical_term, simple_explanation in simple_explanations.items():
            # Replace the medical term with the simple explanation
            pattern = medical_term.replace('_', r'[\s_]')
            simplified_text = re.sub(pattern, simple_explanation, simplified_text, flags=re.IGNORECASE)
        
        return simplified_text
    
    def get_language_specific_recommendations(self, predictions: List[Dict], target_language: str) -> List[str]:
        """Get language and culture specific health recommendations"""
        cultural_info = self.cultural_adaptations.get(target_language, {})
        recommendations = []
        
        # Add cultural considerations
        if 'cultural_considerations' in cultural_info:
            recommendations.extend(cultural_info['cultural_considerations'])
        
        # Add home remedies if appropriate
        if 'common_home_remedies' in cultural_info:
            home_remedies = cultural_info['common_home_remedies']
            for prediction in predictions:
                disease_name = prediction['name'].lower()
                for symptom, remedy in home_remedies.items():
                    if symptom in disease_name or any(symptom in match for match in prediction.get('matching_symptoms', [])):
                        if target_language == 'hi':
                            recommendations.append(f"घरेलू उपाय: {remedy}")
                        elif target_language == 'es':
                            recommendations.append(f"Remedio casero: {remedy}")
                        else:
                            recommendations.append(f"Home remedy: {remedy}")
        
        # Add language-specific health tips
        if target_language == 'hi':
            recommendations.extend([
                "पर्याप्त पानी पिएं",
                "आराम करें और तनाव से बचें",
                "यदि समस्या बनी रहे तो डॉक्टर से मिलें"
            ])
        elif target_language == 'es':
            recommendations.extend([
                "Beba suficiente agua",
                "Descanse y evite el estrés",
                "Consulte a un médico si los problemas persisten"
            ])
        
        return recommendations
    
    def detect_language(self, text: str) -> str:
        """Simple language detection (placeholder - in real system use proper language detection)"""
        # Simple heuristic based on character patterns
        
        # Check for Devanagari script (Hindi)
        if re.search(r'[\u0900-\u097F]', text):
            return 'hi'
        
        # Check for Spanish patterns
        spanish_indicators = ['ñ', 'ó', 'é', 'í', 'á', 'ú', '¿', '¡']
        if any(indicator in text.lower() for indicator in spanish_indicators):
            return 'es'
        
        # Check for French patterns
        french_indicators = ['ç', 'è', 'é', 'à', 'ù', 'ê', 'ô', 'î', 'â']
        if any(indicator in text.lower() for indicator in french_indicators):
            return 'fr'
        
        # Default to English
        return 'en'
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages"""
        language_names = {
            'en': 'English',
            'hi': 'हिन्दी (Hindi)',
            'es': 'Español (Spanish)',
            'fr': 'Français (French)',
            'de': 'Deutsch (German)',
            'pt': 'Português (Portuguese)',
            'zh': '中文 (Chinese)',
            'ar': 'العربية (Arabic)'
        }
        return [
            {'code': lang_code, 'name': language_names[lang_code]}
            for lang_code in self.supported_languages
        ]
        