import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const singlah = service("singlah", {
    source: github("haomingkoo/singlah", { checkSuites: false, rootDirectory: "/backend" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    deploy: { restartPolicyType: "ON_FAILURE", restartPolicyMaxRetries: 10 },
    replicas: { "asia-southeast1-eqsg3a": 1 },
  });

  return project("natural-clarity", {
    resources: [singlah],
  });
});
