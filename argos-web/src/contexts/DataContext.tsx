import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Node types
export interface Node {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  reputation: number;
  domains: string[];
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  stake: number;
  status: 'active' | 'paused' | 'inactive' | 'slashed';
  strategy: 'api' | 'scraper' | 'llm' | 'hybrid';
  deployedAt: number;
  reputationHistory: Array<{ timestamp: number; value: number }>;
  domainSpecialization: Record<string, number>;
}

export interface NodeResponse {
  nodeId: string;
  nodeName: string;
  outcome: string;
  confidence: number;
  stake: number;
  timestamp: number;
  reasoning?: string;
  correct?: boolean | null;
}

export interface Query {
  id: string;
  question: string;
  category: string;
  submitterId: string;
  submitterName: string;
  timestamp: number;
  status: 'active' | 'provisional' | 'finalized';
  provisionalResult: { outcome: string; confidence: number } | null;
  finalResult: { outcome: string; confidence: number } | null;
  finalizedAt: number | null;
  responses: NodeResponse[];
  umaVerdict: boolean | null;
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalQueries: number;
  queriesToday: number;
  avgConfidence: number;
  avgAccuracy: number;
  uptime: number;
  lastUpdated: number;
}

interface DataContextType {
  nodes: Node[];
  queries: Query[];
  networkStats: NetworkStats;
  addNode: (node: Partial<Node>) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  submitQuery: (question: string, category: string, submitterId: string, submitterName: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DOMAINS = ['crypto', 'sports', 'news', 'science', 'weather', 'politics'];
const STRATEGIES = ['api', 'scraper', 'llm', 'hybrid'] as const;

// Generate mock nodes
const generateMockNodes = (): Node[] => {
  const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
  const nodes: Node[] = [];

  for (let i = 0; i < 50; i++) {
    const totalPredictions = Math.floor(Math.random() * 500) + 100;
    const correctPredictions = Math.floor(totalPredictions * (0.75 + Math.random() * 0.23));
    const reputation = 50 + Math.floor(Math.random() * 50);
    
    const domainCount = Math.floor(Math.random() * 3) + 1;
    const nodeDomains = DOMAINS.sort(() => 0.5 - Math.random()).slice(0, domainCount);
    const domainSpecialization: Record<string, number> = {};
    nodeDomains.forEach(d => {
      domainSpecialization[d] = 0.7 + Math.random() * 0.3;
    });

    nodes.push({
      id: `ION-${String(i + 1).padStart(3, '0')}`,
      name: `${names[i % names.length]}-${Math.floor(i / names.length) + 1}`,
      ownerId: `user-${Math.floor(i / 3)}`,
      ownerName: `Operator ${Math.floor(i / 3)}`,
      reputation,
      domains: nodeDomains,
      totalPredictions,
      correctPredictions,
      accuracyRate: correctPredictions / totalPredictions,
      stake: Math.floor(Math.random() * 10000) + 1000,
      status: ['active', 'active', 'active', 'paused'][Math.floor(Math.random() * 4)] as any,
      strategy: STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)],
      deployedAt: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      reputationHistory: Array.from({ length: 30 }, (_, idx) => ({
        timestamp: Date.now() - (30 - idx) * 24 * 60 * 60 * 1000,
        value: reputation + Math.floor((Math.random() - 0.5) * 20),
      })),
      domainSpecialization,
    });
  }

  return nodes;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>(() => generateMockNodes());
  const [queries, setQueries] = useState<Query[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNodes: 50,
    activeNodes: 45,
    totalQueries: 0,
    queriesToday: 0,
    avgConfidence: 0.87,
    avgAccuracy: 0.92,
    uptime: 99.8,
    lastUpdated: Date.now(),
  });

  // Simulate new queries periodically
  useEffect(() => {
    const questions = [
      'Will BTC close above $95,000 today?',
      'Will the Lakers win their next game?',
      'Will inflation data exceed expectations?',
      'What will be the price of ETH at EOD?',
      'Will there be a major tech announcement this week?',
    ];

    const interval = setInterval(() => {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const category = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
      
      submitQuery(question, category, 'system', 'Network');
    }, 8000);

    return () => clearInterval(interval);
  }, [nodes]);

  const addNode = (nodeData: Partial<Node>) => {
    const newNode: Node = {
      id: `ION-${String(nodes.length + 1).padStart(3, '0')}`,
      name: nodeData.name || `Node-${nodes.length + 1}`,
      ownerId: nodeData.ownerId || 'unknown',
      ownerName: nodeData.ownerName || 'Unknown',
      reputation: 50,
      domains: nodeData.domains || ['crypto'],
      totalPredictions: 0,
      correctPredictions: 0,
      accuracyRate: 0,
      stake: nodeData.stake || 1000,
      status: 'active',
      strategy: nodeData.strategy || 'api',
      deployedAt: Date.now(),
      reputationHistory: [{ timestamp: Date.now(), value: 50 }],
      domainSpecialization: nodeData.domains?.reduce((acc, d) => ({ ...acc, [d]: 0.7 }), {}) || {},
    };

    setNodes([...nodes, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<Node>) => {
    setNodes(nodes.map(node => node.id === nodeId ? { ...node, ...updates } : node));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const submitQuery = (question: string, category: string, submitterId: string, submitterName: string) => {
    const queryId = `Q-${Date.now()}`;
    
    // Select 3-5 random nodes to respond
    const respondingNodes = nodes
      .filter(n => n.status === 'active' && n.domains.includes(category))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 3);

    const responses: NodeResponse[] = respondingNodes.map(node => ({
      nodeId: node.id,
      nodeName: node.name,
      outcome: Math.random() > 0.5 ? 'Yes' : 'No',
      confidence: 0.6 + Math.random() * 0.39,
      stake: node.stake,
      timestamp: Date.now() + Math.random() * 500,
      reasoning: 'Based on historical data and current trends',
      correct: null,
    }));

    // Calculate weighted consensus
    const totalWeight = responses.reduce((sum, r) => sum + (r.confidence * r.stake), 0);
    const yesWeight = responses.filter(r => r.outcome === 'Yes').reduce((sum, r) => sum + (r.confidence * r.stake), 0);
    const consensusConfidence = Math.max(yesWeight, totalWeight - yesWeight) / totalWeight;

    const newQuery: Query = {
      id: queryId,
      question,
      category,
      submitterId,
      submitterName,
      timestamp: Date.now(),
      status: 'active',
      provisionalResult: null,
      finalResult: null,
      finalizedAt: null,
      responses,
      umaVerdict: null,
    };

    setQueries(prev => [newQuery, ...prev]);

    // After 5 seconds, make provisional
    setTimeout(() => {
      setQueries(prev => prev.map(q => {
        if (q.id === queryId) {
          return {
            ...q,
            status: 'provisional',
            provisionalResult: {
              outcome: yesWeight > totalWeight / 2 ? 'Yes' : 'No',
              confidence: consensusConfidence,
            },
          };
        }
        return q;
      }));
    }, 5000);

    // After 15 seconds, finalize
    setTimeout(() => {
      setQueries(prev => prev.map(q => {
        if (q.id === queryId && q.provisionalResult) {
          const finalOutcome = Math.random() > 0.1 ? q.provisionalResult.outcome : (q.provisionalResult.outcome === 'Yes' ? 'No' : 'Yes');
          return {
            ...q,
            status: 'finalized',
            finalResult: {
              outcome: finalOutcome,
              confidence: 1,
            },
            finalizedAt: Date.now(),
            umaVerdict: finalOutcome === q.provisionalResult.outcome,
            responses: q.responses.map(r => ({
              ...r,
              correct: r.outcome === finalOutcome,
            })),
          };
        }
        return q;
      }));
    }, 15000);

    // Update stats
    setNetworkStats(prev => ({
      ...prev,
      totalQueries: prev.totalQueries + 1,
      queriesToday: prev.queriesToday + 1,
      lastUpdated: Date.now(),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        nodes,
        queries,
        networkStats,
        addNode,
        updateNode,
        deleteNode,
        submitQuery,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
