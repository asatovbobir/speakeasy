import { useNavigate } from "react-router-dom";
import {
  Mic,
  Eye,
  Shield,
  Gauge,
  MonitorPlay,
  Video,
  Radio,
  Users,
  Briefcase,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

//Hero image needs to be changed
import heroImage from "@/assets/hero-teleprompter.jpg";

const features = [
  {
    icon: Mic,
    title: "Voice-Controlled Scrolling",
    description: "Text scrolls as you speak and pauses when you pause. No foot pedals, no remotes.",
  },
  {
    icon: Gauge,
    title: "Adjustable Speed",
    description: "Scroll through content and adjust speed anytime during your presentation.",
  },
  {
    icon: Eye,
    title: "Camera-Aligned Display",
    description: "Content appears directly below your camera. Better eye contact, more natural delivery.",
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Everything stays on your computer. No cloud uploads, no data collection.",
  },
];

const audiences = [
  {
    icon: Video,
    title: "Content Creators",
    description: "Recording videos for YouTube or social media",
  },
  {
    icon: Radio,
    title: "Live Streamers",
    description: "Presenting to your audience in real-time",
  },
  {
    icon: Users,
    title: "Remote Workers",
    description: "Delivering daily standups and team updates",
  },
  {
    icon: Briefcase,
    title: "Business Professionals",
    description: "Presenting to executives, managers, or clients",
  },
];

const painPoints = [
  "Struggle with remembering talking points",
  "Get nervous presenting on camera",
  "Have limited prep time before recordings",
  "Want to appear more polished and professional",
];

//Added for scroll
import { useRef } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">FlowSpeak</span>
          </div>
          <button
            onClick={() => navigate("/prompter")}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-150 transition-all glow-button"
          >
            Launch Prompter
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Voice-powered teleprompter
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Speak naturally.
              <br />
              <span className="text-primary glow-text">Never lose your place.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              A teleprompter that sits near your camera and scrolls your script as you speak.
              Pause talking, it pauses. Start again, it follows. Invisible when screen sharing.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/prompter")}
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:brightness-150 transition-all glow-button flex items-center gap-2"
              >
                Start Prompting
                <ArrowRight className="w-4 h-4 hover:ml-30" />
              </button>
              <a
                href="#"
                onClick={() => featuresRef.current?.scrollIntoView({
                  behavior: "smooth"
                })}
                //Should be a scroll into view to features, rn it's jarring
                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
              >
                Learn more
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={heroImage}
                alt="FlowSpeak teleprompter on a clipart laptop, with the words 'Your Voice-Powered Teleprompter' written. 'Your Voice' is greyed out, while 'Powered Teleprompter' is in solid black."
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} id="features" className="py-20 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Built for
              <span className="text-primary glow-text"> natural delivery</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No complicated setup. Just paste your script, hit start, and speak.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                //Added hover effects, may want to blur this more
                className="bg-card outline outline-1 outline-[#253B5C] rounded-xl p-6 space-y-3 hover:border-primary transition-colors duration-300 hover:outline-4 hover:bg-[#242D41] hover:outline-[#26D2FF] hover:shadow-[0_0_15px_5px_#242D41]"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              For
              <span className="text-primary glow-text"> anyone </span>
              who speaks on
              <span className="text-primary glow-text"> camera</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                //Animation from https://ibelick.com/blog/create-shine-effect-on-card-with-tailwind-css
                className="bg-card border border-border rounded-xl p-5 space-y-2 text-center hover:border-primary shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]
                  relative overflow-hidden
                  shadow-2xl
                  max-w-md
                  bg-no-repeat
                  bg-[length:250%_250%]
                  bg-[position:-100%_0]
                  transition-[background-position]
                  hover:bg-[position:200%_0]
                  hover:duration-[1300ms]"
              style={{
                backgroundImage: `linear-gradient(
                  45deg,
                  transparent 20%,
                  transparent 40%,
                  rgba(68,68,68,0.2) 50%,
                  rgba(68,68,68,0.2) 55%,
                  transparent 70%,
                  transparent 100%
                )`
              }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <audience.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{audience.title}</h3>
                <p className="text-xs text-muted-foreground">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Whether you…
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 bg-card border border-border hover:border-primary rounded-lg px-5 py-4 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]
              
              relative overflow-hidden
                  shadow-2xl
                  max-w-md
                  bg-no-repeat
                  bg-[length:250%_250%]
                  bg-[position:-100%_0]
                  transition-[background-position]
                  hover:bg-[position:200%_0]
                  hover:duration-[1300ms]"
              style={{
                backgroundImage: `linear-gradient(
                  45deg,
                  transparent 20%,
                  transparent 40%,
                  rgba(68,68,68,0.2) 50%,
                  rgba(68,68,68,0.2) 55%,
                  transparent 70%,
                  transparent 100%
                )`
              }}
              >
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-foreground">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-3xl font-bold">
            <span className="text-3xl font-bold text-primary glow-text">FlowSpeak </span>
            helps you deliver your message with
            <span className="text-3xl font-bold text-primary glow-text"> confidence.</span>
          </p>
          <button
            onClick={() => navigate("/prompter")}
            className="bg-primary text-primary-foreground px-10 py-3.5 rounded-lg text-sm font-semibold hover:brightness-150 transition-all glow-button inline-flex items-center gap-2"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-primary" />
            <span>FlowSpeak</span>
          </div>
          <span>100% private. Runs entirely in your browser.</span>
        </div>
      </footer>

      <script src="../../script.js"></script>
    </div>
  );
};

export default LandingPage;
