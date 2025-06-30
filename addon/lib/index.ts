import { ClusterInfo } from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs'
import { HelmAddOn, HelmAddOnProps } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon";

export const defaultProps: HelmAddOnProps = {
    name: 'dynatrace-operator',
    chart: 'dynatrace-operator',
    release: 'eks-blueprints-addon-dynatrace',
    namespace: "dynatrace",
    repository: "https://raw.githubusercontent.com/Dynatrace/dynatrace-operator/main/config/helm/repos/stable",
    version:"1.6.0"
}

export class DynatraceAddOn extends HelmAddOn {
    constructor(){
        super({...defaultProps});
    }

    deploy(clusterInfo: ClusterInfo): void | Promise<Construct> {
      return Promise.resolve(this.addHelmChart(clusterInfo, {installCRD: true}));
    }
}
