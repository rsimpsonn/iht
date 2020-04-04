import React, { Component } from "react";
import { SketchField, Tools } from "react-sketch";
import socketIOClient from "socket.io-client";
import shortid from "shortid";

class WhiteboardScreen extends Component {
  constructor(props) {
    super(props);

    this.newChanges = this.newChanges.bind(this);
  }

  newChanges(e, data) {
    console.log(e, data);
  }

  onUpdate(obj) {
    console.log(obj);
  }

  render() {
    return (
      <div>
        <SketchField
          className="canvas"
          ref={c => (this._sketch = c)}
          width="1024px"
          height="768px"
          lineColor="black"
          lineWidth={3}
          onChange={this.newChanges}
          shortid={shortid}
          onUpdate={this.onUpdate}
        />
        )}
      </div>
    );
  }
}

export default WhiteboardScreen;
