export interface JwtPayload {
  readonly login: string;
  readonly role: string;
  readonly sub: string;
}
