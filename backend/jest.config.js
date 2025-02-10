export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest', // Use Babel to transform JavaScript files
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(mongodb-memory-server)/)', // Ignore node_modules except mongodb-memory-server
    ],
    extensionsToTreatAsEsm: ['.js'], // Treat .js files as ES modules
};