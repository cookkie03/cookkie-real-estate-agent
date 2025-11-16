/**
 * WebSocket Client for Real-time Scraping Updates
 *
 * Connects to the scraping WebSocket gateway to receive:
 * - Job progress updates
 * - Screenshot streams (headful mode)
 * - Log messages
 * - Job completion/failure events
 */

import { io, Socket } from "socket.io-client";

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface JobProgressEvent {
  jobId: string;
  status: string;
  progress: number;
  currentPage?: number;
  propertiesFound?: number;
}

export interface JobCompletedEvent {
  jobId: string;
  status: string;
  propertiesFound: number;
  propertiesImported: number;
  duration: number;
}

export interface JobFailedEvent {
  jobId: string;
  error: string;
}

export interface JobScreenshotEvent {
  jobId: string;
  screenshot: string; // Base64-encoded
  timestamp: string;
}

export interface JobLogEvent {
  jobId: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: string;
}

export interface ScrapingWebSocketCallbacks {
  onProgress?: (event: JobProgressEvent) => void;
  onCompleted?: (event: JobCompletedEvent) => void;
  onFailed?: (event: JobFailedEvent) => void;
  onScreenshot?: (event: JobScreenshotEvent) => void;
  onLog?: (event: JobLogEvent) => void;
}

/**
 * Connect to scraping WebSocket and subscribe to a job
 */
export function connectToScrapingJob(
  jobId: string,
  callbacks: ScrapingWebSocketCallbacks
): () => void {
  const socket: Socket = io(`${WEBSOCKET_URL}/scraping`, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");

    // Subscribe to job updates
    socket.emit("subscribe:job", { jobId });
  });

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected");
  });

  // Listen for job events
  socket.on("job:progress", (event: JobProgressEvent) => {
    callbacks.onProgress?.(event);
  });

  socket.on("job:completed", (event: JobCompletedEvent) => {
    callbacks.onCompleted?.(event);
  });

  socket.on("job:failed", (event: JobFailedEvent) => {
    callbacks.onFailed?.(event);
  });

  socket.on("job:screenshot", (event: JobScreenshotEvent) => {
    callbacks.onScreenshot?.(event);
  });

  socket.on("job:log", (event: JobLogEvent) => {
    callbacks.onLog?.(event);
  });

  // Return disconnect function
  return () => {
    socket.emit("unsubscribe:job", { jobId });
    socket.disconnect();
  };
}
