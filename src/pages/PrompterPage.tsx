import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  Play,
  Square,
  RotateCcw,
  Settings,
  Minus,
  Plus,
  Mic,
  MicOff,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
  Wand2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PrompterPage = () => {
  const navigate = useNavigate();
  const [script, setScript] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [stripHeight, setStripHeight] = useState(120); // compact strip height in px (Cluelead-style)
  const [topOffset, setTopOffset] = useState(0); // offset from top for notch/camera
  const [showSettings, setShowSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(false); //Changing from True to try to make a popup first
  const [showSetupInt, setShowSetupInt] = useState(false); //Added for selecting mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | Float32Array | null>(null);
  const vadAnimationRef = useRef<number | null>(null);
  const [useAudioVAD, setUseAudioVAD] = useState(true);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(
    localStorage.getItem("gemini_api_key") || "",
  );
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [isImproving, setIsImproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = () => {
      setIsSpeaking(true);
      // Reset silence timer
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 1200); // pause after 1.2s of silence
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      // Auto-restart if still running
      if (recognitionRef.current?._shouldRestart) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  // Audio-level Voice Activity Detection (fallback / alternative)
  const startAudioVAD = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      const bufferLength = analyser.fftSize;
      const data = new Float32Array(bufferLength);
      dataArrayRef.current = data;

      const threshold = 0.02; // adjustable sensitivity
      let speaking = false;

      const loop = () => {
        const an = analyserRef.current;
        const arr = dataArrayRef.current as Float32Array;
        if (an && arr) {
          an.getFloatTimeDomainData(arr);
          let sum = 0;
          for (let i = 0; i < arr.length; i++) {
            sum += arr[i] * arr[i];
          }
          const rms = Math.sqrt(sum / arr.length);
          if (rms > threshold) {
            if (!speaking) {
              speaking = true;
              setIsSpeaking(true);
            }
          } else {
            if (speaking) {
              speaking = false;
              setIsSpeaking(false);
            }
          }
        }
        vadAnimationRef.current = requestAnimationFrame(loop);
      };

      vadAnimationRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn("Audio VAD error", err);
    }
  }, []);

  const stopAudioVAD = useCallback(() => {
    if (vadAnimationRef.current) cancelAnimationFrame(vadAnimationRef.current);
    vadAnimationRef.current = null;
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    dataArrayRef.current = null;
    setIsSpeaking(false);
  }, []);

  // Scroll animation
  useEffect(() => {
    if (!isRunning || !isSpeaking || isManuallyPaused || !scrollRef.current) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      return;
    }

    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += speed * 0.4;
      }
      animFrameRef.current = requestAnimationFrame(scroll);
    };

    animFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, isSpeaking, isManuallyPaused, speed]);

  const handleStart = useCallback(() => {
    if (!script.trim()) return;
    setIsRunning(true);
    setIsManuallyPaused(false);
    setShowSetup(false);
    // Start speech recognition if available
    if (!useAudioVAD) {
      if (recognitionRef.current) {
        recognitionRef.current._shouldRestart = true;
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } else {
      // Start audio-level VAD
      startAudioVAD();
    }
  }, [script]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsManuallyPaused(false);
    setIsSpeaking(false);
    // Stop both systems
    if (recognitionRef.current) {
      recognitionRef.current._shouldRestart = false;
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioVAD();
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [handleStop]);

  const handleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setScript(ev.target?.result as string);
      reader.readAsText(file);
    },
    [],
  );

  const handleSaveApiKey = useCallback(() => {
    localStorage.setItem("gemini_api_key", apiKeyInput);
    setGeminiApiKey(apiKeyInput);
    setShowApiDialog(false);
  }, [apiKeyInput]);

  const handleImproveScript = useCallback(async () => {
    if (!script.trim()) return;
    if (!geminiApiKey && !apiKeyInput) {
      setShowApiDialog(true);
      return;
    }

    const keyToUse = apiKeyInput || geminiApiKey;
    setIsImproving(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `You are a professional speech and presentation coach. Your task is to optimize the following script for spoken delivery. Make it conversational, clear, and engaging. 

Key improvements to make:
- Break up long sentences into shorter, more digestible phrases
- Use natural conversational language instead of written language
- Add strategic pauses (use [pause] only for truly important moments, not excessively)
- Simplify complex jargon or explain it in simpler terms
- Ensure smooth transitions between ideas
- Keep the original meaning and core arguments intact
- Make it feel like a natural speech, not a manuscript being read

IMPORTANT: Return ONLY the optimized script. Do not include any preamble, explanation, or commentary. Just the script itself.

Script to optimize:

${script}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2000,
        },
      };

      console.log("Sending request to Gemini API...");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (improvedText) {
        setScript(improvedText);
        alert("Script improved successfully!");
      } else {
        throw new Error("No response text received from API");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error improving script:", errorMessage);
      alert(`Failed to improve script: ${errorMessage}`);
    } finally {
      setIsImproving(false);
    }
  }, [script, geminiApiKey, apiKeyInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === " " && !e.ctrlKey) {
        e.preventDefault();
        if (isRunning) {
          setIsManuallyPaused(true);
        }
      }
      if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        isRunning ? handleStop() : handleStart();
      }
      if (e.key === "ArrowUp" && isRunning) {
        e.preventDefault();
        if (scrollRef.current) {
          scrollRef.current.scrollTop -= 25;
        }
      }
      if (e.key === "ArrowDown" && isRunning) {
        e.preventDefault();
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 25;
        }
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      if (e.key === " " && !e.ctrlKey) {
        e.preventDefault();
        setIsManuallyPaused(false);
      }
    };

    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);
    return () => {
      window.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("keyup", keyupHandler);
    };
  }, [isRunning, handleStart, handleStop]);

  //Before selecting a setup (teleprompt or interview)
  if (!showSetup && !showSetupInt && !isRunning) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground glow-text">
            FlowSpeak
          </h1>
          <div className="w-16" />
        </header>

        <div className="flex flex-col items-center justify-center w-full min-h-[80vh] mt-[2vh] px-4">
          <div className="w-full max-w-5xl flex flex-col items-center">
            <h2 className="text-[45px] md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight text-center">
              Choose Your
            </h2>
            <h2 className="text-[45px] md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight text-center text-primary glow-text">
              Mode
            </h2>

            <br />
            <hr className="w-[60%] mx-auto mb-[90px] shadow-[0px_4px_26px_4px_#198CFF] animate-pulse-glow" />

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
              <div className="w-full bg-card outline outline-1 outline-[#253B5C] rounded-xl p-6 space-y-3 hover:border-primary/40 transition-colors hover:outline-4 hover:bg-[#242D41] hover:outline-[#26D2FF] hover:shadow-[0_0_15px_5px_#242D41]">
                <h3 className="text-[25px] font-bold text-foreground leading-[1.1] tracking-tight">
                  Teleprompter Mode
                </h3>
                <p className="text-muted-foreground">
                  Enter a script that you've written or previously provided us,
                  and we will set it up as a teleprompter for you to use!
                </p>
                <button
                  className="bg-primary w-[40%] text-center px-8 py-3.5 rounded-lg text-sm font-semibold hover:brightness-150 text-primary-foreground transition-all glow-button"
                  onClick={() => setShowSetup(true)}
                >
                  Select
                </button>
              </div>
              <div className="w-full bg-card outline outline-1 outline-[#253B5C] rounded-xl p-6 space-y-3 hover:border-primary/40 transition-colors hover:outline-4 hover:bg-[#242D41] hover:outline-[#26D2FF] hover:shadow-[0_0_15px_5px_#242D41]">
                <h3 className="text-[25px] font-bold text-foreground leading-[1.1] tracking-tight">
                  Interview Mode
                </h3>
                <p className="text-muted-foreground">
                  Provide us a resume, cover letter, or other relevant
                  information, and we will provide a customized response to
                  interview questions!
                </p>
                <button
                  className="bg-primary w-[40%] text-center px-8 py-3.5 rounded-lg text-sm font-semibold hover:brightness-150 text-primary-foreground transition-all glow-button"
                  onClick={() => setShowSetupInt(true)}
                >
                  Select
                </button>
              </div>
            </div>

            <hr className="w-[60%] mx-auto mt-[100px] shadow-[0px_4px_26px_4px_#198CFF] animate-pulse-glow" />
          </div>
        </div>
      </div>
    );
  }

  // Setup/edit view FOR TELEPROMPTER
  if (showSetup && !isRunning) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground glow-text">
            FlowSpeak
          </h1>
          <div className="w-16" />
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                Prepare your script
              </h2>
              <p className="text-sm text-muted-foreground">
                Paste your script or upload a text file. Hit start when you're
                ready.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Your script
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste or type your script here..."
                className="w-full h-72 bg-input border border-border rounded-lg p-4 text-foreground text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 font-mono"
              />
            </div>

            {/* Settings inline */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium text-foreground">Settings</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Scroll Speed:{" "}
                    <span className="text-foreground font-mono">{speed}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Font Size:{" "}
                    <span className="text-foreground font-mono">
                      {fontSize}px
                    </span>
                  </label>
                  <input
                    type="range"
                    min={14}
                    max={32}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Strip height:{" "}
                    <span className="text-foreground font-mono">
                      {stripHeight}px
                    </span>
                  </label>
                  <input
                    type="range"
                    min={80}
                    max={280}
                    value={stripHeight}
                    onChange={(e) => setStripHeight(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Height of the text strip at top (like Cluelead).
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Top offset:{" "}
                    <span className="text-foreground font-mono">
                      {topOffset}px
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={topOffset}
                    onChange={(e) => setTopOffset(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Nudge down for notch/camera.
                  </p>
                </div>
              </div>
              <p className="text-xs">
                Tip: Use ↑/↓ arrow keys to scroll text while presenting.
                Ctrl+Space to start/stop. Hold Space to pause.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImproveScript}
                disabled={!script.trim() || isImproving}
                className={`flex-1 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  script.trim() && !isImproving
                    ? "bg-blue-600 text-white hover:brightness-110"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Wand2 className="w-4 h-4" />
                {isImproving ? "Improving..." : "Improve"}
              </button>
              <button
                onClick={handleStart}
                disabled={!script.trim()}
                className={`flex-1 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  script.trim()
                    ? "bg-primary text-primary-foreground glow-button hover:brightness-110"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Play className="w-4 h-4" />
                Start Teleprompter
              </button>
            </div>
          </div>
        </div>

        {/* API Key Dialog */}
        {showApiDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Gemini API Key
                </h3>
                <button
                  onClick={() => setShowApiDialog(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your Google Gemini API key to improve your scripts. Get
                one at{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  aistudio.google.com
                </a>
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your API key here..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApiDialog(false)}
                  className="flex-1 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  //Setup / edit FOR INTERVIEW
  if (showSetupInt && !isRunning) {
    //Same layout, different options
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground glow-text">
            FlowSpeak
          </h1>
          <div className="w-16" />
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                Prepare your interview
              </h2>
              <p className="text-sm text-muted-foreground">
                Paste your resume, cover letter, or upload a text file. Hit
                start when you're ready.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Your information
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste or type your script here..."
                className="w-full h-72 bg-input border border-border rounded-lg p-4 text-foreground text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 font-mono"
              />
            </div>

            {/* Settings inline */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium text-foreground">Settings</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Scroll Speed:{" "}
                    <span className="text-foreground font-mono">{speed}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Font Size:{" "}
                    <span className="text-foreground font-mono">
                      {fontSize}px
                    </span>
                  </label>
                  <input
                    type="range"
                    min={16}
                    max={56}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
              <p className="text-xs">
                Tip: Use ↑/↓ arrow keys to scroll text while presenting.
                Ctrl+Space to start/stop.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={!script.trim()}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                script.trim()
                  ? "bg-primary text-primary-foreground glow-button hover:brightness-110"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4" />
              Start Teleprompter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prompter view — rounded rectangular box at top center
  return (
    <div
      className={`fixed inset-0 ${isFullscreen ? "bg-black" : "bg-black/20 backdrop-blur-[2px]"}`}
      aria-hidden="false"
    >
      {/* Rounded rectangular box, top middle of screen */}
      <div
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-2xl shadow-xl border border-white/10 w-[92%] max-w-3xl"
        style={
          isFullscreen
            ? {
                top: `${topOffset}px`,
                height: `${stripHeight}px`,
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
              }
            : {
                top: `${topOffset}px`,
                height: `${stripHeight}px`,
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }
        }
      >
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overflow-x-hidden px-5 py-4"
          style={{ scrollBehavior: "smooth" }}
        >
          <p
            className="teleprompter-strip-text text-white whitespace-pre-wrap mx-auto text-center"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.6,
              textShadow: "0 0 2px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {script}
          </p>
          <div className="h-8" />
        </div>
      </div>

      {/* Floating compact control bar at bottom */}
      <div
        className={`absolute flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
          isFullscreen
            ? "bottom-6 left-1/2 -translate-x-1/2"
            : "bottom-4 left-1/2 -translate-x-1/2"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Status */}
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSpeaking ? "bg-green-400 animate-pulse" : "bg-white/40"
          }`}
        />
        <span className="text-xs text-white/90 hidden sm:inline">
          {isSpeaking ? "Scrolling" : "Paused"}
        </span>
        <button
          onClick={() => {
            if (useAudioVAD) {
              setUseAudioVAD(false);
              stopAudioVAD();
            } else {
              setUseAudioVAD(true);
            }
          }}
          title={useAudioVAD ? "Using audio VAD" : "Using Speech API"}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          {useAudioVAD ? (
            <Mic className="w-3.5 h-3.5" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
        </button>
        {/* Speed */}
        <button
          onClick={() => setSpeed((s) => Math.max(s - 1, 1))}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs font-mono text-white/90 w-10 text-center">
          {speed}
        </span>
        <button
          onClick={() => setSpeed((s) => Math.min(s + 1, 10))}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        {/* Actions */}
        <button
          onClick={() => {
            handleStop();
            setShowSetup(true);
          }}
          className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-3.5 h-3.5" />
          ) : (
            <Maximize className="w-3.5 h-3.5" />
          )}
          {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
        <button
          onClick={handleStop}
          className="flex items-center gap-1.5 bg-red-500/80 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-500 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          Stop
        </button>
      </div>
    </div>
  );
};

export default PrompterPage;
