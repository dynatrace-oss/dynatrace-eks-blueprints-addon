# Dynatrace Add-On for the Amazon Shared Services Platform

## Example Configuration (secrets in SSM):
* Create API and PaaS Tokens as described here: https://www.dynatrace.com/support/help/reference/dynatrace-concepts/why-do-i-need-an-environment-id/#create-user-generated-access-tokens
* Open your AWS Console
* Go to "Secrets Manager"
* Create a new secret
  * API_URL="https://<dynatrace-tenant-url>/api"
  * API_TOKEN="<your-api-token>"
  * PAAS_TOKEN="your-paas-token>"
* Remember the name you assigned to the token

Example Configuration (Secrets in SSM):
```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@dynatraceoss/dynatrace-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceOperatorAddOn(
    "<your-secret-name>"
)


const addOns: Array<ssp.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```


## Example Configuration (secrets in code):
* Create API and PaaS Tokens as described here: https://www.dynatrace.com/support/help/reference/dynatrace-concepts/why-do-i-need-an-environment-id/#create-user-generated-access-tokens

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core'
import * as dt from '@dynatraceoss/dynatrace-ssp-addon'
import * as ssp from '@aws-quickstart/ssp-amazon-eks'

const app = new cdk.App();

const Dynatrace = new dt.DynatraceOperatorAddOn(
    "",
    "<dynatrace-api-token>",
    "https://<dynatrace-tenant-url>/api",
    "<dynatrace-paas-token>"
)


const addOns: Array<ssp.ClusterAddOn> = [
    Dynatrace,
];

const account = '<aws-account-id>';
const region = '<aws-region>';
const props = { env: { account, region } };
new ssp.EksBlueprint(app, { id: '<aws-eks-cluster-name>', addOns}, props);
```

