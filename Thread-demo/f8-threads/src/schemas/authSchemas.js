import { z } from 'zod'


export const USERNAME_PATTERN = /^[A-Za-z0-9._]+$/

const passwordRules = (t) => z.string().min(1, t('validation.required')).min(8, t('validation.passwordMin'))

const withConfirmation = (schema, t) =>
  schema.refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: t('validation.passwordMismatch'),
  })

export const usernameSchema = (t) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required'))
    .min(3, t('validation.usernameMin'))
    .max(30, t('validation.usernameMax'))
    .regex(USERNAME_PATTERN, t('validation.usernameChars'))

export const emailSchema = (t) => z.string().trim().min(1, t('validation.required')).email(t('validation.email'))

export const registerSchema = (t) =>
  withConfirmation(
    z.object({
      username: usernameSchema(t),
      email: emailSchema(t),
      password: passwordRules(t),
      password_confirmation: z.string().min(1, t('validation.required')),
    }),
    t,
  )

export const loginSchema = (t) =>
  z.object({
    login: z.string().trim().min(1, t('validation.required')),
    password: z.string().min(1, t('validation.required')),
  })

export const forgotPasswordSchema = (t) => z.object({ email: emailSchema(t) })

export const resetPasswordSchema = (t) =>
  withConfirmation(
    z.object({
      password: passwordRules(t),
      password_confirmation: z.string().min(1, t('validation.required')),
    }),
    t,
  )