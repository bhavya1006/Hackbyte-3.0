# 🧠 PreDAP - The Future of AI-Driven Onboarding & Productivity 🚀

PreDap's advanced architecture works seamlessly together to deliver intelligent guidance while preserving privacy and security.

## 🗒️ Problem Statement
In today's fast-paced corporate world, onboarding freshers and simplifying digital workflows remains a challenge. Existing Digital Adoption Platforms (DAPs) often fail to provide adaptive, AI-driven, and privacy-respecting automation.

Enter PreDAP — a Chrome extension built to redefine how users interact with enterprise tools, automate tasks, and learn complex platforms using a powerful 3-tier AI system.

## 🧩 Solution Overview
PreDAP is a 3-tier AI-powered system that integrates with websites to deliver personalized assistance and intelligent guidance, all while respecting user privacy.

From understanding UI elements to abstracting sensitive data and delivering guidance — all parts of the system are intelligently layered.

## Repository Structure 
```
PreDAP/
├── extension/            # Chrome extension codebase
│   ├── background.js
│   ├── content.js
│   └── manifest.json
├── ai-models/
│   ├── pixel-analyzer/   # Edge model for UI recognition
│   ├── abstracter/       # Edge model for privacy abstraction
│   └── big-ai/           # Cloud model (Gemini / GCP-based)
├── ui-onboarding/
│   └── nextjs-app/       # Interactive onboarding page in Next.js
├── .github/
│   └── workflows/        # GitHub Actions CI/CD setup
├── assets/               # Diagrams, screenshots, team photo
└── README.md
```

## 📸 How It Works (With Diagrams)

![1234567 1](https://github.com/user-attachments/assets/d3d06dd3-c82e-4bef-86f8-6c7ad3311f63)

- ### 🧑‍💻 Interactive Onboarding UI (Next.js)
Fresh users are guided with step-wise instructions.

Reacts based on the AI model’s understanding of the current UI.

Integrates cleanly with extension and Gemini backend.

## 🚀 Tech Stack
🔧 Next.js – Frontend Onboarding Interface

🧠 Gemini Pro / GCP – Cloud Model Backend

🌐 Chrome Extension API – Real-time UI Interaction

🛡️ Edge Models (TensorFlow Lite / ONNX) – Local UI Detection

⚙️ GitHub Actions – Automation & CI/CD

🖼️ Figma – UI Design & Workflow Prototyping


