import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: "jsdom",
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  setupFiles: ['<rootDir>/polyfills.ts'],
}
export default config