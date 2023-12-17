// @ts-expect-error types are missing
import CytoscapeComponent from "react-cytoscapejs";
// @ts-expect-error types are missing
import Cytoscape from "cytoscape";
// @ts-expect-error types are missing
import coseBilkent from "cytoscape-cose-bilkent";
import * as config from "../../config.json";
import { Host } from "../../types";
import { generateNetworkGraph } from "./NetworkGraph";
import { useEffect, useState } from "react";

Cytoscape.use(coseBilkent);

interface NetworkGraphLayout {
  name: string;
  animate?: string;
  numIter?: number;
}

function NetworkGraphComponent(props: {
  network: {
    collisionDomains: string[];
    hosts: Host[];
  };
  onNodeSelect: (node: {
    id: string;
    type: "host" | "collisionDomain";
  }) => void;
  layout: NetworkGraphLayout;
}) {
  const [selectedLayout, setSelectedLayout] = useState(props.layout);
  const [networkGraph, setNetworkGraph] = useState(
    generateNetworkGraph(props.network.hosts, props.network.collisionDomains)
  );

  let cytoscapeApi: unknown;

  useEffect(() => {
    setSelectedLayout(() => {
      return props.layout;
    })
    // @ts-expect-error missing types
    cytoscapeApi.layout(props.layout).run();
    // @ts-expect-error missing types
    cytoscapeApi.fit();
  }, [props.layout]);

  useEffect(() => {
    setNetworkGraph(() => {
      const { hosts, collisionDomains } = props.network;
      return generateNetworkGraph(hosts, collisionDomains);
    });
  }, [props.network]);

  function nodeSelectionHandler(event: {
    target: { _private: { data: { id: string; type: "host" | "collisionDomain" } } };
  }) {
    const { id, type } = event.target._private.data;
    props.onNodeSelect({ id, type });
  }

  return (
    <CytoscapeComponent
      style={config.graph.style}
      elements={networkGraph}
      minZoom={config.graph.minZoom}
      maxZoom={config.graph.maxZoom}
      zoom={config.graph.zoom}
      pan={config.graph.pan}
      stylesheet={config.graph.stylesheet}
      layout={selectedLayout}
      cy={
        // @ts-expect-error missing types
        (cy) => {
          cytoscapeApi = cy;
          cy.on(
            "cxttap",
            "node",
            (event: {
              target: {
                _private: { data: { id: string; type: "host" | "collisionDomain" } };
              };
            }) => {
              nodeSelectionHandler(event);
            }
          );
        }
      }
    ></CytoscapeComponent>
  );
}

export default NetworkGraphComponent;
