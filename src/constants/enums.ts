export enum UserStatus {
  INTERN = 'INTERN',
  PROBATION = 'PROBATION',
  OFFICIAL = 'OFFICIAL'
}

export enum UserFormStatus {
  NEW = 'NEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED'
}

export enum TokenType {
  AccessToken,
  RefreshToken
}
