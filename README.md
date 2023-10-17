# Dynatrace Add-On for Amazon EKS Blueprints
[![main](https://github.com/dynatrace-oss/dynatrace-eks-blueprints-addon/actions/workflows/main.yml/badge.svg)](https://github.com/dynatrace-oss/dynatrace-eks-blueprints-addon/actions/workflows/main.yml)

The Dynatrace Add-On for Amazon EKS Blueprints enables platform administrators to install the Dynatrace Operator during the bootstrapping process of an [EKS](https://aws.amazon.com/eks/) cluster. Therefore, this add-on installs the [Dynatrace Operator Helm Chart](https://github.com/Dynatrace/dynatrace-operator/tree/main/config/helm/repos/stable).

## Usage

The add-on installs the Dynatrace Operator for you. In a second step, creating a DynaKube resource configures monitoring of the cluster.

### Deploy operator

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@dynatrace/dynatrace-eks-blueprints-addon'
import * as blueprints from '@aws-quickstart/eks-blueprints'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceAddOn()


const addOns: Array<blueprints.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new blueprints.EksBlueprint(app, { id: '<aws-eks-cluster-name>', version: 'auto', addOns}, props);
```

### Create DynaKube

Create a DynaKube resource as described in the [README file of the Dynatrace Operator](https://www.dynatrace.com/support/help/setup-and-configuration/setup-on-k8s/reference/dynakube-parameters).


## Enhancements / Bugs
You are welcome to use issues to report bugs or request enhancements.
