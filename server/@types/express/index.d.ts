import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Response {
      notFound(): void
    }

    interface Locals {
      user: HmppsUser
      digitalPrisonServicesUrl: string
      prisonerProfileUrl: string
      cspNonce: string
      csrfToken: ReturnType<CsrfTokenGenerator>
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
    }
  }
}
