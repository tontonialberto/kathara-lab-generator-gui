import Modal from "react-bootstrap/Modal";
import AddHostForm from "./AddHostForm/AddHostForm";
import { Host } from "../types";

function AddHostModalForm(props: {
  show: boolean;
  host: Host | null;
  collisionDomains: string[];
  onSubmit: (host: Host) => void;
  onHide: () => void;
}) {
  return (
    <>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Add Host</Modal.Title>
          <Modal.Body>
            <AddHostForm
              collisionDomains={props.collisionDomains}
              onSubmit={props.onSubmit}
              host={props.host}
            ></AddHostForm>
          </Modal.Body>
        </Modal.Header>
      </Modal>
    </>
  );
}

export default AddHostModalForm;
