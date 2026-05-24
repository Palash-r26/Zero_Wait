# Premium UI Upgrade for Zero-Wait OPD Kiosk

This plan outlines the integration of **GSAP**, **React Bits**, and **Uiverse.io** components to elevate the frontend aesthetics of the Zero-Wait OPD Kiosk.

## User Review Required

> [!IMPORTANT]
> **GSAP Installation**: I will install `gsap` and `@gsap/react` via npm. This will be used for high-performance scroll and layout animations.

> [!IMPORTANT]
> **React Bits & Uiverse.io Integration**: Since these platforms typically provide raw code snippets rather than installable packages, I will create custom reusable components in `client/src/components/ui/` based on their designs. Are there any specific components (like buttons, loaders, cards) you saw there that you absolutely want included?

## Proposed Changes

### 1. Dependencies Setup
- Run `npm install gsap @gsap/react` in the `client` directory.
- This will allow us to use `useGSAP` hook for smooth, unmounted animations across pages.

### 2. Welcome Page Enhancement (`client/src/pages/WelcomePage.jsx`)
- Replace the basic hero buttons with premium, animated buttons inspired by **Uiverse.io** (e.g., glowing borders, magnetic hover effects).
- Add GSAP stagger animations so the "Welcome" text and buttons gracefully slide up when the kiosk screen is tapped or activated.
- Implement a **React Bits** style animated background (like an Aurora or Particle background) to give the kiosk a futuristic, AI-powered feel.

### 3. ID Scan Page Enhancement (`client/src/pages/IDScanPage.jsx`)
- Replace the standard loading spinner with a custom **Uiverse.io** scanning animation.
- Add a GSAP-powered laser scanning line effect that sweeps across the ID upload zone.
- Animate the form fields popping in one by one when data is successfully extracted.

### 4. Symptom Chat Page Enhancement (`client/src/pages/SymptomChatPage.jsx`)
- Use GSAP to animate chat bubbles smoothly sliding up from the bottom instead of abruptly appearing.
- Implement a premium typing indicator (e.g., bouncing dots from Uiverse) to show Gemini is "thinking".

### 5. Ticket Page Enhancement (`client/src/pages/TicketPage.jsx`)
- Animate the final token number using GSAP's counter/number scramble effect for dramatic reveal.
- Use a **React Bits** inspired glowing card for the final ticket display, with the glow color mapping to the triage priority (RED, YELLOW, GREEN).

## Verification Plan
1. Install GSAP and verify the Vite development server starts without errors.
2. Implement the Welcome Page background and button animations, verifying the magnetic hover and stagger effects manually in the browser.
3. Test the ID scanning laser animation and ensure it does not block the actual OCR functionality.
4. Verify the chat bubbles enter smoothly using the `useGSAP` hook.
