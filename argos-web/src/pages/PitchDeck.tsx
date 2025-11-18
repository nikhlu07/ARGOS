import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Zap, 
  Shield, 
  Activity, 
  Network, 
  Scale, 
  Target,
  Globe,
  Cpu,
  GitBranch,
  Users,
  Play,
  Clock,
  TrendingUp
} from 'lucide-react';

// --- Constants & Data ---

const SLIDES = [
  { id: 'cover', title: 'Cover' },
  { id: 'problem', title: 'The Problem' },
  { id: 'solution', title: 'The Solution' },
  { id: 'innovations', title: 'Core Innovations' },
  { id: 'how-it-works', title: 'The Loop' },
  { id: 'live-network', title: 'Live Network' },
  { id: 'architecture', title: 'Neural Architecture' },
  { id: 'roadmap', title: 'Roadmap' },
  { id: 'cta', title: 'Join the Evolution' }
];

const THEME = {
  primary: 'text-orange-500',
  bgPrimary: 'bg-orange-500',
  borderPrimary: 'border-orange-500',
  gradient: 'from-orange-500 to-red-600'
};

// --- Components ---

const SlideContainer = ({ children, isActive }) => (
  <div 
    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${
      isActive ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-8 z-0 pointer-events-none'
    }`}
  >
    <div className="h-full w-full overflow-hidden flex flex-col relative bg-neutral-950 text-white p-8 md:p-16">
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <BrainCircuit size={200} className="text-neutral-800" />
      </div>
      {children}
    </div>
  </div>
);

// 1. Cover Slide
const CoverSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="flex flex-col justify-center h-full max-w-4xl z-10">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-orange-500/10 border border-orange-500/20`}>
          <Activity className="text-orange-500 w-12 h-12" />
        </div>
        <span className="text-2xl font-bold tracking-wider text-neutral-400">ARGOS PROTOCOL</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
        WHERE TRUTH <br />
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${THEME.gradient}`}>
          EVOLVES
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl leading-relaxed mb-12">
        A self-evolving, swarm-intelligence oracle network. <br/>
        Born from the intersection of cryptoeconomics and emergent AI.
      </p>
      
      <div className="grid grid-cols-3 gap-8 text-center max-w-2xl">
        <div>
          <p className="text-4xl font-bold text-orange-500">1,024</p>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">Active Nodes</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-orange-500">98.7%</p>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">Avg. Accuracy</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-orange-500">2.1M+</p>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">Predictions</p>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 2. Problem Slide
const ProblemSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">The Challenge</h2>
        <h3 className="text-4xl md:text-5xl font-bold">The Oracle Singularity Problem</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow items-center">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-blue-400" size={28} />
              <h4 className="text-xl font-bold">Secure Oracles</h4>
            </div>
            <p className="text-neutral-400">
              UMA's Optimistic Oracle represents <span className="text-white font-semibold">absolute truth</span>. 
              But truth delayed is truth denied. 
              <span className="block mt-2 text-red-400 font-mono">Latency: 24-48 hours</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-yellow-400" size={28} />
              <h4 className="text-xl font-bold">Fast Oracles</h4>
            </div>
            <p className="text-neutral-400">
              Centralized APIs provide <span className="text-white font-semibold">instant answers</span> but are fragile and opaque.
              <span className="block mt-2 text-red-400 font-mono">Risk: Single Point of Failure</span>
            </p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center items-center text-center p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent rounded-3xl -z-10" />
          <h4 className="text-3xl font-bold mb-6">The Deeper Problem</h4>
          <p className="text-xl text-neutral-300 leading-relaxed">
            "Oracles don't evolve. <br/>
            There's no memory, no learning, no adaptation.<br/>
            We're building the future of finance on systems that can't get smarter."
          </p>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 3. Solution Slide
const SolutionSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col justify-center">
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">The Solution</h2>
        <h3 className="text-4xl md:text-5xl font-bold">Darwinian Truth Discovery</h3>
        <p className="text-neutral-400 max-w-2xl mx-auto mt-4">
          Argos combines the speed of AI with the security of economic guarantees, creating a system that learns and improves over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/50">
          <div className="p-4 bg-orange-500/10 rounded-full mb-4">
            <Users className="text-orange-500" size={32} />
          </div>
          <h4 className="text-2xl font-bold mb-2">The Arena</h4>
          <p className="text-neutral-400">A competitive environment where AI agents (IONs) stake reputation and funds to provide fast, accurate answers.</p>
        </div>
        
        <div className="flex flex-col items-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/50">
          <div className="p-4 bg-blue-500/10 rounded-full mb-4">
            <Shield className="text-blue-500" size={32} />
          </div>
          <h4 className="text-2xl font-bold mb-2">The Judge</h4>
          <p className="text-neutral-400">UMA's Optimistic Oracle acts as the ultimate arbiter, resolving disputes and ensuring the network's long-term integrity.</p>
        </div>

        <div className="flex flex-col items-center p-6 border border-neutral-800 rounded-2xl bg-neutral-900/50">
          <div className="p-4 bg-green-500/10 rounded-full mb-4">
            <GitBranch className="text-green-500" size={32} />
          </div>
          <h4 className="text-2xl font-bold mb-2">The Evolution</h4>
          <p className="text-neutral-400">Successful IONs are rewarded, while inaccurate ones are penalized. This continuous feedback loop drives the network to become smarter and more reliable.</p>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 4. Innovations Slide
const InnovationsSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Core Technology</h2>
        <h3 className="text-4xl md:text-5xl font-bold">Four Pillars of ARGOS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-start text-left">
          <div className="p-3 bg-orange-500/10 rounded-xl mb-4">
            <BrainCircuit className="text-orange-500" size={28} />
          </div>
          <h4 className="text-xl font-bold mb-2">Evolutionary Swarm Intelligence</h4>
          <p className="text-neutral-400">A decentralized network of AI agents, each with unique strategies, compete to provide answers. The most successful strategies are rewarded and replicated, creating a system that constantly adapts and improves.</p>
        </div>

        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-start text-left">
          <div className="p-3 bg-purple-500/10 rounded-xl mb-4">
            <Target className="text-purple-500" size={28} />
          </div>
          <h4 className="text-xl font-bold mb-2">Hyperdimensional Reputation</h4>
          <p className="text-neutral-400">Reputation is not a single score but a multi-faceted vector, tracking performance across various domains (e.g., crypto prices, sports outcomes) to identify and reward specialized expertise.</p>
        </div>

        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-start text-left">
          <div className="p-3 bg-green-500/10 rounded-xl mb-4">
            <Clock className="text-green-500" size={28} />
          </div>
          <h4 className="text-xl font-bold mb-2">Instant Provisional Reality</h4>
          <p className="text-neutral-400">Get high-confidence answers in milliseconds. The network provides a provisional truth based on the swarm's consensus, which can be used immediately while economic finality is achieved in the background.</p>
        </div>

        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-start text-left">
          <div className="p-3 bg-blue-500/10 rounded-xl mb-4">
            <Shield className="text-blue-500" size={28} />
          </div>
          <h4 className="text-xl font-bold mb-2">UMA-Anchored Security</h4>
          <p className="text-neutral-400">The entire system is anchored to UMA's battle-tested optimistic oracle, providing a powerful economic backstop that guarantees correctness and disciplines the AI swarm.</p>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 5. Loop Slide (How it works)
const LoopSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col justify-center items-center relative">
      <div className="absolute top-0 left-0">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Process Flow</h2>
        <h3 className="text-4xl font-bold">The Evolutionary Loop</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 mt-12">
        {[
          { step: "1", title: "SIGNAL", desc: "Market emits a query", icon: Network },
          { step: "2", title: "SWARM", desc: "1,000+ AI Nodes compete", icon: Users },
          { step: "3", title: "CONSENSUS", desc: "Weighted Truth (340ms)", icon: Scale },
          { step: "4", title: "ANCHOR", desc: "UMA Finalizes (48h)", icon: Shield },
          { step: "5", title: "EVOLVE", desc: "Reward / Slash nodes", icon: GitBranch }
        ].map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center text-center group relative">
              <div className="w-20 h-20 rounded-2xl bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center mb-4 group-hover:border-orange-500 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300 z-10">
                <item.icon className="text-neutral-400 group-hover:text-orange-500" size={32} />
              </div>
              <div className="bg-neutral-900 px-3 py-1 rounded text-xs font-mono text-orange-500 mb-2">Phase {item.step}</div>
              <h4 className="text-lg font-bold mb-1">{item.title}</h4>
              <p className="text-xs text-neutral-500 max-w-[120px]">{item.desc}</p>
            </div>
            {idx < 4 && (
              <div className="hidden md:block w-8 h-0.5 bg-neutral-800 relative -top-12">
                <div className="absolute right-0 -top-1.5 text-neutral-800">
                  <ArrowRight size={16} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-16 p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl max-w-2xl text-center">
        <p className="text-neutral-300 italic">
          "The network has learned. Next time, the failed node's voice is quieter. The system has adapted."
        </p>
      </div>
    </div>
  </SlideContainer>
);

// 6. Live Network Slide
const LiveNetworkSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Live Snapshot</h2>
        <h3 className="text-4xl md:text-5xl font-bold">The Swarm in Action</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
        <div className="md:col-span-2 p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <h4 className="text-xl font-bold mb-4">Node Leaderboard</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-sm text-neutral-500 px-4">
              <span>NODE</span>
              <span className="text-right">REPUTATION</span>
              <span className="text-right">ACCURACY</span>
              <span>DOMAINS</span>
            </div>
            {[
              { name: 'QuantumLeap', reputation: 98.2, accuracy: '99.1%', domains: ['Crypto', 'DeFi'] },
              { name: 'OraclePrime', reputation: 97.5, accuracy: '98.5%', domains: ['Sports', 'Weather'] },
              { name: 'DataWeaver', reputation: 96.9, accuracy: '99.4%', domains: ['Crypto', 'Stocks'] },
              { name: 'TruthSeeker', reputation: 95.8, accuracy: '97.9%', domains: ['Geopolitics'] },
            ].map(node => (
              <div key={node.name} className="grid grid-cols-4 gap-4 items-center bg-neutral-800/50 p-4 rounded-lg">
                <span className="font-bold">{node.name}</span>
                <span className="text-right font-mono text-orange-400">{node.reputation}</span>
                <span className="text-right font-mono text-green-400">{node.accuracy}</span>
                <div className="flex flex-wrap gap-1">
                  {node.domains.map(d => <span key={d} className="text-xs bg-neutral-700 px-2 py-1 rounded-full">{d}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <h4 className="text-lg font-bold text-neutral-300 mb-2">Total Active Nodes</h4>
            <p className="text-4xl font-bold text-orange-500">1,024</p>
          </div>
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <h4 className="text-lg font-bold text-neutral-300 mb-2">Network Accuracy</h4>
            <p className="text-4xl font-bold text-orange-500">98.7%</p>
          </div>
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <h4 className="text-lg font-bold text-neutral-300 mb-2">Total Predictions</h4>
            <p className="text-4xl font-bold text-orange-500">2.1M+</p>
          </div>
        </div>
      </div>
    </div>
  </SlideContainer>
);


// 7. Architecture Slide
const ArchitectureSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
     <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Tech Stack</h2>
        <h3 className="text-4xl md:text-5xl font-bold">Neural Architecture</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center p-6 bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="mr-6 p-4 bg-neutral-950 rounded-lg text-orange-500">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-orange-400">Layer 4: The Evolution Engine</h4>
            <p className="text-neutral-400 text-sm">Reputation Substrate. Multi-dimensional tracking, domain discovery, economic pruning.</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="mr-6 p-4 bg-neutral-950 rounded-lg text-blue-500">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-blue-400">Layer 3: The Truth Bridge</h4>
            <p className="text-neutral-400 text-sm">UMA Integration. Monitors finalization, triggers rewards/slashing.</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="mr-6 p-4 bg-neutral-950 rounded-lg text-purple-500">
            <Cpu size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-purple-400">Layer 2: The Consciousness Core</h4>
            <p className="text-neutral-400 text-sm">Aggregator Engine. Bayesian trust-weighting, adversarial filtering.</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="mr-6 p-4 bg-neutral-950 rounded-lg text-green-500">
            <Globe size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-green-400">Layer 1: The Sensory Network</h4>
            <p className="text-neutral-400 text-sm">ION Substrate. API aggregators, web scrapers, LLMs, Hybrid models.</p>
          </div>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 8. Roadmap Slide
const RoadmapSlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col">
      <div className="mb-12">
        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Timeline</h2>
        <h3 className="text-4xl md:text-5xl font-bold">Path to Singularity</h3>
      </div>

      <div className="relative border-l-2 border-neutral-800 ml-8 space-y-12">
        <div className="relative pl-8">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
          <h4 className="text-2xl font-bold text-white mb-2">Genesis Phase (Current)</h4>
          <ul className="text-neutral-400 space-y-1 list-disc pl-4">
            <li>Sample ION Implementations (Python agents)</li>
            <li>Aggregator Prototype & Reputation Substrate</li>
            <li>UMA Test Harness & Live Dashboard</li>
            <li>Network of 1,000+ active nodes</li>
          </ul>
        </div>

        <div className="relative pl-8 opacity-80">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-700" />
          <h4 className="text-xl font-bold text-white mb-2">Phase 1: Reputation Substrate</h4>
          <p className="text-neutral-500">On-Chain Reputation, Domain Specialization, Testnet Deployment.</p>
        </div>

        <div className="relative pl-8 opacity-60">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-800" />
          <h4 className="text-xl font-bold text-white mb-2">Phase 2: Permissionless Network</h4>
          <p className="text-neutral-500">Open ION deployment, Advanced Neural Weighting, Automated Stake Management.</p>
        </div>

        <div className="relative pl-8 opacity-40">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-800" />
          <h4 className="text-xl font-bold text-white mb-2">Phase 3: Truth Observatory</h4>
          <p className="text-neutral-500">Predictive Precomputation, Cross-Chain Bridges (Solana, Cosmos).</p>
        </div>
      </div>
    </div>
  </SlideContainer>
);

// 9. CTA Slide
const CTASlide = ({ isActive }) => (
  <SlideContainer isActive={isActive}>
    <div className="h-full flex flex-col justify-center items-center text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 to-neutral-950 -z-10" />
      
      <Activity className="text-orange-500 mb-8 animate-pulse" size={80} />
      
      <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
        JOIN THE <br/>
        <span className="text-orange-500">EVOLUTION</span>
      </h2>
      
      <p className="text-xl text-neutral-400 max-w-2xl mb-12">
        We're building a system where truth isn't declared by authority, but discovered through competition.
        <br/><br/>
        The swarm is waiting.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="px-8 py-4 rounded-full bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
          <Play fill="currentColor" size={16} /> Start Building
        </button>
        <button className="px-8 py-4 rounded-full bg-neutral-800 border border-neutral-700 text-white font-bold text-lg hover:bg-neutral-700 transition-all">
          Read the Docs
        </button>
      </div>
      
      <div className="mt-16 flex gap-8 text-neutral-500">
        <span>github.com/argos</span>
        <span>•</span>
        <span>discord.gg/argos</span>
        <span>•</span>
        <span>@argos_oracle</span>
      </div>
    </div>
  </SlideContainer>
);

// --- Main Application ---

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="w-full h-screen bg-neutral-950 overflow-hidden font-sans text-neutral-50 selection:bg-orange-500/30">
      
      {/* Slides */}
      <div className="relative w-full h-full">
        <CoverSlide isActive={currentSlide === 0} />
        <ProblemSlide isActive={currentSlide === 1} />
        <SolutionSlide isActive={currentSlide === 2} />
        <InnovationsSlide isActive={currentSlide === 3} />
        <LoopSlide isActive={currentSlide === 4} />
        <LiveNetworkSlide isActive={currentSlide === 5} />
        <ArchitectureSlide isActive={currentSlide === 6} />
        <RoadmapSlide isActive={currentSlide === 7} />
        <CTASlide isActive={currentSlide === 8} />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-50 flex justify-between items-end pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <div className="text-orange-500 font-bold tracking-widest text-sm mb-2">ARGOS</div>
          <div className="text-neutral-600 text-xs">
            {SLIDES[currentSlide].title} ({currentSlide + 1}/{totalSlides})
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={prevSlide}
            className="p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-white hover:bg-neutral-800 transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 rounded-full bg-orange-500/80 border border-orange-400 text-white hover:bg-orange-600 transition-all backdrop-blur-sm shadow-lg shadow-orange-500/20"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-900 z-50">
        <div 
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PitchDeck;
