<div align="center">

# 🎙️ FlowSpeak

**Voice-controlled teleprompter for the browser — private, free, and ready in one click.**

_Built at HackHers 2026_

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/) [![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## ✨ Inspiration

Every existing teleprompter is either **expensive**, requires an app download, sends your script to the cloud, or is clunky to use. We saw a clear gap: **no simple, free, privacy-first teleprompter for the browser.**

Whether you're a content creator, a remote worker doing standups, or a student presenting — you shouldn't need a subscription or to hand your script to a third party. **FlowSpeak was built to fix that.**

---

## 🚀 What It Does

FlowSpeak is a **browser-based teleprompter** that sits below your camera and scrolls your script as you speak — **pausing automatically when you stop talking.** No downloads. No accounts. No cloud. Just open and go.

| Feature                       | Description                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| 📄 **Upload or paste script** | Upload a **.txt** or **.md** file of your choice, or paste/type directly |
| 🎙️ **Voice-driven scrolling** | Text moves when you speak, pauses when you don't                         |
| 📷 **Camera-aligned layout**  | Compact strip near the top, right below your webcam — eyes stay on lens  |
| ⚡ **Adjustable speed**       | Tune scroll rate on the fly during your presentation                     |
| ✨ **AI script improvement**  | One-click Gemini integration to optimize your script for spoken delivery |
| ⏸️ **Manual pause control**   | Hold spacebar to pause scrolling, even while speaking                    |
| 🔒 **100% private**           | Runs locally; your script never leaves your device                       |

---

## 🛠️ How We Built It

- **React + TypeScript** — component-based UI and type safety
- **Vite** — fast dev server and optimized production builds
- **Tailwind CSS + shadcn/ui** — responsive, accessible styling and polished components
- **Web Speech API** — real-time voice detection and scroll triggering
- **Audio Worklet + Float32Array** — Voice Activity Detection (VAD) fallback
- **`requestAnimationFrame`** — smooth, frame-accurate scroll animation
- **React Router** — landing page, prompter, and routing
- **Google Gemini API** — optional script improvement with natural language optimization

Everything runs **in the browser** — no backend, no cloud, works offline. (Script improvement is optional and uses your own API key.)

---

## 🏃 Get Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser (Chrome recommended for best speech support).

### Adding your script

You can load your script in two ways:

- **Paste or type** — Use the text area on the prompter page to paste or type your script.
- **Upload a file** — Click **"Upload .txt"** and choose a **.txt** or **.md** file from your device. The file is read locally; nothing is sent to a server.

Use any script you like: notes, speeches, video scripts, or meeting talking points.

---

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action                              |
| -------------- | ----------------------------------- |
| **Hold Space** | Pause scrolling (release to resume) |
| **Ctrl+Space** | Start/Stop teleprompter             |
| **Arrow Up**   | Scroll text up manually             |
| **Arrow Down** | Scroll text down manually           |

---

## 📊 Commands

| Script    | Command           | Description              |
| --------- | ----------------- | ------------------------ |
| `dev`     | `npm run dev`     | Start development server |
| `build`   | `npm run build`   | Production build         |
| `preview` | `npm run preview` | Preview production build |
| `lint`    | `npm run lint`    | Run ESLint               |
| `test`    | `npm run test`    | Run tests                |

---

## 📁 Project Structure

```
FlowSpeak/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── pages/
    │   ├── LandingPage.tsx
    │   ├── PrompterPage.tsx
    │   └── NotFound.tsx
    ├── components/
    │   ├── NavLink.tsx
    │   └── ui/           # shadcn components
    ├── hooks/
    │   ├── use-toast.ts
    │   └── use-mobile.tsx
    └── lib/
        └── utils.ts
```

---

## 🧩 Challenges

- **Time** — We built FlowSpeak in **one day** at HackerHers 2026. That meant ruthless scope cuts and shipping only what mattered for the core experience.
- **Layout** — Getting the text strip to sit correctly under the camera in fullscreen (including notched Mac displays) took careful CSS and keeping the strip compact but readable.

---

## 💡 What We Learned

- The **Web Speech API** is powerful and runs fully on-device in Chrome.
- **VAD** can be done via speech events (simple) or raw audio (more control).
- **Scope discipline** at a hackathon is a superpower — we dropped script management, accounts, and extra settings to ship voice scrolling, camera alignment, and a clean UI.
- The best tools get out of your way; FlowSpeak does one job well.

---

## 🔮 What's Next

- 🌐 Firefox & Safari support (fallback manual scroll)
- 📍 Highlight current word/line as you speak
- 🪞 Mirror mode for physical teleprompter glass
- 🔗 Shareable script links (encrypted, still private)

---

<div align="center">

**FlowSpeak** — _Speak naturally. Never lose your place._

</div>
