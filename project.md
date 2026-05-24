# Zero-Wait OPD Kiosk

## Overview
The **Zero-Wait OPD Kiosk** is an AI-powered smart hospital check-in system designed to eliminate paper queues and streamline patient intake. Built for the Google Lakecity Hackathon 2026, it leverages Google's Gemini AI to automate the triage process.

## Core Capabilities (What the app actually does)

1. **SCAN ID (Automated Intake)**
   - The kiosk allows patients to upload or scan a standard government or insurance ID.
   - It uses Gemini Vision OCR to automatically extract the patient's name, DOB, gender, and unique ID.
   - *Agentic Bonus*: It can read insurance details and automatically flag/alert if the insurance coverage is expired.

2. **AGENT CHAT (AI Triage & Routing)**
   - Patients who don't have an ID or have complex symptoms can talk to the AI Agent.
   - The Gemini-powered chat asks simple questions for correct routing and performs a dynamic symptom analysis tailored to the specific problem (e.g., if chest pain is mentioned, it dynamically conducts a Cardiology-specific survey).

3. **SAVE DATA (Structured Clinical Data)**
   - The system captures all the clinical data from the ID scan and the symptom chat.
   - It stores this data instantly in a structured JSON format (via MongoDB) for doctors to review before the patient even enters the room.

4. **CHECK INSURANCE & QUEUE ALLOCATION (Zero-Wait)**
   - Verifies active insurance status automatically.
   - Based on the AI triage, the system assigns a priority tier (RED = Urgent, YELLOW = Moderate, GREEN = Routine) and allocates the patient to the correct department's shortest queue.
   - Generates a physical or digital Queue Ticket with an estimated wait time.

## Hackathon Judging Alignment
- **Innovation**: Replaces manual receptionist triage with an automated, dynamic AI conversation.
- **Feasibility**: Built on a robust React + Node.js + MongoDB stack.
- **Impact**: Drastically reduces hospital waiting room times and prioritizes critical patients instantly.
- **Google Tech**: Deeply integrates Google's Gemini Multimodal AI for both Vision (OCR) and NLP (Triage).
