// src/components/UserProfile.tsx
import React, { useState } from 'react';
import { useAuth } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Settings, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import ClassroomData from './ClassroomData';

const UserProfile: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [showClassroom, setShowClassroom] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleColor = (role?: string | null) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      case 'student': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role?: string | null) => {
    switch (role) {
      case 'admin': return 'Адміністратор';
      case 'teacher': return 'Викладач';
      case 'student': return 'Студент';
      default: return 'Невизначено';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активний';
      case 'pending_profile': return 'Очікує заповнення профілю';
      case 'pending_approval': return 'Очікує схвалення';
      case 'disabled': return 'Заблокований';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Профіль користувача</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={getRoleColor(user.role)} className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel(user.status)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClassroom(!showClassroom)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {showClassroom ? 'Сховати' : 'Показати'} Google Classroom
            </Button>
            
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Налаштування
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={loading}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Вийти
            </Button>
          </div>

          {user.role && ['teacher', 'admin'].includes(user.role) && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Додаткові можливості</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" className="justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Classroom
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Звіти та аналітика
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showClassroom && <ClassroomData />}
    </div>
  );
};

export default UserProfile;