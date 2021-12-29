import { ClusterAddOn, ClusterInfo, Team } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {getSecretValue, loadExternalYaml, readYamlDocument} from "@aws-quickstart/ssp-amazon-eks/dist/utils";
import * as eks from "@aws-cdk/aws-eks";
import * as Cluster from "cluster";

/**
 * Configuration options for the add-on.
 */

interface DtSecret {
    API_URL: string;
    API_TOKEN: string;
    PAAS_TOKEN: string;
}


export class DynatraceOperatorAddOn implements ClusterAddOn {
    readonly Namespace: string;
    readonly HelmRepository: string;
    private ApiToken: string;
    private ApiUrl: string;
    private PaasToken: string;
    readonly CustomResourceUrl: string;
    readonly SSMSecretName: string;

    constructor(ssmSecretName?: string, apiToken?: string, apiUrl?: string, paasToken?: string, namespace?: string, helmrepo?: string, customResourceUrl?: string) {
        this.SSMSecretName = ssmSecretName ?? ""
        this.ApiToken = apiToken ?? ""
        this.ApiUrl = apiUrl ?? ""
        this.PaasToken = paasToken ?? ""
        this.Namespace = namespace ?? "dynatrace";
        this.HelmRepository = helmrepo ?? "https://raw.githubusercontent.com/Dynatrace/helm-charts/master/repos/stable"
        this.CustomResourceUrl = customResourceUrl ?? "https://github.com/Dynatrace/dynatrace-operator/releases/latest/download/dynatrace.com_dynakubes.yaml"
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        const crdManifest: Record<string,any>[] = loadExternalYaml(this.CustomResourceUrl);
        const manifest = clusterInfo.cluster.addManifest("DynaKubeCustomResource", ...crdManifest)


        if (this.SSMSecretName != "") {
            const secretValue = await getSecretValue(this.SSMSecretName!, clusterInfo.cluster.stack.region);
            let credentials: DtSecret = JSON.parse(secretValue)
            this.ApiUrl = credentials.API_URL
            this.ApiToken = credentials.API_TOKEN
            this.PaasToken = credentials.PAAS_TOKEN
        }

        const operatorHelmChart = clusterInfo.cluster.addHelmChart("dynatrace-operator", {
            chart: "dynatrace-operator",
            repository: this.HelmRepository,
            version: '0.3.0',
            namespace: this.Namespace,
            values: {
                applicationName: clusterInfo.cluster.clusterName,
                paasToken: this.PaasToken,
                apiToken: this.ApiToken,
                apiUrl: this.ApiUrl,
                activeGate: {
                    capabilities: ["kubernetes-monitoring"]
                }
            }
        });

        operatorHelmChart.node.addDependency(manifest)
        return operatorHelmChart
    }
}