import { ChangeEvent, useEffect, useState } from "react";
import { NetworkInterface } from "../types";
import { Button, Form } from "react-bootstrap";

function AddNetworkInterfaceForm(props: {
  collisionDomains: string[];
  onSubmit: (iface: NetworkInterface) => void;
  availableInterfaces: number[];
}) {
  const { collisionDomains } = props;
  const { availableInterfaces } = props;

  const [address, setAddress] = useState("");
  const [netmask, setNetmask] = useState("");
  const [interfaceId, setInterfaceId] = useState(
    availableInterfaces[0].toString()
  );
  const [domain, setDomain] = useState(collisionDomains[0]);
  const [, setCanSubmit] = useState(false);

  useEffect(() => {
    setDomain(props.collisionDomains[0]);
    setInterfaceId(props.availableInterfaces[0].toString());
  }, [props.collisionDomains, props.availableInterfaces]);

  function collisionDomainChangeHandler(event: ChangeEvent<HTMLSelectElement>) {
    setDomain(event.target.value);
  }

  function interfaceChangeHandler(event: ChangeEvent<HTMLSelectElement>) {
    setInterfaceId(event.target.value);
  }

  function addressChangeHandler(event: ChangeEvent<HTMLInputElement>) {
    setAddress(event.target.value);
  }

  function netmaskChangeHandler(event: ChangeEvent<HTMLInputElement>) {
    const inputValue = parseInt(event.target.value);
    if (inputValue >= 0 && inputValue <= 32) {
      setNetmask(inputValue.toString());
    } else {
      setNetmask("");
    }
  }

  function submitHandler() {
    const iface: NetworkInterface = {
      domainId: domain,
      id: parseInt(interfaceId),
      ipv4Address: address,
      netmask: parseInt(netmask),
    };
    props.onSubmit(iface);
    setAddress("");
    setInterfaceId(availableInterfaces[0].toString());
    setNetmask("");
    setCanSubmit(false);
  }

  return (
    <>
      <Form.Group>
        <Form.Label>Collision Domain:</Form.Label>
        <Form.Select value={domain} onChange={collisionDomainChangeHandler}>
          {collisionDomains.map((collisionDomain) => {
            return (
              <option key={collisionDomain} value={collisionDomain}>
                {collisionDomain}
              </option>
            );
          })}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label>Interface: </Form.Label>
        <Form.Select value={interfaceId} onChange={interfaceChangeHandler}>
          {availableInterfaces.sort().map((i) => {
            return (
              <option key={i} value={i}>
                eth{i}
              </option>
            );
          })}
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label>IPv4 Address: </Form.Label>
        <Form.Control
          type="text"
          placeholder="IPv4 Address"
          value={address}
          onChange={addressChangeHandler}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Netmask (0-32): </Form.Label>
        <Form.Control
          type="number"
          min={0}
          max={32}
          value={netmask}
          onChange={netmaskChangeHandler}
        />
      </Form.Group>

      <Form.Group>
        <Button variant="success" type="button" onClick={submitHandler}>
          Add Interface
        </Button>
      </Form.Group>
    </>
  );
}

export default AddNetworkInterfaceForm;
