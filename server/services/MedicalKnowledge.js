// ── FILE: services/MedicalKnowledge.js ── Structured Medical Data for Triage Context
// Ported from CodeStorm's ml_engine.py

class MedicalKnowledge {
  constructor() {
    this.diseaseSymptoms = this._loadDiseaseSymptoms();
  }

  _loadDiseaseSymptoms() {
    return {
      'Common Cold': {
        symptoms: ['runny nose', 'sore throat', 'cough', 'sneezing', 'mild fever'],
        priorityTier: 'GREEN',
        department: 'General Medicine'
      },
      'Influenza': {
        symptoms: ['fever', 'cough', 'body aches', 'fatigue', 'headache', 'sore throat'],
        priorityTier: 'YELLOW',
        department: 'General Medicine'
      },
      'COVID-19': {
        symptoms: ['fever', 'cough', 'shortness of breath', 'fatigue', 'loss of taste', 'loss of smell'],
        priorityTier: 'YELLOW',
        department: 'General Medicine'
      },
      'Gastroenteritis': {
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
        priorityTier: 'YELLOW',
        department: 'General Medicine'
      },
      'Migraine': {
        symptoms: ['severe headache', 'nausea', 'sensitivity to light', 'sensitivity to sound'],
        priorityTier: 'YELLOW',
        department: 'Neurology'
      },
      'Hypertension': {
        symptoms: ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
        priorityTier: 'RED', // High risk
        department: 'Cardiology'
      },
      'Diabetes Type 2': {
        symptoms: ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision'],
        priorityTier: 'YELLOW',
        department: 'General Medicine' // Or Endocrinology if available
      },
      'Anxiety Disorder': {
        symptoms: ['restlessness', 'rapid heartbeat', 'sweating', 'difficulty concentrating'],
        priorityTier: 'GREEN',
        department: 'Psychiatry'
      },
      'Pneumonia': {
        symptoms: ['fever', 'cough', 'chest pain', 'shortness of breath', 'fatigue'],
        priorityTier: 'RED',
        department: 'General Medicine'
      },
      'Urinary Tract Infection': {
        symptoms: ['burning urination', 'frequent urination', 'cloudy urine', 'pelvic pain'],
        priorityTier: 'YELLOW',
        department: 'General Medicine' // Or Urology
      },
      'Allergic Reaction': {
        symptoms: ['skin rash', 'itching', 'swelling', 'difficulty breathing'],
        priorityTier: 'RED', // Could be anaphylaxis
        department: 'General Medicine'
      }
    };
  }

  /**
   * Generates a context string of structured medical knowledge to inject into the AI prompt
   */
  getTriageContextString() {
    let context = 'Structured Medical Knowledge Context (Use this to guide your assessment):\n';
    for (const [disease, info] of Object.entries(this.diseaseSymptoms)) {
      context += `- ${disease}: Symptoms include [${info.symptoms.join(', ')}]. Typical Priority: ${info.priorityTier}. Department: ${info.department}.\n`;
    }
    return context;
  }
}

module.exports = new MedicalKnowledge();
