import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'operator' | 'viewer' | 'admin';
  nodeIds: string[];
  joinedAt: number;
  reputation: number;
  avatarColor: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: 'operator' | 'viewer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for authentication
const DEMO_USERS = [
  {
    email: 'viewer@argos.ai',
    password: 'viewer123',
    name: 'Alex Viewer',
    role: 'viewer' as const,
    nodeIds: []
  },
  {
    email: 'operator@argos.ai',
    password: 'operator123',
    name: 'Morgan Operator',
    role: 'operator' as const,
    nodeIds: ['ION-001', 'ION-015', 'ION-042']
  },
  {
    email: 'admin@argos.ai',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin' as const,
    nodeIds: ['ION-PRIME']
  }
];

const AVATAR_COLORS = ['#2EE9E2', '#00B894', '#FFC300', '#D83A56', '#6C5CE7', '#A29BFE'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!demoUser) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    const loggedInUser: User = {
      id: `user-${Date.now()}`,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      nodeIds: demoUser.nodeIds,
      joinedAt: Date.now(),
      reputation: demoUser.role === 'admin' ? 100 : Math.floor(Math.random() * 50) + 50,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    setUser(loggedInUser);
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string, role: 'operator' | 'viewer') => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    if (DEMO_USERS.some(u => u.email === email)) {
      setIsLoading(false);
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      nodeIds: [],
      joinedAt: Date.now(),
      reputation: 50,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
