import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Activity, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Nodes() {
  const { user } = useAuth();
  const { nodes } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reputation');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredNodes = nodes
    .filter((node) => {
      const matchesSearch =
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'reputation':
          return b.reputation - a.reputation;
        case 'accuracy':
          return b.accuracyRate - a.accuracyRate;
        case 'predictions':
          return b.totalPredictions - a.totalPredictions;
        default:
          return 0;
      }
    });

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return 'text-evolve-green';
    if (reputation >= 60) return 'text-primary';
    if (reputation >= 40) return 'text-provisional-amber';
    return 'text-fallen-red';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-evolve-green/10 text-evolve-green border-evolve-green/20',
      paused: 'bg-provisional-amber/10 text-provisional-amber border-provisional-amber/20',
      inactive: 'bg-muted text-muted-foreground',
      slashed: 'bg-fallen-red/10 text-fallen-red border-fallen-red/20',
    };
    return variants[status] || variants.inactive;
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Node Explorer</h1>
              <p className="text-muted-foreground">
                Discover and analyze ION nodes across the network
              </p>
            </div>
            {user?.role !== 'viewer' && (
              <Button className="glow-hover">
                <Plus className="mr-2 w-4 h-4" />
                Deploy New Node
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reputation">Reputation</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="predictions">Total Predictions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Node Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Node Leaderboard</CardTitle>
            <CardDescription>
              {filteredNodes.length} nodes • Sorted by {sortBy}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Node ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Domains</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Predictions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNodes.map((node, index) => (
                    <TableRow
                      key={node.id}
                      className={
                        user?.nodeIds.includes(node.id)
                          ? 'bg-primary/5 border-l-2 border-l-primary'
                          : ''
                      }
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {node.id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{node.name}</span>
                          {user?.nodeIds.includes(node.id) && (
                            <Badge variant="outline" className="text-xs">
                              Yours
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-display font-bold ${getReputationColor(node.reputation)}`}>
                            {node.reputation}
                          </span>
                          {node.reputationHistory.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              {node.reputationHistory[node.reputationHistory.length - 1].value >
                              node.reputationHistory[node.reputationHistory.length - 2].value ? (
                                <TrendingUp className="w-3 h-3 text-evolve-green inline" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-fallen-red inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {node.domains.map((domain) => (
                            <Badge key={domain} variant="secondary" className="text-xs">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {(node.accuracyRate * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {node.totalPredictions}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(node.status)}>
                          {node.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Network Analytics */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Active Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-primary">
                {nodes.filter((n) => n.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {((nodes.filter((n) => n.status === 'active').length / nodes.length) * 100).toFixed(1)}% of network
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-evolve-green">
                {(
                  (nodes.reduce((sum, n) => sum + n.accuracyRate, 0) / nodes.length) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-sm text-muted-foreground mt-1">Across all nodes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">
                {nodes.reduce((sum, n) => sum + n.totalPredictions, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Network-wide</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
