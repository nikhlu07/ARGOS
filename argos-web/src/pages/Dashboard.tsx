import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { queries, nodes, networkStats } = useData();

  const userNodes = nodes.filter(n => user?.nodeIds.includes(n.id));
  const recentQueries = queries.slice(0, 10);

  const stats = [
    {
      title: 'Your Nodes',
      value: userNodes.length,
      icon: Activity,
      color: 'text-primary',
      trend: '+2',
    },
    {
      title: 'Active Queries',
      value: queries.filter(q => q.status === 'active').length,
      icon: Clock,
      color: 'text-provisional-amber',
    },
    {
      title: 'Network Reputation',
      value: user?.reputation || 0,
      icon: TrendingUp,
      color: 'text-evolve-green',
      trend: '+5%',
    },
    {
      title: 'Network Uptime',
      value: `${networkStats.uptime}%`,
      icon: CheckCircle,
      color: 'text-evolve-green',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-provisional-amber/10 text-provisional-amber border-provisional-amber/20';
      case 'provisional':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'finalized':
        return 'bg-evolve-green/10 text-evolve-green border-evolve-green/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {user?.role}
            </Badge>
            <span className="text-muted-foreground">
              Member since {new Date(user?.joinedAt || 0).toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-evolve-green">{stat.trend}</span> from last period
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Query Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Query Feed</CardTitle>
                    <CardDescription>Recent predictions from the network</CardDescription>
                  </div>
                  <Zap className="w-5 h-5 text-primary pulse-glow" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQueries.map((query, index) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{query.question}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {query.category}
                            </Badge>
                            <span>{new Date(query.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(query.status)}>
                          {query.status}
                        </Badge>
                      </div>
                      {query.provisionalResult && (
                        <div className="mt-2 p-2 rounded bg-muted/30">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Result:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{query.provisionalResult.outcome}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(query.provisionalResult.confidence * 100).toFixed(1)}% confidence)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {recentQueries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No queries yet. The swarm is waiting...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Network Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Network Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Nodes</span>
                  <span className="font-display font-semibold">{networkStats.totalNodes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Nodes</span>
                  <span className="font-display font-semibold text-evolve-green">
                    {networkStats.activeNodes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Queries Today</span>
                  <span className="font-display font-semibold">{networkStats.queriesToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Accuracy</span>
                  <span className="font-display font-semibold text-primary">
                    {(networkStats.avgAccuracy * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Your Nodes */}
            {user?.role !== 'viewer' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Nodes</CardTitle>
                    <Link to="/nodes">
                      <Button size="sm" variant="outline">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {userNodes.length > 0 ? (
                    <div className="space-y-3">
                      {userNodes.slice(0, 3).map((node) => (
                        <div key={node.id} className="p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{node.name}</span>
                            <Badge
                              variant={node.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {node.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Reputation: {node.reputation}</span>
                            <span>{(node.accuracyRate * 100).toFixed(1)}% accurate</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-3">No nodes deployed yet</p>
                      <Link to="/nodes">
                        <Button size="sm">Deploy Your First Node</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/nodes">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 w-4 h-4" />
                    Explore Nodes
                  </Button>
                </Link>
                <Link to="/scenario">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="mr-2 w-4 h-4" />
                    Watch Demo
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Read Docs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
