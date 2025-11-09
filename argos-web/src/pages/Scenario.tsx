import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function Scenario() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const phases = [
    {
      name: 'SIGNAL',
      title: 'Query Broadcast',
      time: 'T+0ms',
      description: 'The question "Will BTC close above $95,000 today?" is broadcast to the swarm.',
      content: (
        <div className="space-y-4">
          <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-lg font-display font-semibold mb-2">Query Question:</p>
            <p className="text-xl">"Will BTC close above $95,000 today?"</p>
            <div className="flex gap-2 mt-4">
              <Badge>Category: Crypto</Badge>
              <Badge variant="outline">Market Prediction</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'SWARM',
      title: 'Parallel Prediction',
      time: 'T+100-340ms',
      description: 'Four ION nodes independently analyze and submit their predictions.',
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: 'CryptoVision', outcome: 'Yes', confidence: 0.92, stake: 5000 },
            { name: 'MarketOracle', outcome: 'Yes', confidence: 0.87, stake: 3000 },
            { name: 'PricePredict', outcome: 'No', confidence: 0.65, stake: 2000 },
            { name: 'ChainAnalyst', outcome: 'Yes', confidence: 0.78, stake: 4000 },
          ].map((node) => (
            <motion.div
              key={node.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-elevated">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{node.name}</CardTitle>
                    <Badge variant={node.outcome === 'Yes' ? 'default' : 'secondary'}>
                      {node.outcome}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{(node.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={node.confidence * 100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stake</span>
                    <span className="font-medium">${node.stake.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      name: 'CONSENSUS',
      title: 'Instant Aggregation',
      time: 'T+340ms',
      description: 'The network calculates weighted consensus based on confidence and stake.',
      content: (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Consensus Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Yes Votes (Weighted)</span>
                    <span className="font-medium">87.4%</span>
                  </div>
                  <Progress value={87.4} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>No Votes (Weighted)</span>
                    <span className="font-medium">12.6%</span>
                  </div>
                  <Progress value={12.6} className="h-3 bg-muted" />
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-lg">Network Confidence</span>
                  <span className="text-2xl font-display font-bold text-primary">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      name: 'ANCHOR',
      title: 'Provisional Result',
      time: 'T+340ms',
      description: 'Markets can react to the provisional result while waiting for UMA verification.',
      content: (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-gradient-to-br from-evolve-green/20 to-evolve-green/5 rounded-lg border-2 border-evolve-green/30 text-center"
          >
            <Badge className="mb-4">Provisional Result</Badge>
            <div className="text-4xl font-display font-bold mb-2">YES</div>
            <p className="text-muted-foreground">
              BTC will likely close above $95,000 today
            </p>
            <div className="flex justify-center gap-4 mt-6 text-sm">
              <div>
                <div className="text-muted-foreground">Confidence</div>
                <div className="font-display font-bold text-xl text-primary">89%</div>
              </div>
              <div className="border-l border-border" />
              <div>
                <div className="text-muted-foreground">Finalization</div>
                <div className="font-display font-bold text-xl">48h</div>
              </div>
            </div>
          </motion.div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What happens now?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ Markets can react to this provisional result</p>
              <p>✓ UMA dispute window begins (48 hours)</p>
              <p>✓ Anyone can challenge with economic stake</p>
              <p>✓ Nodes await final verdict for reputation update</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      name: 'EVOLVE',
      title: 'Evolution',
      time: 'T+48h+1m',
      description: 'UMA confirms the result. Nodes are rewarded or slashed. The network evolves.',
      content: (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>UMA Verdict</CardTitle>
                <Badge className="bg-evolve-green text-white">Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-display font-semibold mb-2">
                Final Result: <span className="text-primary">YES</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Economic consensus validates the provisional result. Network was correct.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'CryptoVision', prediction: 'Yes', change: +5, color: 'text-evolve-green' },
              { name: 'MarketOracle', prediction: 'Yes', change: +4, color: 'text-evolve-green' },
              { name: 'PricePredict', prediction: 'No', change: -8, color: 'text-fallen-red' },
              { name: 'ChainAnalyst', prediction: 'Yes', change: +3, color: 'text-evolve-green' },
            ].map((node) => (
              <Card key={node.name} className="card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{node.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reputation Change</span>
                    <span className={`font-display font-bold text-lg ${node.color}`}>
                      {node.change > 0 ? '+' : ''}
                      {node.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network Evolution</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ Correct predictions rewarded with reputation</p>
              <p>✓ Incorrect predictions lose reputation and stake</p>
              <p>✓ Network becomes more accurate over time</p>
              <p>✓ Natural selection favors the best predictors</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  const nextPhase = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const restart = () => {
    setCurrentPhase(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold mb-4">
            Prophecy of Price
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Watch how ARGOS processes a real-world prediction through all five phases
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={restart}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {phases.map((phase, index) => (
              <button
                key={phase.name}
                onClick={() => setCurrentPhase(index)}
                className={`flex-1 text-center transition-all ${
                  index === currentPhase
                    ? 'text-primary font-semibold'
                    : index < currentPhase
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="text-xs mb-1">{phase.name}</div>
                <div
                  className={`h-1 rounded-full transition-all ${
                    index <= currentPhase ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Phase {currentPhase + 1}
                    </Badge>
                    <CardTitle className="text-2xl font-display">
                      {phases[currentPhase].title}
                    </CardTitle>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {phases[currentPhase].time}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{phases[currentPhase].description}</p>
              </CardHeader>
              <CardContent>{phases[currentPhase].content}</CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevPhase}
            disabled={currentPhase === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={nextPhase}
            disabled={currentPhase === phases.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
