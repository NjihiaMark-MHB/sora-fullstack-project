import pino from "pino";

const logger = pino({
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  // Removing transport configuration to avoid thread-stream worker issues with Next.js
});

export default logger;
