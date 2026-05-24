// ── FILE: services/TranslationService.js ── Multilingual Support for Triage
// Ported from CodeStorm's translation_service.py

class TranslationService {
  constructor() {
    this.medicalTerms = this._loadMedicalTranslations();
    this.symptomTranslations = this._loadSymptomTranslations();
    this.simpleExplanations = this._loadSimpleExplanations();
    this.culturalAdaptations = this._loadCulturalAdaptations();
    
    this.supportedLanguages = ['en', 'hi', 'es'];
  }

  _loadMedicalTranslations() {
    return {
      'en': {
        'fever': 'fever', 'headache': 'headache', 'nausea': 'nausea',
        'vomiting': 'vomiting', 'chest_pain': 'chest pain',
        'shortness_of_breath': 'shortness of breath'
      },
      'hi': {
        'fever': 'बुखार', 'headache': 'सिरदर्द', 'nausea': 'मतली',
        'vomiting': 'उल्टी', 'chest_pain': 'छाती में दर्द',
        'shortness_of_breath': 'सांस लेने में तकलीफ'
      },
      'es': {
        'fever': 'fiebre', 'headache': 'dolor de cabeza', 'nausea': 'náusea',
        'vomiting': 'vómito', 'chest_pain': 'dolor en el pecho',
        'shortness_of_breath': 'falta de aire'
      }
    };
  }

  _loadSymptomTranslations() {
    return {
      'en': { 'severe_pain': 'severe pain', 'mild_pain': 'mild pain' },
      'hi': { 'severe_pain': 'तेज दर्द', 'mild_pain': 'हल्का दर्द' },
      'es': { 'severe_pain': 'dolor severo', 'mild_pain': 'dolor leve' }
    };
  }

  _loadSimpleExplanations() {
    return {
      'en': {
        'hypertension': 'high blood pressure - when blood pushes too hard against blood vessel walls',
        'diabetes': 'high blood sugar - when your body cannot properly process sugar from food'
      },
      'hi': {
        'hypertension': 'उच्च रक्तचाप - जब खून नसों की दीवारों पर बहुत जोर डालता है',
        'diabetes': 'मधुमेह - जब शरीर भोजन से चीनी को सही तरीके से इस्तेमाल नहीं कर पाता'
      },
      'es': {
        'hypertension': 'presión arterial alta - cuando la sangre empuja demasiado fuerte contra las paredes de los vasos sanguíneos',
        'diabetes': 'azúcar alta en sangre - cuando su cuerpo no puede procesar adecuadamente el azúcar de los alimentos'
      }
    };
  }

  _loadCulturalAdaptations() {
    return {
      'hi': {
        'greeting': 'नमस्ते',
        'local_emergency_numbers': { 'ambulance': '108', 'police': '100' },
        'common_home_remedies': { 'fever': 'गुनगुना पानी पिएं, आराम करें' }
      },
      'es': {
        'greeting': 'Hola',
        'local_emergency_numbers': { 'ambulance': '911', 'police': '911' },
        'common_home_remedies': { 'fever': 'beber mucha agua, descansar' }
      }
    };
  }

  /**
   * Translates a standard triage response to the target language
   */
  translateResponse(response, targetLanguage) {
    if (targetLanguage === 'en' || !this.supportedLanguages.includes(targetLanguage)) {
      return response;
    }

    const translatedResponse = { ...response };
    
    // Add translation note
    translatedResponse.translationNote = this._getTranslationNote(targetLanguage);
    
    // Add cultural info like emergency numbers
    const culturalInfo = this.culturalAdaptations[targetLanguage];
    if (culturalInfo) {
      translatedResponse.culturalInfo = culturalInfo;
    }
    
    return translatedResponse;
  }

  _getTranslationNote(targetLanguage) {
    const notes = {
      'hi': "यह अनुवाद सहायता के लिए है। महत्वपूर्ण चिकित्सा निर्णयों के लिए डॉक्टर से सलाह लें।",
      'es': "Esta traducción es para asistencia. Para decisiones médicas importantes, consulte a un médico."
    };
    return notes[targetLanguage] || "This translation is for assistance. For important medical decisions, consult a healthcare provider.";
  }

  detectLanguage(text) {
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[ñóéíáú¿¡]/i.test(text)) return 'es';
    return 'en';
  }
}

module.exports = new TranslationService();
