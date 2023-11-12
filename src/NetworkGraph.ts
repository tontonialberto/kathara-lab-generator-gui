import { Host } from "./types";

interface NetworkGraphNode {
  data: {
    id: string;
    label: string;
    type: "host" | "collisionDomain";
  };
}

interface NetworkGraphEdge {
  data: {
    source: string;
    target: string;
    label: string;
  };
}

export function generateNetworkGraph(
  hosts: Host[],
  collisionDomains: string[]
): Array<NetworkGraphNode | NetworkGraphEdge> {
  const graph: Array<NetworkGraphNode | NetworkGraphEdge> = [];

  collisionDomains.forEach((domainId) => {
    const collisionDomainNode: NetworkGraphNode = {
      data: {
        id: domainId,
        label: domainId,
        type: "collisionDomain",
      },
    };
    graph.push(collisionDomainNode);
  });

  hosts.forEach((host) => {
    const hostNode: NetworkGraphNode = {
      data: {
        id: host.id,
        label: host.id,
        type: "host",
      },
    };
    graph.push(hostNode);

    host.interfaces.forEach((iface) => {
      const link: NetworkGraphEdge = {
        data: {
          source: host.id,
          target: iface.domainId,
          label: `[eth${iface.id}] ${iface.ipv4Address}/${iface.netmask}`,
        },
      };
      graph.push(link);
    });
  });

  return graph;
}
