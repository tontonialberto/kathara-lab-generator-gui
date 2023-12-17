import { ChangeEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";

function GraphLayoutSelector(props: {
  layouts: string[];
  defaultLayout: string;
  onSelect: (layout: string) => void;
}) {
  const [selectedLayout, setSelectedLayout] = useState(props.defaultLayout);

  function layoutSelectionChangeHandler(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedLayout(event.target.value);
  }

  return (
    <>
      <Form.Select
        value={selectedLayout}
        onChange={layoutSelectionChangeHandler}
      >
        {props.layouts.map((layout) => (
          <option key={layout} value={layout}>
            {layout}
          </option>
        ))}
      </Form.Select>
      <Button onClick={() => props.onSelect(selectedLayout)}>
        Adjust Layout
      </Button>
    </>
  );
}

export default GraphLayoutSelector;