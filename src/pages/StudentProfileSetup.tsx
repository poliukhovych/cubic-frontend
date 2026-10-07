// src/pages/StudentProfileSetup.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/types/auth";
import type { Group } from "@/types/students";

// ✅ FAKE API для груп
const fetchGroups = async (): Promise<Group[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "g1", name: "КН-41", type: "bachelor", course: 4 },
        { id: "g2", name: "КН-42", type: "bachelor", course: 4 },
        { id: "g3", name: "КН-43", type: "bachelor", course: 4 },
        { id: "g4", name: "КН-31", type: "bachelor", course: 3 },
        { id: "g5", name: "КН-32", type: "bachelor", course: 3 },
      ]);
    }, 300);
  });
};

const StudentProfileSetup: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    patronymic: "",
    groupId: "",
    subgroup: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load groups
    fetchGroups().then(setGroups);

    // Pre-fill from Google user data if available
    if (user) {
      const nameParts = user.name.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[1] || "",
        lastName: nameParts[0] || "",
        patronymic: nameParts[2] || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Введіть ім'я та прізвище");
      return;
    }

    if (!formData.groupId) {
      setError("Оберіть групу");
      return;
    }

    setSubmitting(true);

    try {
      console.log("[FAKE] Submitting student profile:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // В реальному проекті:
      // await api.post("/api/students/complete-profile", formData);

      // Redirect to pending approval page
      nav("/pending-approval", { replace: true });
    } catch (err) {
      setError("Помилка при відправці заявки. Спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  const selectedGroup = groups.find((g) => g.id === formData.groupId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glasscard">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Заповнення профілю</CardTitle>
            <CardDescription className="text-lg">
              Останній крок перед доступом до системи
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Прізвище <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Іванов"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ім'я <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Іван"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">По батькові</label>
                <Input
                  placeholder="Іванович (необов'язково)"
                  value={formData.patronymic}
                  onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                  className="input"
                />
              </div>

              {/* Group Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Група <span className="text-red-500">*</span>
                </label>
                <select
                  className="input w-full"
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  required
                >
                  <option value="">Оберіть групу</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.course} курс, {group.type === "bachelor" ? "Бакалавр" : "Магістр"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subgroup */}
              {selectedGroup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-sm font-medium mb-2 block">Підгрупа (якщо є)</label>
                  <div className="flex gap-2">
                    {["A", "B"].map((sub) => (
                      <Button
                        key={sub}
                        type="button"
                        variant={formData.subgroup === sub ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, subgroup: formData.subgroup === sub ? "" : sub })}
                        className="flex-1"
                      >
                        Підгрупа {sub}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Зверніть увагу:</strong> Після відправки заявки адміністратор має схвалити ваш профіль. 
                  Ви отримаєте доступ до системи після схвалення.
                </AlertDescription>
              </Alert>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-lg btn-primary"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Відправка...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Відправити заявку
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentProfileSetup;
