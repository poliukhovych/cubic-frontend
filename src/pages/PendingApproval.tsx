// src/pages/PendingApproval.tsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Mail } from "lucide-react";
import { useAuth } from "@/types/auth";
import { useNavigate } from "react-router-dom";

const PendingApproval: React.FC = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="glasscard text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Очікування схвалення</CardTitle>
            <CardDescription>
              Ваша заявка на реєстрацію відправлена
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Заявка відправлена</h4>
                  <p className="text-sm text-muted-foreground">
                    Ваші дані успішно надіслано адміністратору
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Очікування розгляду</h4>
                  <p className="text-sm text-muted-foreground">
                    Адміністратор має схвалити вашу заявку. Зазвичай це займає до 1 робочого дня
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Сповіщення на email</h4>
                  <p className="text-sm text-muted-foreground">
                    Ви отримаєте email-повідомлення після схвалення
                  </p>
                  {user?.email && (
                    <p className="text-sm text-primary font-mono mt-1">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="w-full"
              >
                Вийти
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
