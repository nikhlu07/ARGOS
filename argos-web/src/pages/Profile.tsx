import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { nodes, queries } = useData();

  const userNodes = nodes.filter((n) => user?.nodeIds.includes(n.id));
  const userQueries = queries.filter((q) => q.submitterId === user?.id);

  const stats = [
    {
      title: 'Nodes Deployed',
      value: userNodes.length,
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: 'Queries Submitted',
      value: userQueries.length,
      icon: TrendingUp,
      color: 'text-evolve-green',
    },
    {
      title: 'Reputation',
      value: user?.reputation || 0,
      icon: Award,
      color: 'text-provisional-amber',
    },
    {
      title: 'Member Since',
      value: new Date(user?.joinedAt || 0).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: Calendar,
      color: 'text-synapse-gray',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24">
                  <AvatarFallback
                    style={{ backgroundColor: user?.avatarColor }}
                    className="text-3xl font-display font-bold text-white"
                  >
                    {user?.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-display text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-muted-foreground mb-3">{user?.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="capitalize">{user?.role}</Badge>
                    <Badge variant="outline">
                      {userNodes.filter((n) => n.status === 'active').length} Active Nodes
                    </Badge>
                    {user?.reputation && user.reputation >= 80 && (
                      <Badge className="bg-evolve-green/10 text-evolve-green border-evolve-green/20">
                        Top Operator
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Your Nodes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Nodes</CardTitle>
                  <CardDescription>{userNodes.length} total nodes</CardDescription>
                </div>
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
                  {userNodes.slice(0, 4).map((node) => (
                    <div
                      key={node.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{node.name}</span>
                        <Badge
                          variant={node.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {node.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Rep: {node.reputation}</span>
                        <span>{(node.accuracyRate * 100).toFixed(1)}% accurate</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">No nodes deployed yet</p>
                  <Link to="/nodes">
                    <Button size="sm">Deploy Your First Node</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userNodes.slice(0, 3).map((node, index) => (
                  <div key={node.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deployed {node.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(node.deployedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {userNodes.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    No activity yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your nodes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">Manage your API access</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
