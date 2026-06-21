/**
 * Методы регистрации CodeCore.
 *
 * ── Контракт для backend-разработчиков ───────────────────────────────────────
 *
 * POST /auth/register
 *   Запрос:  { name: string, email: string, password: string }
 *            Пароль приходит в открытом виде по HTTPS — хешируйте на сервере
 *            (bcrypt/argon2). Фронт уже проверил: длина ≥ 8 и совпадение паролей,
 *            но продублируйте валидацию на бэкенде.
 *   Ответ 201: { user: { id, name, email, avatarUrl? } }
 *            + Set-Cookie с httpOnly-сессией (пользователь сразу авторизован).
 *   Ответ 409: { message: "Пользователь с таким e-mail уже существует",
 *                code: "EMAIL_TAKEN" }
 *   Ответ 422: { message: "...", code: "VALIDATION_ERROR" }  // невалидные поля
 *
 * GET /auth/oauth/:provider/url   (provider = 'google' | 'github')
 *   Ответ 200: { url: string }   // фронт делает redirect на этот url.
 *   После согласия провайдер вернёт пользователя на ваш callback,
 *   вы создаёте/находите аккаунт, ставите сессию-cookie и редиректите на фронт.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { apiRequest } from './client'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  user: User
}

export type OAuthProvider = 'google' | 'github'

/** Регистрация нового пользователя. Бросает ApiError при ошибке. */
export function register(
  payload: RegisterPayload,
  signal?: AbortSignal,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    signal,
  })
}

/**
 * Получить URL для OAuth-регистрации/входа и перенаправить пользователя
 * к провайдеру. Бэкенд отдаёт готовую ссылку (с state/PKCE) — фронт редиректит.
 */
export async function startOAuth(provider: OAuthProvider): Promise<void> {
  const { url } = await apiRequest<{ url: string }>(`/auth/oauth/${provider}/url`)
  window.location.assign(url)
}
