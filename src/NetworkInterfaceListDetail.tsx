import { Badge, Button, Card, ListGroup } from "react-bootstrap";
import { NetworkInterface } from "./types";

function NetworkInterfaceListDetail(props: {
  interfaces: NetworkInterface[];
  onDelete: (interfaceId: number) => void;
}) {
  return (
    <>
      <Card>
        <Card.Header>Interfaces</Card.Header>
        <Card.Body>
          {props.interfaces.length > 0 ? (
            <ListGroup>
              {props.interfaces
                .sort((a, b) => a.id - b.id)
                .map((iface) => {
                  return (
                    <NetworkInterfaceDetail
                      onDelete={props.onDelete}
                      key={iface.id}
                      iface={iface}
                    ></NetworkInterfaceDetail>
                  );
                })}
            </ListGroup>
          ) : (
            <div>No interface has been added yet.</div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

function NetworkInterfaceDetail(props: {
  iface: NetworkInterface;
  onDelete: (interfaceId: number) => void;
}) {
  const { iface } = props;

  function deleteHandler() {
    props.onDelete(iface.id);
  }

  return (
    <ListGroup.Item>
      eth{iface.id}: {iface.ipv4Address}/{iface.netmask} ({iface.domainId})
      <Badge>
        <Button variant="danger" onClick={deleteHandler}>
          Delete
        </Button>
      </Badge>
    </ListGroup.Item>
  );
}

export default NetworkInterfaceListDetail;
