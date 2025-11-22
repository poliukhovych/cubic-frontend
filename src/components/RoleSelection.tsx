import { useState } from 'react';
import { authenticateWithGoogle, UserRole } from '@/lib/auth';

interface RoleSelectionProps {
  idToken: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function RoleSelection({ idToken, onSuccess, onError }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      onError('Будь ласка, оберіть роль');
      return;
    }

    setIsLoading(true);

    try {
      await authenticateWithGoogle(idToken, selectedRole);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Помилка аутентифікації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Оберіть вашу роль
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Це перший вхід в систему. Будь ласка, оберіть вашу роль:
        </p>

        <div className="space-y-4">
          {/* Student Role */}
          <button
            onClick={() => setSelectedRole(UserRole.STUDENT)}
            disabled={isLoading}
            className={`
              w-full p-6 rounded-lg border-2 transition-all
              ${selectedRole === UserRole.STUDENT
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold">Студент</h3>
                <p className="text-sm text-gray-600">Переглядати розклад, домашні завдання</p>
              </div>
            </div>
          </button>

          {/* Teacher Role */}
          <button
            onClick={() => setSelectedRole(UserRole.TEACHER)}
            disabled={isLoading}
            className={`
              w-full p-6 rounded-lg border-2 transition-all
              ${selectedRole === UserRole.TEACHER
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold">Викладач</h3>
                <p className="text-sm text-gray-600">Керувати курсами, групами, розкладом</p>
              </div>
            </div>
          </button>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleRoleSelect}
          disabled={!selectedRole || isLoading}
          className={`
            w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white
            ${!selectedRole || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            transition-colors
          `}
        >
          {isLoading ? 'Завантаження...' : 'Підтвердити'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          * Роль можна буде змінити пізніше, звернувшись до адміністратора
        </p>
      </div>
    </div>
  );
}
