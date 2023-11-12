import JSZip from "jszip";
import { Host, NetworkInterface } from "./types";
import { saveAs } from "file-saver";

export function generateLabConf(
  hosts: Host[],
  collisionDomains: string[],
  options: {
    lineSeparator: string;
  } = { lineSeparator: "\n" }
): string {
  const lines: string[] = [];

  collisionDomains.forEach((domainName) => {
    const hostsOnDomain = hosts
      .map((host) => {
        return {
          id: host.id,
          interfaces: host.interfaces.filter(
            (iface) => iface.domainId === domainName
          ),
        };
      })
      .filter((host) => host.interfaces.length > 0);

    hostsOnDomain.forEach((host) => {
      host.interfaces.forEach((iface) => {
        const line = `${host.id}[${iface.id}]=${domainName}`;
        lines.push(line);
      });
    });
  });

  return lines.join(options.lineSeparator);
}

export function generateStartupFile(
  host: Host,
  options: {
    lineSeparator: string;
  } = { lineSeparator: "\n" }
): string {
  const lines: string[] = [];

  host.interfaces.forEach((iface) => {
    const line = `ip address add ${iface.ipv4Address}/${iface.netmask} dev eth${iface.id}`;
    lines.push(line);
  });

  lines.push("systemctl start frr");

  return lines.join(options.lineSeparator);
}

export function generateGlobalConnectivityCheckScript(
  interfaces: NetworkInterface[],
  options: {
    lineSeparator: string;
  } = { lineSeparator: "\n" }
): string {
  const lines: string[] = [];

  lines.push(
    '#!/bin/bash',
    'echo "### BEGIN GLOBAL CONNECTIVITY CHECK ###"', 
    'echo ""', 
    'echo ""', 
    "set -e",
  );

  interfaces.forEach((iface) => {
    const line = `ping ${iface.ipv4Address} -qc 2`;
    lines.push(
      line,
      'echo ""', 
      'echo ""', 
    );
  });

  lines.push('echo "### END GLOBAL CONNECTIVITY CHECK ###"');

  return lines.join(options.lineSeparator);
}

export async function createLabZip(
  hosts: Host[],
  collisionDomains: string[]
): Promise<void> {
  const zip = new JSZip();

  // Get lab.conf
  const labConfContent = generateLabConf(hosts, collisionDomains);
  zip.file("lab.conf", labConfContent);

  // Get startup files
  hosts.forEach((host) => {
    const startupContent = generateStartupFile(host);
    zip.file(`${host.id}.startup`, startupContent);
  });

  // Get hosts directories
  hosts.forEach((host) => {
    const frrFolder = zip.folder(host.id)?.folder("etc")?.folder("frr");
    frrFolder?.file("vtysh.conf", "service integrated-vtysh-config");
  });
  
  // Get shared folder
  const sharedFolder = zip.folder("shared");
  const allInterfaces = hosts.flatMap(host => host.interfaces);
  const globalConnectivityCheckScriptContent = generateGlobalConnectivityCheckScript(allInterfaces);
  sharedFolder?.file("test_routing.sh", globalConnectivityCheckScriptContent);

  const zipContent = await zip.generateAsync({ type: "blob" });
  saveAs(zipContent, "lab.zip");
}
