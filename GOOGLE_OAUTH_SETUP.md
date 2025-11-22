# Google OAuth Setup Guide

Цей документ описує налаштування Google OAuth для інтеграції з Google Classroom API.

## Налаштування Google Cloud Console

### 1. Створення проєкту

1. Відкрийте [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проєкт або виберіть існуючий
3. Увімкніть необхідні API:
   - Google Classroom API
   - Google People API

### 2. Налаштування OAuth 2.0

1. Перейдіть до `APIs & Services > Credentials`
2. Натисніть `Create Credentials > OAuth 2.0 Client IDs`
3. Виберіть тип `Web application`
4. Заповніть поля:

**Name:** CubicHelper-WebClient

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:4173
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
```

### 3. Налаштування OAuth consent screen

1. Перейдіть до `APIs & Services > OAuth consent screen`
2. Виберіть `External` (для тестування)
3. Заповніть обов'язкові поля:

**App name:** CubicHelper-GoogleAuthPlatform

**User support email:** your-email@example.com

**Developer contact information:** your-email@example.com

### 4. Додавання скоупів (Scopes)

Додайте наступні скоупи:

- `openid`
- `.../auth/userinfo.profile`
- `.../auth/userinfo.email`
- `.../auth/classroom.rosters.readonly`
- `.../auth/classroom.coursework.students`
- `.../auth/classroom.coursework.me`
- `.../auth/classroom.courses.readonly`

## Налаштування Frontend

### 1. Змінні середовища

Створіть файл `.env` в корені проєкту:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=156322397230-dloj26s348rut4u70e8r6h6680m0abjh.apps.googleusercontent.com

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Development settings
VITE_DEV_AUTH=0

# OAuth Redirect URI
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 2. Компоненти

Проєкт включає наступні компоненти для роботи з Google OAuth:

- `GoogleSignInButton` - кнопка входу через Google
- `AuthCallback` - обробка callback після авторизації
- `ClassroomData` - відображення даних з Google Classroom
- `UserProfile` - профіль користувача з інтеграцією Classroom

### 3. API функції

- `googleAuth.ts` - функції для роботи з Google OAuth
- `classroomApi.ts` - API функції для Google Classroom
- `useClassroom.ts` - React хук для роботи з Classroom

## Використання

### Вхід через Google

```tsx
import GoogleSignInButton from '@/components/GoogleSignInButton';

// Використання компонента
<GoogleSignInButton useDirectFlow={true} />
```

### Отримання даних Classroom

```tsx
import { useClassroom } from '@/lib/hooks/useClassroom';

const MyComponent = () => {
  const { courses, loading, error } = useClassroom();
  
  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
};
```

## Backend API Endpoints

Для повної функціональності потрібно реалізувати наступні endpoint на бекенді:

### Авторизація

- `POST /auth/google/callback` - обробка OAuth callback
- `GET /auth/me` - отримання інформації про поточного користувача
- `POST /auth/logout` - вихід із системи

### Google Classroom

- `GET /classroom/auth/status` - перевірка статусу авторизації
- `POST /classroom/auth/reauthorize` - повторна авторизація
- `GET /classroom/courses` - список курсів
- `GET /classroom/courses/:id/students` - студенти курсу
- `GET /classroom/courses/:id/teachers` - викладачі курсу
- `GET /classroom/courses/:id/coursework` - завдання курсу
- `GET /classroom/courses/:id/coursework/:workId/submissions` - подання завдань

## Безпека

1. **HTTPS:** У продакшені обов'язково використовуйте HTTPS
2. **Домени:** Додайте продакшн домени до Authorized origins
3. **Секрети:** Ніколи не викладайте `client_secret` у frontend код
4. **Скоупи:** Запитуйте лише необхідні дозволи

## Troubleshooting

### Помилка "redirect_uri_mismatch"

Переконайтеся, що URL у `Authorized redirect URIs` точно збігається з тим, що передається у запиті.

### Помилка "access_denied"

Користувач відхилив авторизацію або недостатньо дозволів у OAuth consent screen.

### Помилка "invalid_client"

Перевірте правильність `VITE_GOOGLE_CLIENT_ID`.

## Тестування

Для тестування у development режимі:

1. Встановіть `VITE_DEV_AUTH=1` для використання тестових кнопок
2. Встановіть `VITE_DEV_AUTH=0` для тестування реального OAuth flow