import { Host, NetworkInterface } from "./types";

/**
 * Compute the numeric 32 bit network address for the given IPv4 address.
 * @param ipv4Address An IPv4 as string.
 * @param netmask Netmask as 0-32 notation.
 */
function getIPv4NetworkAddress(ipv4Address: string, netmask: number): number {
  // Get 32 bit netmask.
  const expandedNetmask = parseInt(
    "1".repeat(netmask) + "0".repeat(32 - netmask),
    2
  );

  // Get 32 bit address.
  const octets = ipv4Address.split(".").map((byte) => parseInt(byte, 10));
  const numericAddress =
    (octets[0] << 24) +
    (octets[1] << 16) +
    (octets[2] << 8) +
    octets[3];

  return numericAddress & expandedNetmask;
}

interface NetworkConnectionIssue {
  source: NetworkInterface;
  target: NetworkInterface;
}

function checkCollisionDomainConnections(
  interfaces: NetworkInterface[]
): NetworkConnectionIssue[] {
  const issues: NetworkConnectionIssue[] = [];

  interfaces.forEach((iface1) => {
    const netAddress1 = getIPv4NetworkAddress(
      iface1.ipv4Address,
      iface1.netmask
    );
    interfaces.forEach((iface2) => {
      const netAddress2 = getIPv4NetworkAddress(
        iface2.ipv4Address,
        iface2.netmask
      );
      if (netAddress1 !== netAddress2) {
        issues.push({ source: iface1, target: iface2 });
      }
    });
  });

  return issues;
}

function getInterfacesByCollisionDomain(collisionDomain: string, interfaces: NetworkInterface[]): NetworkInterface[] {
    return interfaces.filter(iface => iface.domainId === collisionDomain);
}

export function checkAllPointToPointConnections(collisionDomains: string[], hosts: Host[]): NetworkConnectionIssue[] {
    const issues: NetworkConnectionIssue[] = [];

    const allNetworkInterfaces = hosts.flatMap(host => host.interfaces);
    collisionDomains.forEach(collisionDomain => {
        const domainInterfaces = getInterfacesByCollisionDomain(collisionDomain, allNetworkInterfaces);
        issues.push(...checkCollisionDomainConnections(domainInterfaces));
    })

    return issues;
}