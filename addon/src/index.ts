import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {loadExternalYaml, readYamlDocument} from "@aws-quickstart/ssp-amazon-eks/dist/utils";
import * as cluster from "cluster";

/**
 * Configuration options for the add-on.
 */

export class DynatraceOperatorAddOn implements ClusterAddOn {
    readonly Namespace: string;
    readonly HelmRepository: string;
    readonly ApiToken: string;
    readonly ApiUrl: string;
    readonly PaasToken: string;
    readonly CustomResourceUrl: string;

    constructor(apiToken?: string, apiUrl?: string, paasToken?: string, namespace?: string, helmrepo?: string, customResourceUrl?: string) {
        this.ApiToken = apiToken ?? ""
        this.ApiUrl = apiUrl ?? ""
        this.PaasToken = paasToken ?? ""
        this.Namespace = namespace ?? "dynatrace";
        this.HelmRepository = helmrepo ?? "https://raw.githubusercontent.com/Dynatrace/helm-charts/master/repos/stable"
        this.CustomResourceUrl = "https://github.com/Dynatrace/dynatrace-operator/releases/latest/download/dynatrace.com_dynakubes.yaml"

    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        const crdManifest: Record<string,any>[] = loadExternalYaml(this.CustomResourceUrl);
        const manifest = clusterInfo.cluster.addManifest("DynaKubeCustomResource", ...crdManifest)

        const operatorHelmChart = clusterInfo.cluster.addHelmChart("dynatrace-operator", {
            chart: "dynatrace-operator",
            repository: this.HelmRepository,
            version: '0.3.0',
            namespace: this.Namespace,
            values: {
                applicationName: clusterInfo.cluster.clusterName,
                paasToken: this.PaasToken,
                apiToken: this.ApiToken,
                apiUrl: this.ApiUrl
            }
        });

        operatorHelmChart.node.addDependency(manifest)
        return operatorHelmChart

    }
}