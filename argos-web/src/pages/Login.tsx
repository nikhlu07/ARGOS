import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParticleSphere } from '@/components/ParticleSphere';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    const from = (location.state as any)?.from || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      const from = (location.state as any)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    }
  };

  const demoCredentials = [
    { role: 'Viewer', email: 'viewer@argos.ai', password: 'viewer123' },
    { role: 'Operator', email: 'operator@argos.ai', password: 'operator123' },
    { role: 'Admin', email: 'admin@argos.ai', password: 'admin123' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-2xl mb-8">
            <Activity className="w-7 h-7 text-primary" />
            <span>ARGOS</span>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>Enter the swarm intelligence network</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entering...' : 'Enter the Swarm'}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {demoCredentials.map((cred) => (
                    <div key={cred.role} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="font-medium text-xs">{cred.role}</span>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <code>{cred.email}</code>
                        <span>/</span>
                        <code>{cred.password}</code>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  New operator?{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Deploy your first node
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right Side - Visualization */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 to-background items-center justify-center p-8"
      >
        <div className="w-full h-full max-w-2xl max-h-[600px]">
          <ParticleSphere />
        </div>
      </motion.div>
    </div>
  );
}
