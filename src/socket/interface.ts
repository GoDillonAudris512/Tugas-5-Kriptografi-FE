import { Point } from "../utils/ECC";

export interface ServerToClientEvents {
  matched: (roomId: string) => void;
  revealName: (payload: {
    username1: string;
    name1: string;
    username2: string;
    name2: string;
  }) => void;
  message: (payload: { content: [Point, Point][]; from: string }) => void;
  messageFail: (payload: { error: string }) => void;
  endChat: (message: string) => void;
  onlineUsers: (onlineUsers: number) => void;
  quotaExceeded: () => void;
  continueMatch: () => void;
  finishLoading: () => void;
}

export interface ClientToServerEvents {
  matchmaking: (topicId: string) => Promise<void>;
  matchNotFound: (topicId: string) => void;
  revealName: () => void;
  message: (payload: { content: [Point, Point][] }) => Promise<void>;
  endChat: () => void;
  getOnlineUsers: () => void;
  leaveRoom: () => void;
}
