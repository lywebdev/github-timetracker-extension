import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },
  setupFiles: ['./setupTests.ts'],
}
export default config