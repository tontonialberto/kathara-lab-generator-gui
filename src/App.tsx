import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import AddCollisionDomainForm from "./AddCollisionDomainForm";
// @ts-expect-error types are missing
import CytoscapeComponent from "react-cytoscapejs";
import { Host } from "./types";
import AddHostModalForm from "./AddHostModalForm";
import { createLabZip } from "./LabGenerator";
import { generateNetworkGraph } from "./NetworkGraph";
import { checkAllPointToPointConnections } from "./NetworkHelper";

function App() {
  // const defaultLayoutAlgorithm = {
  //   name: "cose",
  //   animate: "false",
  //   numIter: 10,
  // };

  const [showAddHost, setShowAddHost] = useState(false);
  const [canAddHost, setCanAddHost] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [collisionDomains, setCollisionDomains] = useState<string[]>([]);
  const [networkGraph, setNetworkGraph] = useState<unknown>([]);
  const [selectedHost, setSelectedHost] = useState<Host|null>(null);

  useEffect(() => {
    console.log("Updated")
    setNetworkGraph(() => {
      return generateNetworkGraph(hosts, collisionDomains);
    });
    const connectionIssues = checkAllPointToPointConnections(collisionDomains, hosts);
    if(connectionIssues.length > 0) {
      const warningMessage = connectionIssues.map(issue => {
        const domainId = issue.source.domainId;
        const sourceAddress = issue.source.ipv4Address;
        const sourceMask = issue.source.netmask;
        const targetAddress = issue.target.ipv4Address;
        const targetMask = issue.target.netmask;
        return `(${domainId}) Cannot communicate from ${sourceAddress}/${sourceMask} to ${targetAddress}/${targetMask}`
      }).join("\n")
      console.warn(warningMessage);
      alert(warningMessage);
    }
  }, [hosts, collisionDomains]);

  const cyStylesheet = [
    {
      selector: "node[label]",
      style: {
        label: "data(label)",
      },
    },
    {
      selector: "node[type='host']",
      style: {
        shape: "rectangle",
        "background-color": "green",
      },
    },
    {
      selector: "edge[label]",
      style: {
        label: "data(label)",
        width: 3,
        "font-size": "7px",
        "text-background-opacity": 1,
        "text-background-color": "#fff",
      },
    },
  ];

  function domainAddHandler(name: string) {
    if (undefined === collisionDomains.find((domain) => domain === name)) {
      setCollisionDomains(() => {
        return [...collisionDomains, name];
      });
      setCanAddHost(true);
    }
  }

  function hostAddHandler(host: Host): void {
    if(selectedHost) {
      // We're in editing mode, apply changes.
      setHosts(() => {
        return [
          ...hosts.filter(h => h.id !== host.id),
          host,
        ]
      });

      // Exit from editing mode.
      setSelectedHost(() => null);
    }
    else if (undefined === hosts.find((h) => h.id === host.id)) { // We're in creation mode. Don't add the host if it already exists.
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

  // function layoutSelectionChangeHandler(event: ChangeEvent<HTMLInputElement>) {
  //   if (event.target.checked) {
  //     setGraphLayout(() => defaultLayoutAlgorithm);
  //   } else {
  //     setGraphLayout(() => null);
  //   }
  // }

  function nodeSelectionHandler(event: { target: { _private: { data: { id: string; type: string; }; }; }; }) {
    const {id, type} = event.target._private.data;
    if(type === "host") {
      const host = hosts.find(host => host.id === id)!;
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
            {/* <Form.Switch
              label="Automatic Graph Layout"
              onChange={layoutSelectionChangeHandler}
            ></Form.Switch> */}
          </Col>
        </Row>
        <Row>
          <CytoscapeComponent
            style={{ width: "100vw", height: "100vh" }}
            elements={networkGraph}
            layout={{ name: "grid" }}
            minZoom={1.0}
            maxZoom={1.0}
            zoom={1}
            pan={{ x: 10, y: 10 }}
            stylesheet={cyStylesheet}
            cy={
              // @ts-expect-error missing types
              (cy) => {
              // cy.on("add", () => {
              //   if (graphLayout) {
              //     console.log(graphLayout);
              //     cy.layout(graphLayout).run();
              //     cy.fit();
              //   }
              // });
              cy.on('cxttap', "node", (event: { target: { _private: { data: { id: string; type: string; }; }; }; }) => { nodeSelectionHandler(event) });
            }}
          ></CytoscapeComponent>
        </Row>
        <AddHostModalForm
          show={showAddHost}
          host={selectedHost}
          collisionDomains={collisionDomains}
          onSubmit={hostAddHandler}
          onHide={hideAddHostHandler}
        ></AddHostModalForm>
      </Container>
    </>
  );
}

export default App;
