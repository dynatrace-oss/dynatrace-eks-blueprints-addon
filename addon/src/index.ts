import { ClusterInfo } from '@aws-quickstart/ssp-amazon-eks';
import { Construct } from '@aws-cdk/core'
import {getSecretValue, loadExternalYaml} from "@aws-quickstart/ssp-amazon-eks/dist/utils";
import {HelmAddOn, HelmAddOnProps, HelmAddOnUserProps} from "@aws-quickstart/ssp-amazon-eks/dist/addons/helm-addon";

/**
 * Configuration options for the add-on.
 */

interface DtSecret {
    API_URL: string;
    API_TOKEN: string;
    PAAS_TOKEN: string;
}

export interface DynatraceAddOnProps extends HelmAddOnUserProps {
    /**
     * Dynatrace API Token is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    apiToken?: string

    /**
     * Dynatrace API URL is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    apiUrl?: string

    /**
     * Dynatrace PaaS Token is used to connect to the Dynatrace API, not needed if a ssmSecretName is specified
     */
    paasToken?: string

    /**
     * The Location from where the Custom Resource Definition for the DynaKube Object is downloaded
     * @default https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.3.0/dynatrace.com_dynakubes.yaml
     */
    customResourceUrl?: string

    /**
     * The AWS Secrets Manager Secret which is containing the Dynatrace API URL, PaaS Token and API Token (keys: API_URL, API_TOKEN, API_URL)
     */
    ssmSecretName?: string
}

export const defaultProps: HelmAddOnProps & DynatraceAddOnProps = {
    name: 'dynatrace-operator',
    chart: 'dynatrace-operator',
    release: 'ssp-addon-dynatrace',
    namespace: "dynatrace",
    repository: "https://raw.githubusercontent.com/Dynatrace/helm-charts/master/repos/stable",
    apiToken: "",
    apiUrl: "",
    paasToken: "",
    customResourceUrl: "https://github.com/Dynatrace/dynatrace-operator/releases/download/v0.3.0/dynatrace.com_dynakubes.yaml",
    ssmSecretName: "",
    version:"0.3.0",
}

export class DynatraceAddOn extends HelmAddOn {
    readonly options: DynatraceAddOnProps;

    constructor(props: DynatraceAddOnProps){
        super({...defaultProps, ...props});
        this.options = this.props as DynatraceAddOnProps
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        const crdManifest: Record<string, unknown>[] = loadExternalYaml(<string>this.options.customResourceUrl);
        const manifest = clusterInfo.cluster.addManifest("DynaKubeCustomResource", ...crdManifest)


        if (this.options.ssmSecretName != "") {
            const secretValue = await getSecretValue(<string>this.options.ssmSecretName, clusterInfo.cluster.stack.region);
            const credentials: DtSecret = JSON.parse(secretValue)
            this.options.apiUrl = credentials.API_URL
            this.options.apiToken = credentials.API_TOKEN
            this.options.paasToken = credentials.PAAS_TOKEN
        }

        const operatorHelmChart = this.addHelmChart(clusterInfo, {
            paasToken: this.options.paasToken,
            apiToken: this.options.apiToken,
            apiUrl: this.options.apiUrl,
            activeGate: {
                capabilities: ["kubernetes-monitoring"]
            }
        });

        operatorHelmChart.node.addDependency(manifest)

        return operatorHelmChart
    }
}