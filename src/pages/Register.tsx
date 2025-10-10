// src/pages/Register.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Register: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  return (
    <Card className="max-w-md mx-auto border-none bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle>Реєстрація</CardTitle>
        <CardDescription>
          Реєстрація відбувається через Google. Після входу виберіть свою роль.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          variant="default" 
          disabled={loading} 
          onClick={loginWithGoogle}
        >
          Продовжити з Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default Register;