module.exports = {
  apps: [
    {
      name: "account-app-prod",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    },
    {
      name: "account-app-staging",
      script: "npm",
      args: "run staging",
      env: {
        NODE_ENV: "staging",
        PORT: 3001
      }
    }
  ]
};
