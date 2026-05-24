# Zero-Wait OPD Kiosk 🏥

An AI-powered smart hospital check-in system designed to eliminate paper queues, streamline patient intake, and instantly prioritize critical cases. Built for the Google Lakecity Hackathon 2026.

## 🚀 Overview
The Zero-Wait OPD Kiosk replaces the traditional, slow, manual receptionist triage with a dynamic, automated AI conversation. By deeply integrating Google's Gemini Multimodal AI for both Vision (OCR) and NLP (Triage), it drastically reduces hospital waiting room times.

## 🛠️ Core Capabilities

1. **Scan ID (Automated Intake)**
   - Patients upload or scan a standard government/insurance ID.
   - **Gemini Vision OCR** automatically extracts name, DOB, gender, and unique ID.
   - *Agentic Bonus:* Automatically reads insurance details and flags if coverage is expired.

2. **Agent Chat (AI Triage & Routing)**
   - For complex symptoms or patients without IDs, the Gemini-powered AI Agent takes over.
   - It performs dynamic, adaptive symptom analysis. For example, if chest pain is mentioned, it immediately pivots to conduct a Cardiology-specific survey.
   - **Safety Guardrails:** A local, hardcoded Node.js Safety Checker intercepts critical keywords (e.g., "stroke", "heart attack") to ensure instant emergency routing, bypassing the AI if necessary.

3. **Save Data (Structured Clinical Data)**
   - Captures all clinical data from the ID scan and symptom chat.
   - Instantly stores it in a structured JSON format in MongoDB, allowing doctors to review patient history before they even enter the room.

4. **Zero-Wait Queue Allocation**
   - Evaluates the AI triage to assign a priority tier: **🔴 RED (Urgent)**, **🟡 YELLOW (Moderate)**, or **🟢 GREEN (Routine)**.
   - Allocates the patient to the correct department's shortest queue.
   - Generates a digital/physical Queue Ticket with an estimated wait time.

## 🎨 Premium UI Experience
The kiosk is designed not just to be functional, but to provide a premium, modern user experience that reduces patient anxiety:
- **Framer Motion & GSAP Animations:** Smooth, high-performance scroll and layout animations (like sliding chat bubbles, priority badges, and the voice visualizer).
- **React Bits & Uiverse.io:** Incorporates cutting-edge UI components including glowing cards, magnetic hover effects, and modern typing indicators to make the AI feel alive and responsive.

## 🏆 Hackathon Alignment
- **Innovation:** Fully automates triage using dynamic AI conversations rather than static forms.
- **Feasibility:** Built on a robust React + Node.js + MongoDB stack.
- **Impact:** Solves a real-world problem by prioritizing critical patients instantly and cutting wait times.
- **Google Tech:** Showcases the power of Gemini 1.5 Pro and Gemini Vision for healthcare applications.

## 🚨 Insurance Alert Demo
To demo the real-time agentic insurance alerts:
1. Open a new tab and navigate to `http://localhost:5173/staff` (This connects the Socket.io client).
2. In the patient kiosk tab, either scan an ID that returns an expired insurance, OR skip the scan and enter a manual patient.
3. Complete the symptom chat and click "Confirm & Get Queue Ticket".
4. The staff dashboard will instantly show an alert warning that the patient's insurance requires manual verification.
