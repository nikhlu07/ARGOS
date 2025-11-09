import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Zap, Shield, Code, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Docs() {
  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      items: [
        'What is ARGOS?',
        'Quick Start Guide',
        'Core Concepts',
        'Terminology',
      ],
    },
    {
      icon: Zap,
      title: 'Architecture',
      items: [
        'Neural Layers Overview',
        'ION Node Design',
        'Consensus Mechanism',
        'UMA Integration',
      ],
    },
    {
      icon: Code,
      title: 'For Developers',
      items: [
        'API Reference',
        'Integration Guide',
        'Smart Contract Docs',
        'WebSocket Events',
      ],
    },
    {
      icon: Shield,
      title: 'Security',
      items: [
        'Cryptoeconomic Model',
        'Attack Vectors',
        'Audit Reports',
        'Best Practices',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to understand and build with ARGOS
          </p>
        </motion.div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-elevated h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item}>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sample Documentation Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">What is ARGOS?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                ARGOS (Adaptive Reputation-Gated Oracle System) is a revolutionary oracle protocol that
                combines swarm intelligence with cryptoeconomic security to deliver fast, accurate, and
                self-improving consensus.
              </p>

              <h3 className="font-display text-xl font-semibold mt-6 mb-3">The Problem</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional oracles force a choice between speed and security. Centralized price feeds are
                fast but vulnerable. Decentralized systems like UMA are secure but slow. ARGOS solves both.
              </p>

              <h3 className="font-display text-xl font-semibold mt-6 mb-3">The Solution</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Instant Provisional Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Get predictions in 340ms with measurable confidence. Markets can react immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Cryptoeconomic Finality</h4>
                    <p className="text-sm text-muted-foreground">
                      UMA provides final arbitration after 48 hours. Wrong predictions are slashed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Self-Improving Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Nodes evolve through natural selection. The network gets more accurate over time.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-display text-xl font-semibold mt-6 mb-3">How It Works</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ARGOS operates through a five-phase evolutionary loop:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>SIGNAL</strong>: Query is broadcast to the network</li>
                <li><strong>SWARM</strong>: ION nodes independently predict outcomes</li>
                <li><strong>CONSENSUS</strong>: Network calculates weighted consensus</li>
                <li><strong>ANCHOR</strong>: UMA provides economic finality</li>
                <li><strong>EVOLVE</strong>: Nodes are rewarded or slashed based on accuracy</li>
              </ol>

              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  📚 <strong>Next Steps:</strong> Explore the Architecture section to understand the neural
                  layers, or jump to the Developer Guide to start building.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
