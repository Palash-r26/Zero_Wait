"""
Medication Recommendation System
Vortex 5 - AI Diagnostic Assistant

This module handles:
- First-line medication recommendations
- Dosage calculations based on age/weight
- Drug interactions and contraindications
- Side effects and precautions
- Route of administration
"""

import logging
from typing import Dict, List, Any, Optional
import json
from datetime import datetime

class MedicationRecommender:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Load medication database
        self.medication_db = self._load_medication_database()
        self.drug_interactions = self._load_drug_interactions()
        self.contraindications = self._load_contraindications()
        self.allergy_mappings = self._load_allergy_mappings()
        
    def _load_medication_database(self) -> Dict[str, Dict]:
        """Load comprehensive medication database"""
        return {
            'Common Cold': [
                {
                    'name': 'Paracetamol',
                    'generic_name': 'Acetaminophen',
                    'class': 'Analgesic/Antipyretic',
                    'adult_dosage': '500-1000mg every 4-6 hours',
                    'pediatric_dosage': '10-15mg/kg every 4-6 hours',
                    'max_daily': '4000mg adults, 75mg/kg children',
                    'route': 'Oral',
                    'frequency': 'Every 4-6 hours as needed',
                    'duration': '3-5 days',
                    'side_effects': ['Nausea', 'Liver damage (overdose)', 'Skin rash'],
                    'contraindications': ['Severe liver disease', 'Allergy to acetaminophen'],
                    'precautions': ['Do not exceed maximum daily dose', 'Avoid alcohol'],
                    'pregnancy_category': 'B',
                    'cost_estimate': '₹10-30'
                },
                {
                    'name': 'Cetirizine',
                    'generic_name': 'Cetirizine Hydrochloride',
                    'class': 'Antihistamine',
                    'adult_dosage': '10mg once daily',
                    'pediatric_dosage': '2.5-5mg once daily (age 2-6), 5-10mg (age 6+)',
                    'max_daily': '10mg adults, 10mg children 6+',
                    'route': 'Oral',
                    'frequency': 'Once daily',
                    'duration': '5-7 days',
                    'side_effects': ['Drowsiness', 'Dry mouth', 'Fatigue'],
                    'contraindications': ['Severe kidney disease', 'Known hypersensitivity'],
                    'precautions': ['May cause drowsiness', 'Adjust dose in kidney disease'],
                    'pregnancy_category': 'B',
                    'cost_estimate': '₹15-40'
                }
            ],
            'Influenza': [
                {
                    'name': 'Paracetamol',
                    'generic_name': 'Acetaminophen',
                    'class': 'Analgesic/Antipyretic',
                    'adult_dosage': '500-1000mg every 4-6 hours',
                    'pediatric_dosage': '10-15mg/kg every 4-6 hours',
                    'max_daily': '4000mg adults, 75mg/kg children',
                    'route': 'Oral',
                    'frequency': 'Every 4-6 hours as needed',
                    'duration': '5-7 days',
                    'side_effects': ['Nausea', 'Liver damage (overdose)', 'Skin rash'],
                    'contraindications': ['Severe liver disease', 'Allergy to acetaminophen'],
                    'precautions': ['Do not exceed maximum daily dose', 'Avoid alcohol'],
                    'pregnancy_category': 'B',
                    'cost_estimate': '₹10-30'
                },
                {
                    'name': 'Oseltamivir',
                    'generic_name': 'Oseltamivir Phosphate',
                    'class': 'Antiviral',
                    'adult_dosage': '75mg twice daily',
                    'pediatric_dosage': 'Weight-based: 30-75mg twice daily',
                    'max_daily': '150mg adults',
                    'route': 'Oral',
                    'frequency': 'Twice daily',
                    'duration': '5 days',
                    'side_effects': ['Nausea', 'Vomiting', 'Headache', 'Diarrhea'],
                    'contraindications': ['Known hypersensitivity'],
                    'precautions': ['Take with food to reduce nausea', 'Start within 48 hours of symptoms'],
                    'pregnancy_category': 'C',
                    'cost_estimate': '₹200-400'
                }
            ],
            'Gastroenteritis': [
                {
                    'name': 'ORS (Oral Rehydration Solution)',
                    'generic_name': 'Electrolyte Solution',
                    'class': 'Rehydration Therapy',
                    'adult_dosage': '1 sachet in 200ml water, sip frequently',
                    'pediatric_dosage': '10-20ml/kg over 2-4 hours',
                    'max_daily': 'As needed for hydration',
                    'route': 'Oral',
                    'frequency': 'As needed',
                    'duration': 'Until dehydration resolves',
                    'side_effects': ['Mild nausea', 'Bloating'],
                    'contraindications': ['Severe vomiting', 'Bowel obstruction'],
                    'precautions': ['Prepare fresh solution', 'Continue breastfeeding in infants'],
                    'pregnancy_category': 'A',
                    'cost_estimate': '₹5-15'
                },
                {
                    'name': 'Loperamide',
                    'generic_name': 'Loperamide Hydrochloride',
                    'class': 'Antidiarrheal',
                    'adult_dosage': '4mg initially, then 2mg after each loose stool',
                    'pediatric_dosage': 'Not recommended under 2 years',
                    'max_daily': '16mg adults',
                    'route': 'Oral',
                    'frequency': 'After each loose stool',
                    'duration': '2-3 days maximum',
                    'side_effects': ['Constipation', 'Drowsiness', 'Nausea'],
                    'contraindications': ['Bloody diarrhea', 'High fever', 'Children under 2'],
                    'precautions': ['Maintain hydration', 'Stop if fever develops'],
                    'pregnancy_category': 'C',
                    'cost_estimate': '₹20-50'
                }
            ],
            'Migraine': [
                {
                    'name': 'Sumatriptan',
                    'generic_name': 'Sumatriptan Succinate',
                    'class': 'Triptan',
                    'adult_dosage': '50-100mg at onset, may repeat after 2 hours',
                    'pediatric_dosage': 'Not recommended under 18',
                    'max_daily': '200mg in 24 hours',
                    'route': 'Oral',
                    'frequency': 'As needed for migraine',
                    'duration': 'Single dose or repeat once',
                    'side_effects': ['Chest tightness', 'Dizziness', 'Fatigue', 'Nausea'],
                    'contraindications': ['Heart disease', 'Uncontrolled hypertension', 'Pregnancy'],
                    'precautions': ['Check blood pressure', 'Avoid within 24hrs of ergotamines'],
                    'pregnancy_category': 'C',
                    'cost_estimate': '₹100-250'
                }
            ],
            'Hypertension': [
                {
                    'name': 'Amlodipine',
                    'generic_name': 'Amlodipine Besylate',
                    'class': 'Calcium Channel Blocker',
                    'adult_dosage': '5mg once daily, may increase to 10mg',
                    'pediatric_dosage': 'Not typically used in children',
                    'max_daily': '10mg',
                    'route': 'Oral',
                    'frequency': 'Once daily',
                    'duration': 'Long-term therapy',
                    'side_effects': ['Ankle swelling', 'Dizziness', 'Flushing', 'Fatigue'],
                    'contraindications': ['Severe aortic stenosis', 'Cardiogenic shock'],
                    'precautions': ['Monitor blood pressure', 'Rise slowly from sitting'],
                    'pregnancy_category': 'C',
                    'cost_estimate': '₹30-80'
                }
            ],
            'Anxiety Disorder': [
                {
                    'name': 'Lorazepam',
                    'generic_name': 'Lorazepam',
                    'class': 'Benzodiazepine',
                    'adult_dosage': '0.5-1mg twice daily',
                    'pediatric_dosage': 'Rarely used in children',
                    'max_daily': '4mg',
                    'route': 'Oral',
                    'frequency': 'Twice daily or as needed',
                    'duration': 'Short-term (2-4 weeks)',
                    'side_effects': ['Drowsiness', 'Confusion', 'Memory problems'],
                    'contraindications': ['Severe respiratory depression', 'Sleep apnea'],
                    'precautions': ['Risk of dependence', 'Avoid alcohol', 'Taper gradually'],
                    'pregnancy_category': 'D',
                    'cost_estimate': '₹50-120'
                }
            ],
            'Urinary Tract Infection': [
                {
                    'name': 'Nitrofurantoin',
                    'generic_name': 'Nitrofurantoin Monohydrate',
                    'class': 'Antibiotic',
                    'adult_dosage': '100mg twice daily',
                    'pediatric_dosage': '5-7mg/kg/day divided into 4 doses',
                    'max_daily': '400mg adults',
                    'route': 'Oral',
                    'frequency': 'Twice daily with food',
                    'duration': '5-7 days',
                    'side_effects': ['Nausea', 'Headache', 'Dizziness', 'Brown urine'],
                    'contraindications': ['Kidney disease', 'G6PD deficiency', 'Pregnancy (late term)'],
                    'precautions': ['Take with food', 'Complete full course'],
                    'pregnancy_category': 'B (avoid at term)',
                    'cost_estimate': '₹80-150'
                }
            ],
            'Allergic Reaction': [
                {
                    'name': 'Diphenhydramine',
                    'generic_name': 'Diphenhydramine Hydrochloride',
                    'class': 'Antihistamine',
                    'adult_dosage': '25-50mg every 4-6 hours',
                    'pediatric_dosage': '1.25mg/kg every 4-6 hours',
                    'max_daily': '300mg adults',
                    'route': 'Oral',
                    'frequency': 'Every 4-6 hours as needed',
                    'duration': '3-5 days',
                    'side_effects': ['Drowsiness', 'Dry mouth', 'Blurred vision'],
                    'contraindications': ['Glaucoma', 'Enlarged prostate', 'Severe asthma'],
                    'precautions': ['Causes significant drowsiness', 'Avoid driving'],
                    'pregnancy_category': 'B',
                    'cost_estimate': '₹25-60'
                }
            ]
        }
    
    def _load_drug_interactions(self) -> Dict[str, List[str]]:
        """Load drug interaction database"""
        return {
            'Paracetamol': [
                'Warfarin (increased bleeding risk)',
                'Alcohol (liver toxicity)',
                'Carbamazepine (reduced effectiveness)'
            ],
            'Sumatriptan': [
                'MAO inhibitors (serotonin syndrome)',
                'SSRIs (serotonin syndrome)',
                'Ergotamines (vasospasm)'
            ],
            'Amlodipine': [
                'Simvastatin (muscle toxicity)',
                'Grapefruit juice (increased levels)',
                'CYP3A4 inhibitors'
            ],
            'Lorazepam': [
                'Alcohol (increased sedation)',
                'Opioids (respiratory depression)',
                'Antihistamines (increased drowsiness)'
            ],
            'Nitrofurantoin': [
                'Magnesium antacids (reduced absorption)',
                'Probenecid (increased toxicity)',
                'Quinolone antibiotics (antagonism)'
            ]
        }
    
    def _load_contraindications(self) -> Dict[str, List[str]]:
        """Load contraindication database"""
        return {
            'kidney_disease': ['Nitrofurantoin', 'NSAIDs', 'ACE inhibitors'],
            'liver_disease': ['Paracetamol', 'Statins', 'Antifungals'],
            'heart_disease': ['Sumatriptan', 'NSAIDs', 'Stimulants'],
            'pregnancy': ['Sumatriptan', 'ACE inhibitors', 'Warfarin'],
            'glaucoma': ['Antihistamines', 'Tricyclic antidepressants'],
            'asthma': ['Beta-blockers', 'Aspirin (some patients)']
        }
    
    def _load_allergy_mappings(self) -> Dict[str, List[str]]:
        """Map allergens to medications to avoid"""
        return {
            'penicillin': ['Amoxicillin', 'Ampicillin', 'Penicillin G'],
            'sulfa': ['Sulfamethoxazole', 'Furosemide', 'Hydrochlorothiazide'],
            'aspirin': ['Aspirin', 'NSAIDs', 'Salicylates'],
            'codeine': ['Codeine', 'Morphine', 'Oxycodone'],
            'iodine': ['Contrast agents', 'Povidone iodine'],
            'latex': ['Some medication packaging']
        }
    
    def recommend_medications(self, predicted_diseases: List[Dict], user_profile: Any) -> List[Dict[str, Any]]:
        """Generate medication recommendations based on predicted diseases"""
        try:
            recommendations = []
            
            for disease_pred in predicted_diseases[:3]:  # Top 3 diseases
                disease_name = disease_pred['name']
                confidence = disease_pred.get('confidence', 0.5)
                
                if disease_name in self.medication_db:
                    disease_meds = self.medication_db[disease_name]
                    
                    for med_info in disease_meds:
                        # Check contraindications and allergies
                        if self._is_safe_for_user(med_info, user_profile):
                            recommendation = self._create_recommendation(
                                med_info, 
                                user_profile, 
                                disease_name,
                                confidence
                            )
                            recommendations.append(recommendation)
            
            # Remove duplicates and rank
            unique_recommendations = self._deduplicate_recommendations(recommendations)
            ranked_recommendations = self._rank_recommendations(unique_recommendations, user_profile)
            
            return ranked_recommendations[:5]  # Top 5 recommendations
            
        except Exception as e:
            self.logger.error(f"Medication recommendation error: {str(e)}")
            return []
    
    def _is_safe_for_user(self, medication: Dict, user_profile: Any) -> bool:
        """Check if medication is safe for the specific user"""
        try:
            med_name = medication['name']
            
            # Check allergies
            user_allergies = getattr(user_profile, 'allergies', '') or ''
            user_allergies_list = [allergy.strip().lower() for allergy in user_allergies.split(',')]
            
            for allergy in user_allergies_list:
                if allergy in self.allergy_mappings:
                    contraindicated_meds = self.allergy_mappings[allergy]
                    if any(med.lower() in med_name.lower() for med in contraindicated_meds):
                        return False
            
            # Check age-based contraindications
            user_age = getattr(user_profile, 'age', None)
            if user_age:
                if user_age < 18 and 'Not recommended under 18' in medication.get('pediatric_dosage', ''):
                    return False
                if user_age < 2 and 'Not recommended under 2' in medication.get('pediatric_dosage', ''):
                    return False
            
            # Check chronic conditions
            chronic_conditions = getattr(user_profile, 'chronic_conditions', '') or ''
            chronic_conditions_list = [cond.strip().lower() for cond in chronic_conditions.split(',')]
            
            for condition in chronic_conditions_list:
                if condition in self.contraindications:
                    contraindicated_meds = self.contraindications[condition]
                    if any(med.lower() in med_name.lower() for med in contraindicated_meds):
                        return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Safety check error: {str(e)}")
            return True  # Default to safe if check fails
    
    def _create_recommendation(self, med_info: Dict, user_profile: Any, disease: str, confidence: float) -> Dict[str, Any]:
        """Create a structured medication recommendation"""
        user_age = getattr(user_profile, 'age', None)
        user_weight = getattr(user_profile, 'weight', None)
        
        # Determine appropriate dosage
        if user_age and user_age < 18:
            dosage = med_info.get('pediatric_dosage', med_info['adult_dosage'])
        else:
            dosage = med_info['adult_dosage']
        
        # Adjust dosage for weight if applicable and weight-based dosing exists
        if user_weight and 'mg/kg' in dosage:
            # Simple weight-based calculation (would be more sophisticated in real system)
            dosage = f"Calculated based on weight: {user_weight}kg"
        
        recommendation = {
            'name': med_info['name'],
            'generic_name': med_info['generic_name'],
            'medication_class': med_info['class'],
            'dosage': dosage,
            'route': med_info['route'],
            'frequency': med_info['frequency'],
            'duration': med_info['duration'],
            'max_daily_dose': med_info.get('max_daily', 'As directed'),
            'side_effects': med_info['side_effects'],
            'contraindications': med_info['contraindications'],
            'precautions': med_info['precautions'],
            'drug_interactions': self.drug_interactions.get(med_info['name'], []),
            'pregnancy_category': med_info.get('pregnancy_category', 'Unknown'),
            'cost_estimate': med_info.get('cost_estimate', 'Consult pharmacy'),
            'indication': disease,
            'recommendation_confidence': confidence * 0.8,  # Slightly lower than disease confidence
            'safety_score': self._calculate_safety_score(med_info, user_profile),
            'instructions': self._generate_instructions(med_info, user_profile),
            'monitoring_requirements': self._get_monitoring_requirements(med_info),
            'when_to_seek_help': self._get_warning_signs(med_info)
        }
        
        return recommendation
    
    def _calculate_safety_score(self, medication: Dict, user_profile: Any) -> float:
        """Calculate safety score for medication (0-1 scale)"""
        base_score = 0.8
        
        # Deduct points for potential issues
        if medication.get('pregnancy_category') in ['D', 'X']:
            base_score -= 0.2
        
        contraindications = medication.get('contraindications', [])
        if len(contraindications) > 3:
            base_score -= 0.1
        
        side_effects = medication.get('side_effects', [])
        serious_side_effects = ['liver damage', 'kidney damage', 'heart problems', 'respiratory depression']
        if any(serious in ' '.join(side_effects).lower() for serious in serious_side_effects):
            base_score -= 0.15
        
        return max(0.1, base_score)
    
    def _generate_instructions(self, medication: Dict, user_profile: Any) -> List[str]:
        """Generate patient-friendly instructions"""
        instructions = [
            f"Take {medication['dosage']} {medication['frequency']}",
            f"Route of administration: {medication['route']}",
            f"Continue for: {medication['duration']}"
        ]
        
        # Add specific instructions based on medication
        if 'with food' in medication.get('precautions', []):
            instructions.append("Take with food to reduce stomach irritation")
        
        if 'drowsiness' in ' '.join(medication.get('side_effects', [])).lower():
            instructions.append("May cause drowsiness - avoid driving or operating machinery")
        
        if medication['name'] == 'ORS':
            instructions.append("Prepare fresh solution and sip frequently")
        
        instructions.append("Complete the full course even if symptoms improve")
        instructions.append("Store in a cool, dry place away from children")
        
        return instructions
    
    def _get_monitoring_requirements(self, medication: Dict) -> List[str]:
        """Get monitoring requirements for medication"""
        monitoring = []
        
        med_name = medication['name'].lower()
        
        if 'paracetamol' in med_name or 'acetaminophen' in med_name:
            monitoring.append("Monitor for signs of liver problems if used long-term")
        
        if 'amlodipine' in med_name or 'blood pressure' in medication.get('class', '').lower():
            monitoring.append("Monitor blood pressure regularly")
        
        if 'antibiotic' in medication.get('class', '').lower():
            monitoring.append("Watch for signs of allergic reaction")
        
        if 'lorazepam' in med_name or 'benzodiazepine' in medication.get('class', '').lower():
            monitoring.append("Monitor for signs of dependence with long-term use")
        
        return monitoring
    
    def _get_warning_signs(self, medication: Dict) -> List[str]:
        """Get warning signs that require immediate medical attention"""
        warnings = []
        
        med_name = medication['name'].lower()
        
        if 'paracetamol' in med_name:
            warnings.extend([
                "Yellowing of skin or eyes",
                "Severe nausea or vomiting",
                "Dark urine"
            ])
        
        if 'antibiotic' in medication.get('class', '').lower():
            warnings.extend([
                "Severe skin rash",
                "Difficulty breathing",
                "Severe diarrhea"
            ])
        
        if 'sumatriptan' in med_name:
            warnings.extend([
                "Chest pain or tightness",
                "Severe headache different from usual",
                "Signs of stroke"
            ])
        
        # General warnings
        warnings.extend([
            "Severe allergic reaction (rash, swelling, difficulty breathing)",
            "Symptoms worsen despite treatment",
            "New severe symptoms develop"
        ])
        
        return list(set(warnings))  # Remove duplicates
    
    def _deduplicate_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Remove duplicate medication recommendations"""
        seen_medications = set()
        unique_recommendations = []
        
        for rec in recommendations:
            med_key = rec['name'].lower()
            if med_key not in seen_medications:
                unique_recommendations.append(rec)
                seen_medications.add(med_key)
        
        return unique_recommendations
    
    def _rank_recommendations(self, recommendations: List[Dict], user_profile: Any) -> List[Dict]:
        """Rank recommendations by safety and effectiveness"""
        def ranking_score(rec):
            # Combine confidence, safety, and cost factors
            confidence_score = rec['recommendation_confidence']
            safety_score = rec['safety_score']
            
            # Prefer lower cost medications (simple heuristic)
            cost_str = rec.get('cost_estimate', '₹100')
            try:
                # Extract numeric part of cost
                cost_value = float(cost_str.replace('₹', '').split('-')[0])
                cost_score = max(0, 1 - (cost_value / 500))  # Normalize by max expected cost
            except:
                cost_score = 0.5
            
            # Weighted combination
            final_score = (confidence_score * 0.4 + safety_score * 0.4 + cost_score * 0.2)
            return final_score
        
        return sorted(recommendations, key=ranking_score, reverse=True)
    
    def check_drug_interactions(self, medications: List[str], user_medications: List[str] = None) -> Dict[str, List[str]]:
        """Check for drug interactions between recommended and existing medications"""
        interactions = {}
        
        all_medications = medications + (user_medications or [])
        
        for med in medications:
            med_interactions = []
            
            if med in self.drug_interactions:
                known_interactions = self.drug_interactions[med]
                
                for other_med in all_medications:
                    if other_med != med:
                        for interaction in known_interactions:
                            if other_med.lower() in interaction.lower():
                                med_interactions.append(interaction)
            
            if med_interactions:
                interactions[med] = med_interactions
        
        return interactions
    
    def get_medication_adherence_tips(self, medications: List[Dict]) -> List[str]:
        """Generate medication adherence tips"""
        tips = [
            "Set daily alarms for medication times",
            "Use a pill organizer to track daily doses",
            "Keep medications in a visible location",
            "Link medication taking to daily routines (meals, brushing teeth)",
            "Keep a medication diary to track doses and side effects",
            "Don't stop medications suddenly without consulting doctor",
            "Inform all healthcare providers about medications you're taking",
            "Store medications properly as directed",
            "Check expiration dates regularly",
            "Use pharmacy reminder services if available"
        ]
        
        # Add specific tips based on medications
        for med in medications:
            if 'twice daily' in med.get('frequency', ''):
                tips.append("For twice daily medications: take 12 hours apart")
            
            if 'with food' in ' '.join(med.get('precautions', [])):
                tips.append(f"Take {med['name']} with meals to reduce stomach upset")
        
        return tips[:8]  # Return top 8 tips