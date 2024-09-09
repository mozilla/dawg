export enum ErrorCode {
  NotFound404,
  Application
}

export const serializeErrorDetails = (d: any): string => {
  return encodeURIComponent(JSON.stringify({ data: d }))
}

export const deserializeErrorDetails = (s: string): { data: any } => {
  return s?.length > 0 && JSON.parse(decodeURIComponent(s) ?? '{data: null}').data
}
