// src/components/JWTDebugger.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Eye, EyeOff } from 'lucide-react';

interface JWTPayload {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  iat?: number;
  role?: string;
  [key: string]: any;
}

const JWTDebugger: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const [decodedToken, setDecodedToken] = useState<JWTPayload | null>(null);
  const [error, setError] = useState('');

  const parseJWT = (token: string): JWTPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid JWT format');
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error parsing JWT:', err);
      return null;
    }
  };

  const handleDecodeToken = () => {
    setError('');
    if (!jwtToken.trim()) {
      setError('Введіть JWT токен');
      return;
    }

    const decoded = parseJWT(jwtToken);
    if (!decoded) {
      setError('Невалідний JWT токен');
      return;
    }

    setDecodedToken(decoded);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isTokenExpired = (exp?: number) => {
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  };

  // Перевіряємо чи є токен в localStorage (для тестування)
  React.useEffect(() => {
    const storedUser = localStorage.getItem('cubic.auth.user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Current user data:', user);
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
  }, []);

  if (!showDebugger) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDebugger(true)}
            className="w-full"
          >
            <Code className="h-4 w-4 mr-2" />
            JWT Token Debugger
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">JWT Token Debugger</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDebugger(false)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">JWT Token:</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md text-xs font-mono"
            rows={3}
            placeholder="Вставте JWT токен тут..."
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
          />
        </div>

        <Button onClick={handleDecodeToken} className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          Декодувати токен
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {decodedToken && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Декодований токен</h3>
              <div className="flex space-x-2">
                <Badge 
                  variant={isTokenExpired(decodedToken.exp) ? 'destructive' : 'default'}
                >
                  {isTokenExpired(decodedToken.exp) ? 'Протермінований' : 'Активний'}
                </Badge>
                {decodedToken.role && (
                  <Badge variant="secondary">{decodedToken.role}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Основна інформація</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {decodedToken.email || 'N/A'}</div>
                  <div><strong>Ім'я:</strong> {decodedToken.name || 'N/A'}</div>
                  <div><strong>Subject:</strong> {decodedToken.sub || 'N/A'}</div>
                  <div><strong>Роль:</strong> {decodedToken.role || 'N/A'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Метадані токену</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Issuer:</strong> {decodedToken.iss || 'N/A'}</div>
                  <div><strong>Audience:</strong> {decodedToken.aud || 'N/A'}</div>
                  <div><strong>Виданий:</strong> {formatDate(decodedToken.iat)}</div>
                  <div><strong>Закінчується:</strong> {formatDate(decodedToken.exp)}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Повний payload</h4>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-64">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JWTDebugger;