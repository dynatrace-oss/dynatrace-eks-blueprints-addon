import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 */
export interface DynatraceAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where Calico will be installed
     * @default kube-system
     */
    namespace?: string;
    /**
     * Helm chart version to use to install.
     * @default 0.3.10
     */
    version?: string;
    /**
     * Values for the Helm chart.
     */
    values?: any;
}
export declare class DynatraceAddOn extends HelmAddOn {
    private options;
    constructor(props?: DynatraceAddOnProps);
    deploy(clusterInfo: ClusterInfo): void;
}
