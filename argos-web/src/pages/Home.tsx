import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Shield, TrendingUp, ArrowRight, Layers, Brain, Target, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import DotGlobeHeroDemo from './demo/globe-hero-demo';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Instant Provisional Results',
      description: 'Get predictions in 340ms with high confidence. Markets react before the final verdict.',
    },
    {
      icon: Shield,
      title: 'Cryptoeconomic Security',
      description: 'UMA provides final arbitration. Wrong predictions are slashed. Truth always wins.',
    },
    {
      icon: TrendingUp,
      title: 'Self-Improving Network',
      description: 'Nodes evolve through natural selection. Winners gain reputation, losers lose stake.',
    },
    {
      icon: Brain,
      title: 'Swarm Intelligence',
      description: 'Weighted consensus from specialized agents. Diversity creates resilience.',
    },
  ];

  const phases = [
    {
      phase: '1. SIGNAL',
      title: 'Query Broadcast',
      description: 'Question reaches the swarm within milliseconds',
      time: 'T+0ms',
    },
    {
      phase: '2. SWARM',
      title: 'Parallel Prediction',
      description: 'ION nodes analyze and submit weighted predictions',
      time: 'T+100-340ms',
    },
    {
      phase: '3. CONSENSUS',
      title: 'Instant Aggregation',
      description: 'Network calculates confidence-weighted consensus',
      time: 'T+340ms',
    },
    {
      phase: '4. ANCHOR',
      title: 'UMA Verification',
      description: 'Economic consensus validates the truth',
      time: 'T+48h',
    },
    {
      phase: '5. EVOLVE',
      title: 'Reputation Update',
      description: 'Nodes are rewarded or slashed. The network learns.',
      time: 'T+48h+1m',
    },
  ];

  const layers = [
    {
      icon: Activity,
      title: 'Neural Layer',
      description: 'ION nodes - Independent Oracle Neurons that predict, compete, and evolve',
    },
    {
      icon: Target,
      title: 'Consensus Layer',
      description: 'Weighted aggregation creates provisional results with measurable confidence',
    },
    {
      icon: Shield,
      title: 'Anchor Layer',
      description: 'UMA provides cryptoeconomic finality for dispute resolution',
    },
    {
      icon: TrendingUp,
      title: 'Evolution Layer',
      description: 'Reputation system rewards accuracy and punishes deception',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <DotGlobeHeroDemo />

      {/* Problem Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">The Oracle Singularity Problem</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Traditional oracles force you to choose between speed and security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="card-elevated">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle>Secure Oracles</CardTitle>
                <CardDescription>Slow and expensive</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Systems like UMA provide strong cryptoeconomic guarantees but require 48-hour dispute windows. 
                  Markets can't wait.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-provisional-amber/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-provisional-amber" />
                </div>
                <CardTitle>Fast Oracles</CardTitle>
                <CardDescription>Vulnerable to attacks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Centralized price feeds deliver instant data but create single points of failure and manipulation vectors.
                </p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-block px-4 py-2 rounded-lg bg-primary/10 border-2 border-primary/20">
              <p className="text-lg font-display font-semibold text-primary">
                ARGOS solves both: Fast provisional results + Economic finality
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">Four Core Innovations</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Evolution, not revolution
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-elevated h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Five phases of evolutionary consensus
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-elevated">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs text-primary font-medium mb-1">{phase.phase}</div>
                            <CardTitle className="text-lg">{phase.title}</CardTitle>
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">{phase.time}</div>
                        </div>
                        <CardDescription>{phase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/scenario">
              <Button size="lg" variant="outline">
                Watch Full Demo Scenario
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">Neural Architecture</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four layers working in harmony
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-elevated h-full text-center">
                  <CardHeader>
                    <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <layer.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{layer.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{layer.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl font-bold mb-4">Join the Evolution</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Deploy your first ION node and become part of the swarm intelligence network
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="glow-hover">
                  Deploy Your First Node
                  <Activity className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline">
                  Read Documentation
                </Button>
              </Link>
              <Link to="/pitch-deck">
                <Button size="lg" variant="outline">
                  View Pitch Deck
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
