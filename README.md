# Dynatrace Add-On for Amazon EKS Blueprints
[![main](https://github.com/dynatrace-oss/dynatrace-eks-blueprints-addon/actions/workflows/main.yml/badge.svg)](https://github.com/dynatrace-oss/dynatrace-eks-blueprints-addon/actions/workflows/main.yml)

The Dynatrace Add-On for Amazon EKS Blueprints enables platform administrators to install the Dynatrace OneAgent Operator during the bootstrapping process of an [EKS](https://aws.amazon.com/eks/) cluster.

Therefore, this add-on installs the [Dynatrace Operator Helm Chart](https://github.com/Dynatrace/helm-charts/tree/master/dynatrace-operator) and configures the operator to use a Dynatrace Tenant with credentials specified by variables or a Amazon Secrets Manager Secret.

## Prerequisites

### Dynatrace Tokens
Create API and PaaS Tokens as described here: https://www.dynatrace.com/support/help/reference/dynatrace-concepts/why-do-i-need-an-environment-id/#create-user-generated-access-tokens

### AWS Secret Manager Secrets
If you plan to use Secret Manager Secrets, you need to create a secret first. #

Therefore:
* Open your AWS Console
* Search for "Secrets Manager"
* Create a new secret ("Store a new secret")
  * Secret Type: "Other type of secret"
  * Key/value pairs
    * API_URL="https://<dynatrace-tenant-url>/api"
    * API_TOKEN="<your-api-token>"
    * PAAS_TOKEN="your-paas-token>"
* Remember the name you assigned to the secret

## Usage
The add-on can be used by either specifying the name of a Secrets Manager secret or the API Tokens.

You can find informations how to get started with SSP Projects [here](https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/). 

### Example Configuration (secrets in Secrets Manager):
```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@dynatrace/dynatrace-eks-blueprints-addon'
import * as blueprints from '@aws-quickstart/eks-blueprints'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceAddOn({
  // In this example, the secret is called "dynatrace-tokens"
  ssmSecretName: "dynatrace-tokens"
})


const addOns: Array<blueprints.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new blueprints.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

### Example Configuration (secrets in code):

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@dynatraceoss/dynatrace-eks-blueprints-addon'
import * as blueprints from '@aws-quickstart/eks-blueprints'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceAddOn({
  apiUrl: "https://<your-dynatrace-tenant-url>/api",
  apiToken: "<your-api-token",
  paasToken: "<your-paas-token>"
})


const addOns: Array<blueprints.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new blueprints.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

## Adding your EKS Cluster to Dynatrace
After creating your EKS Cluster, connect to this cluster with kubectl and find out the UUID of the "kube-system" Namespace of this:
```
kubectl get ns kube-system -ojsonpath='{.metadata.uid}'
```

Afterwards, open Dynatrace in your browser, click on "Infrastructure -> Kubernetes" and "Connect manually". Check "Connect containerized ActiveGate to local Kubernetes API endpoint", add a name and copy the UUID of the kube-system namespace into the "Kubernetes cluster ID" field. Afterwards, click save.

## Enhancements / Bugs 
You are welcome to use issues to report bugs or request enhancements.
