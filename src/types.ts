export interface NetworkInterface {
    id: number;
    domainId: string;
    ipv4Address: string;
    netmask: number;
}

export interface Host {
    id: string;
    interfaces: Array<NetworkInterface>;
    isRouter: boolean;
}