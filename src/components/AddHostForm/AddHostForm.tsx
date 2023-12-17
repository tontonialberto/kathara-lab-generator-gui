import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Host, NetworkInterface } from "../../types";
import NetworkInterfaceListDetail from "../NetworkInterfaceListDetail";
import AddNetworkInterfaceForm from "./AddNetworkInterfaceForm";

function AddHostForm(props: {
  host: Host | null;
  collisionDomains: string[];
  onSubmit: (host: Host) => void;
}) {
  const allAvailableInterfaces = [...Array(10).keys()]; // eth0 to eth9 for simplicity

  const [availableInterfaces, setAvailableInterfaces] = useState(
    allAvailableInterfaces.filter(
      (interfaceId) =>
        props.host?.interfaces.find((iface) => iface.id === interfaceId) ===
        undefined
    )
  );
  const [hostData, setHostData] = useState<Host>({
    id: props.host?.id || "",
    interfaces: props.host?.interfaces || [],
    isRouter: props.host ? props.host.isRouter : true, // by default an host is also a router
  });
  const isEditMode = props.host !== null;
  const [canSubmit, setCanSubmit] = useState(isEditMode);

  useEffect(() => {
    setCanSubmit(hostData.id !== "" && hostData.interfaces.length > 0);
  }, [hostData]);

  function nameChangeHandler(event: ChangeEvent<HTMLInputElement>): void {
    setHostData(() => {
      return {
        ...hostData,
        id: event.target.value,
      };
    });
  }

  function interfaceAddHandler(iface: NetworkInterface): void {
    setHostData(() => {
      return {
        ...hostData,
        interfaces: [...hostData.interfaces, iface],
      };
    });
    setAvailableInterfaces(() => {
      return availableInterfaces.filter(
        (interfaceId) => interfaceId !== iface.id
      );
    });
  }

  function addHostHandler(event: FormEvent) {
    event.preventDefault();
    props.onSubmit(hostData);
    setHostData(() => {
      return {
        id: "",
        interfaces: [],
        isRouter: true,
      };
    });
    setAvailableInterfaces(() => allAvailableInterfaces);
  }

  function interfaceRemoveHandler(interfaceId: number) {
    setHostData(() => {
      return {
        ...hostData,
        interfaces: hostData.interfaces.filter(
          (iface) => iface.id !== interfaceId
        ),
      };
    });
    setAvailableInterfaces(() => {
      return [...availableInterfaces, interfaceId];
    });
  }

  function isRouterChangeHandler(event: ChangeEvent<HTMLInputElement>) {
    setHostData(() => {
      return {
        ...hostData,
        isRouter: event.target.checked
      }
    })
  }

  return (
    <>
      <Form onSubmit={addHostHandler}>
        <Form.Group>
          <Form.Label>Host name:</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="name"
            value={hostData.id}
            onChange={nameChangeHandler}
            disabled={props.host !== null}
          />
          <Form.Switch
            label="Router"
            checked={hostData.isRouter}
            onChange={isRouterChangeHandler}
          ></Form.Switch>
          <NetworkInterfaceListDetail
            interfaces={hostData.interfaces}
            onDelete={interfaceRemoveHandler}
          ></NetworkInterfaceListDetail>
        </Form.Group>
        <Form.Group>
          <AddNetworkInterfaceForm
            collisionDomains={props.collisionDomains}
            onSubmit={interfaceAddHandler}
            availableInterfaces={availableInterfaces}
          ></AddNetworkInterfaceForm>
          <Button variant="primary" type="submit" disabled={!canSubmit}>
            {isEditMode ? 'Update Host' : 'Add Host' }
          </Button>
        </Form.Group>
      </Form>
    </>
  );
}

export default AddHostForm;
