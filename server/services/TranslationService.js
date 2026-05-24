// ── FILE: services/TranslationService.js ── Multilingual Support for Triage
// Ported from CodeStorm's translation_service.py

class TranslationService {
  constructor() {
    this.medicalTerms = this._loadMedicalTranslations();
    this.symptomTranslations = this._loadSymptomTranslations();
    this.simpleExplanations = this._loadSimpleExplanations();
    this.culturalAdaptations = this._loadCulturalAdaptations();
    
    this.supportedLanguages = ['en', 'hi', 'ta'];
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
      'ta': {
        'fever': 'காய்ச்சல்', 'headache': 'தலைவலி', 'nausea': 'குமட்டல்',
        'vomiting': 'வாந்தி', 'chest_pain': 'நெஞ்சுவலி',
        'shortness_of_breath': 'மூச்சுத் திணறல்'
      }
    };
  }

  _loadSymptomTranslations() {
    return {
      'en': { 'severe_pain': 'severe pain', 'mild_pain': 'mild pain' },
      'hi': { 'severe_pain': 'तेज दर्द', 'mild_pain': 'हल्का दर्द' },
      'ta': { 'severe_pain': 'கடும் வலி', 'mild_pain': 'லேசான வலி' }
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
      'ta': {
        'hypertension': 'உயர் இரத்த அழுத்தம் - இரத்த நாளங்களில் இரத்தம் கடினமாக அழுத்துவது',
        'diabetes': 'சர்க்கரை நோய் - உணவில் உள்ள சர்க்கரையை உடல் சரியாக பயன்படுத்த முடியாத நிலை'
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
      'ta': {
        'greeting': 'வணக்கம்',
        'local_emergency_numbers': { 'ambulance': '108', 'police': '100' },
        'common_home_remedies': { 'fever': 'நிறைய தண்ணீர் குடிக்கவும், ஓய்வெடுக்கவும்' }
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
      'ta': "இந்த மொழிபெயர்ப்பு உதவிக்காக மட்டுமே. முக்கியமான மருத்துவ முடிவுகளுக்கு மருத்துவரை அணுகவும்."
    };
    return notes[targetLanguage] || "This translation is for assistance. For important medical decisions, consult a healthcare provider.";
  }
}

module.exports = new TranslationService();
