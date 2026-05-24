// ── FILE: services/SafetyChecker.js ── Hardcoded Safety Guardrails for Triage
// Ported from CodeStorm's safety_checker.py

class SafetyChecker {
  constructor() {
    this.emergencySymptoms = this._loadEmergencySymptoms();
  }

  _loadEmergencySymptoms() {
    return {
      cardiac_emergency: {
        keywords: [
          'severe chest pain', 'crushing chest pain', 'chest pressure',
          'left arm pain', 'jaw pain', 'heart attack', 'cardiac arrest'
        ],
        priorityTier: 'RED',
        department: 'Cardiology',
        action: 'Call emergency services immediately or rush to ER.',
      },
      stroke: {
        keywords: [
          'sudden weakness', 'facial drooping', 'slurred speech',
          'sudden confusion', 'sudden vision loss', 'sudden severe headache',
          'loss of balance', 'stroke symptoms', 'paralysis'
        ],
        priorityTier: 'RED',
        department: 'Neurology',
        action: 'Call emergency services immediately.',
      },
      respiratory_failure: {
        keywords: [
          'severe difficulty breathing', 'cannot breathe', 'gasping for air',
          'blue lips', 'respiratory distress', 'choking', 'severe asthma'
        ],
        priorityTier: 'RED',
        department: 'General Medicine',
        action: 'Seek immediate emergency care.',
      },
      severe_allergic_reaction: {
        keywords: [
          'severe allergic reaction', 'anaphylaxis', 'swelling of face',
          'swelling of throat', 'difficulty swallowing', 'hives with breathing difficulty'
        ],
        priorityTier: 'RED',
        department: 'General Medicine',
        action: 'Administer EpiPen if available and seek immediate emergency care.',
      },
      severe_bleeding: {
        keywords: [
          'severe bleeding', 'heavy bleeding', 'uncontrolled bleeding',
          'blood loss', 'hemorrhage', 'bleeding that won\'t stop'
        ],
        priorityTier: 'RED',
        department: 'Orthopedics', // Or General Surgery
        action: 'Apply pressure and seek immediate emergency care.',
      },
      severe_neurological: {
        keywords: [
          'seizure', 'convulsions', 'severe headache with fever',
          'stiff neck with fever', 'severe confusion', 'delirium'
        ],
        priorityTier: 'RED',
        department: 'Neurology',
        action: 'Seek immediate medical attention.',
      },
      severe_abdominal: {
        keywords: [
          'severe abdominal pain', 'excruciating stomach pain',
          'rigid abdomen', 'vomiting blood', 'appendicitis'
        ],
        priorityTier: 'RED', // High risk, pushing to RED for safety
        department: 'General Medicine',
        action: 'Seek immediate medical attention.',
      },
      high_fever: {
        keywords: [
          'fever over 104', 'very high fever', 'hyperthermia'
        ],
        priorityTier: 'YELLOW',
        department: 'General Medicine',
        action: 'Seek prompt medical attention.',
      }
    };
  }

  /**
   * Analyzes the chat history to detect emergency symptoms.
   * @param {string} chatText - The full text of the patient's described symptoms.
   * @returns {Object|null} - Returns an emergency override object if detected, else null.
   */
  assessRisk(chatText) {
    const text = chatText.toLowerCase();

    for (const [emergencyType, info] of Object.entries(this.emergencySymptoms)) {
      for (const keyword of info.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return {
            isEmergency: true,
            emergencyType,
            matchedKeyword: keyword,
            priorityTier: info.priorityTier,
            department: info.department,
            reasoning: `CRITICAL SAFETY OVERRIDE: Patient reported '${keyword}', indicating a possible ${emergencyType.replace('_', ' ')}. ${info.action}`,
          };
        }
      }
    }

    return { isEmergency: false };
  }
}

module.exports = new SafetyChecker();
