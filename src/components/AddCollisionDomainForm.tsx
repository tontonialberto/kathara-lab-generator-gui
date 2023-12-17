import { ChangeEvent, FormEvent, useState } from "react";
import { Form, Button } from "react-bootstrap";

function AddCollisionDomainForm(props: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  function nameChangeHandler(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    if (event.target.value.length > 0) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }

  function formSubmitHandler(event: FormEvent) {
    event.preventDefault();
    props.onSubmit(name);
    setName("");
    setCanSubmit(false);
  }

  return (
    <>
      <Form onSubmit={formSubmitHandler}>
        <Form.Group>
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Domain Name"
            value={name}
            onChange={nameChangeHandler}
          />
        </Form.Group>
        <Form.Group>
          <Button variant="primary" type="submit" disabled={!canSubmit}>
            Add Collision Domain
          </Button>
        </Form.Group>
      </Form>
    </>
  );
}

export default AddCollisionDomainForm;
