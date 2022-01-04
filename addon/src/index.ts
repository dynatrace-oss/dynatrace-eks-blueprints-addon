import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {getSecretValue, loadExternalYaml} from "@aws-quickstart/ssp-amazon-eks/dist/utils";

/**
 * Configuration options for the add-on.
 */

interface DtSecret {
    API_URL: string;
    API_TOKEN: string;
    PAAS_TOKEN: string;
}

type DynatraceOperatorParams = {
    /**
     * Namespace where the Dynatrace Operator will be deployed
     * @default dynatrace
     */
    namespace: string;

    /**
     * Helm Repository which will be used for installing the Dynatrace Operator
     * @default https://raw.githubusercontent.com/Dynatrace/helm-charts/master/repos/stable
     */
    helmRepository: string;

    /**
     * Dynatrace API Token is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    apiToken: string;

    /**
     * Dynatrace API URL is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    apiUrl: string;

    /**
     * Dynatrace PaaS Token is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    paasToken: string;

    /**
     * The Location from where the Custom Resource Definition for the DynaKube Object is downloaded
     * @default https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.3.0/dynatrace.com_dynakubes.yaml
     */
    customResourceUrl: string;

    /**
     * The AWS Secrets Manager Secret which is containing the Dynatrace API URL, PaaS Token and API Token (keys: API_URL, API_TOKEN, API_URL)
     */
    ssmSecretName: string;

    /**
     * The Version of the Dynatrace Operator which should get installed
     * @default 0.3.0
     */
    version: string;
}

const defaultParams: DynatraceOperatorParams = {
    namespace: "dynatrace",
    helmRepository: "https://raw.githubusercontent.com/Dynatrace/helm-charts/master/repos/stable",
    apiToken: "",
    apiUrl: "",
    paasToken: "",
    customResourceUrl: "https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.3.0/dynatrace.com_dynakubes.yaml",
    ssmSecretName: "",
    version:"0.3.0"
}

export class DynatraceOperatorAddOn implements ClusterAddOn {
    props: DynatraceOperatorParams

    constructor(params: Partial<DynatraceOperatorParams>){
        this.props = {...defaultParams, ...params}
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        const crdManifest: Record<string, unknown>[] = loadExternalYaml(this.props.customResourceUrl);
        const manifest = clusterInfo.cluster.addManifest("DynaKubeCustomResource", ...crdManifest)


        if (this.props.ssmSecretName != "") {
            const secretValue = await getSecretValue(this.props.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: DtSecret = JSON.parse(secretValue)
            this.props.apiUrl = credentials.API_URL
            this.props.apiToken = credentials.API_TOKEN
            this.props.paasToken = credentials.PAAS_TOKEN
        }

        const operatorHelmChart = clusterInfo.cluster.addHelmChart("dynatrace-operator", {
            chart: "dynatrace-operator",
            repository: this.props.helmRepository,
            version: this.props.version,
            namespace: this.props.namespace,
            values: {
                applicationName: clusterInfo.cluster.clusterName,
                paasToken: this.props.paasToken,
                apiToken: this.props.apiToken,
                apiUrl: this.props.apiUrl,
                activeGate: {
                    capabilities: ["kubernetes-monitoring"]
                }
            }
        });

        operatorHelmChart.node.addDependency(manifest)

        return operatorHelmChart
    }
}