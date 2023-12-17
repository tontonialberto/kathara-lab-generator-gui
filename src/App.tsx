import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import AddCollisionDomainForm from "./components/AddCollisionDomainForm";
import { Host } from "./types";
import AddHostModalForm from "./components/AddHostModalForm";
import { createLabZip } from "./LabGenerator";
import { checkAllPointToPointConnections } from "./NetworkHelper";
import GraphLayoutSelector from "./components/NetworkGraphComponent/GraphLayoutSelector";
import * as config from "./config.json";
import NetworkGraphComponent from "./components/NetworkGraphComponent/NetworkGraphComponent";
import { NetworkGraphLayout } from "./components/NetworkGraphComponent/types";

function App() {
  const availableNetworkGraphLayouts = config.graph.layouts;
  const defaultNetworkGraphLayout = config.graph.defaultLayout;

  const [showAddHost, setShowAddHost] = useState(false);
  const [canAddHost, setCanAddHost] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [collisionDomains, setCollisionDomains] = useState<string[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<NetworkGraphLayout>(
    availableNetworkGraphLayouts[
      defaultNetworkGraphLayout as keyof typeof config.graph.layouts
    ]
  );

  useEffect(() => {
    const connectionIssues = checkAllPointToPointConnections(
      collisionDomains,
      hosts
    );
    if (connectionIssues.length > 0) {
      const warningMessage = connectionIssues
        .map((issue) => {
          const domainId = issue.source.domainId;
          const sourceAddress = issue.source.ipv4Address;
          const sourceMask = issue.source.netmask;
          const targetAddress = issue.target.ipv4Address;
          const targetMask = issue.target.netmask;
          return `(${domainId}) Cannot communicate from ${sourceAddress}/${sourceMask} to ${targetAddress}/${targetMask}`;
        })
        .join("\n");
      console.warn(warningMessage);
      alert(warningMessage);
    }
  }, [hosts, collisionDomains]);

  function domainAddHandler(name: string) {
    if (undefined === collisionDomains.find((domain) => domain === name)) {
      setCollisionDomains(() => {
        return [...collisionDomains, name];
      });
      setCanAddHost(true);
    }
  }

  function hostAddHandler(host: Host): void {
    if (selectedHost) {
      // We're in editing mode, apply changes.
      setHosts(() => {
        return [...hosts.filter((h) => h.id !== host.id), host];
      });

      // Exit from editing mode.
      setSelectedHost(() => null);
    } else if (undefined === hosts.find((h) => h.id === host.id)) {
      // We're in creation mode. Don't add the host if it already exists.
      setHosts(() => {
        return [...hosts, host];
      });
    }
  }

  function showAddHostHandler() {
    setShowAddHost(true);
  }

  function hideAddHostHandler() {
    setShowAddHost(false);
    // Exit from edit mode.
    setSelectedHost(() => null);
  }

  function downloadConfigurationHandler() {
    createLabZip(hosts, collisionDomains);
  }

  function layoutChangeHandler(layout: string) {
    setSelectedLayout(() => {
      return {
        ...availableNetworkGraphLayouts[
          layout as keyof typeof config.graph.layouts
        ],
      };
    });
  }

  function nodeSelectionHandler(node: {
    id: string;
    type: "host" | "collisionDomain";
  }) {
    if (node.type === "host") {
      const host = hosts.find((host) => host.id === node.id)!;
      setSelectedHost(() => host);
      setShowAddHost(true);
    }
  }

  return (
    <>
      <Container>
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <Card.Title>Add Collision Domain</Card.Title>
              </Card.Header>
              <Card.Body>
                <AddCollisionDomainForm
                  onSubmit={domainAddHandler}
                ></AddCollisionDomainForm>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              disabled={!canAddHost}
              variant="primary"
              type="button"
              onClick={showAddHostHandler}
            >
              Add Host
            </Button>
            <Button variant="success" onClick={downloadConfigurationHandler}>
              Get lab.conf
            </Button>
            <GraphLayoutSelector
              layouts={[...Object.keys(availableNetworkGraphLayouts)]}
              defaultLayout={defaultNetworkGraphLayout}
              onSelect={layoutChangeHandler}
            ></GraphLayoutSelector>
          </Col>
        </Row>
        <Row>
          <NetworkGraphComponent
            network={{ hosts: hosts, collisionDomains: collisionDomains }}
            layout={selectedLayout}
            onNodeSelect={nodeSelectionHandler}
          ></NetworkGraphComponent>
        </Row>
      </Container>
      <AddHostModalForm
        show={showAddHost}
        host={selectedHost}
        collisionDomains={collisionDomains}
        onSubmit={hostAddHandler}
        onHide={hideAddHostHandler}
      ></AddHostModalForm>
    </>
  );
}

export default App;
