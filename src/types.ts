export enum PayloadType {
  WatchFile,
}

export interface WatchFilePayload {
  type: PayloadType.WatchFile;
  file: string;
}

export type Payload = WatchFilePayload;
