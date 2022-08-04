export interface ServerToClientEvents {
  matched: () => void;
  revealName: (payload: object) => void;
  message: (payload: { content: string; from: string }) => void;
}

export interface ClientToServerEvents {
  matchmaking: (topicId: string) => Promise<void>;
  matchNotFound: (topicId: string) => void;
  revealName: () => void;
  message: (payload: { content: string }) => void;
}
