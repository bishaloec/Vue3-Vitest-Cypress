// cypress.config.js
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 15,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
