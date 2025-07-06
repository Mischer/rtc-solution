import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        clearMocks: true,
        coverage: {
            reporter: ['text', 'lcov'],
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/coverage/**',
                '**/src/index.ts',
                '**/src/logger.ts',
                '**/src/middlewares/**',
                '**/src/routes/**',
                '**/src/controllers/**'
            ],
        },
    },
});