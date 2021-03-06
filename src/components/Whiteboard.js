import React, { Component, useState, useRef, useEffect } from "react";
import firebase from "../firebase";

export default class WhiteBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      drawing: false,
      currentColor: "red",
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      cleared: false,
      username: null,
      room: null,
      userList: []
    };

    this.whiteboard = React.createRef();
  }

  componentDidMount() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    firebase.db
      .collection("sessions")
      .doc(this.props.session)
      .collection("whiteboard")
      .onSnapshot(s => {
        s.docs.forEach(d => {
          const drawing = d.data();
          this.drawLine(
            drawing.x0 * w,
            drawing.y0 * h,
            drawing.x1 * w,
            drawing.y1 * h,
            drawing.color
          );
        });
      });

    this.setState({
      whiteboard: this.whiteboard.current
    });
    this.whiteboard.current.style.height = window.innerHeight;
    this.whiteboard.current.style.width = window.innerWidth;

    this.whiteboard.current.addEventListener(
      "mousedown",
      this.onMouseDown,
      false
    );
    this.whiteboard.current.addEventListener("mouseup", this.onMouseUp, false);
    this.whiteboard.current.addEventListener("mouseout", this.onMouseUp, false);
    this.whiteboard.current.addEventListener(
      "mousemove",
      this.throttle(this.onMouseMove, 5),
      false
    );

    this.whiteboard.current.addEventListener(
      "touchstart",
      this.onMouseDown,
      false
    );

    this.whiteboard.current.addEventListener(
      "touchmove",
      this.throttle(this.onTouchMove, 5),
      false
    );

    this.whiteboard.current.addEventListener("touchend", this.onMouseUp, false);

    window.addEventListener("resize", this.onResize);
  }

  drawLine = (x0, y0, x1, y1, color, emit) => {
    let context = this.state.whiteboard.getContext("2d");
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.setState(() => {
      if (!isNaN(x0 / w)) {
        firebase.db
          .collection("sessions")
          .doc(this.props.session)
          .collection("whiteboard")
          .add({
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
          });

        return {
          cleared: false
        };
      }
    });
  };

  onMouseDown = e => {
    console.log(e);
    this.setState(() => {
      return {
        currentX: e.layerX,
        currentY: e.layerY,
        drawing: true
      };
    });
  };

  onMouseUp = e => {
    this.setState(() => {
      return {
        drawing: false,
        currentX: e.layerX,
        currentY: e.layerY
      };
    });
  };

  onMouseMove = e => {
    if (!this.state.drawing) {
      return;
    }

    this.setState(() => {
      return {
        currentX: e.layerX,
        currentY: e.layerY
      };
    }, this.drawLine(this.state.currentX, this.state.currentY, e.layerX, e.layerY, this.state.currentColor, true));
  };

  onTouchMove = e => {
    if (!this.state.drawing) {
      return;
    }
    console.log();
    this.setState(() => {
      this.drawLine(
        this.state.currentX,
        this.state.currentY,
        e.touches[0].layerX,
        e.touches[0].layerY,
        this.state.currentColor,
        true
      );
      return {
        currentX: e.touches[0].layerX,
        currentY: e.touches[0].layerY
      };
    });
  };

  onResize = () => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  };

  throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    return function() {
      let time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  };

  render() {
    return (
      <div>
        <canvas
          height={`${this.state.windowHeight}px`}
          width={`${this.state.windowWidth}px`}
          ref={this.whiteboard}
          className="whiteboard"
        />
      </div>
    );
  }
}

/*
/*function Whiteboard(props) {
  let [drawingState, setDrawingState] = useState({
    id: null,
    drawing: false,
    currentColor: "black",
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    cleared: false,
    username: null,
    room: null
  });

  let whiteboard = useRef();
  useEffect(() => {
    console.log(drawingState);
    if (!drawingState.whiteboard) {
      setDrawingState({
        ...drawingState,
        whiteboard: whiteboard.current
      });
    }

    whiteboard.current.style.height = window.innerHeight;
    whiteboard.current.style.width = window.innerWidth;

    whiteboard.current.addEventListener("mousedown", onMouseDown, false);
    whiteboard.current.addEventListener("mouseup", onMouseUp, false);
    whiteboard.current.addEventListener("mouseout", onMouseUp, false);
    whiteboard.current.addEventListener(
      "mousemove",
      throttle(onMouseMove, 5),
      false
    );
    whiteboard.current.addEventListener("touchstart", onMouseDown, false);
    whiteboard.current.addEventListener(
      "touchmove",
      throttle(onTouchMove, 5),
      false
    );
    whiteboard.current.addEventListener("touchend", onMouseUp, false);
    window.addEventListener("resize", onResize);
  });

  function drawLine(x0, y0, x1, y1, color, emit, force) {
    let context = drawingState.whiteboard.getContext("2d");
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    // if (force) {
    // 	context.lineWidth = 1.75 * (force * (force + 3.75));
    // }
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = window.innerWidth;
    var h = window.innerHeight;
    setDrawingState(() => {
      if (!isNaN(x0 / w)) {
        /*socket.emit("drawing", {
          x0: x0 / w,
          y0: y0 / h,
          x1: x1 / w,
          y1: y1 / h,
          color: color,
          room: this.state.room,
          force: force
        });*/

/*  return {
          ...drawingState,
          cleared: false
        };
      }
    });
  }

  function onMouseDown(e) {
    setDrawingState(() => {
      return {
        ...drawingState,
        currentX: e.layerX,
        currentY: e.layerY,
        drawing: true
      };
    });
  }

  function onMouseUp(e) {
    setDrawingState(() => {
      return {
        ...drawingState,
        currentX: e.layerX,
        currentY: e.layerY,
        drawing: false
      };
    });
  }

  function onMouseMove(e) {
    if (!drawingState.drawing) {
      return;
    }

    setDrawingState(() => {
      return {
        ...drawingState,
        currentX: e.layerX,
        currentY: e.layerY
      };
    }, drawLine(drawingState.currentX, drawingState.currentY, e.layerX, e.layerY, drawingState.currentColor, true));
  }

  function onTouchMove(e) {
    if (!drawingState.drawing) {
      return;
    }
    setDrawingState(() => {
      drawLine(
        drawingState.currentX,
        drawingState.currentY,
        e.touches[0].layerX,
        e.touches[0].layerY,
        drawingState.currentColor,
        true,
        e.touches[0].force
      );
      return {
        ...drawingState,
        currentX: e.touches[0].layerX,
        currentY: e.touches[0].layerY
      };
    });
  }

  function onResize() {
    setDrawingState({
      ...drawingState,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  }

  function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function() {
      let time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  return (
    <div>
      <canvas
        height={`${drawingState.windowHeight}px`}
        width={`${drawingState.windowWidth}px`}
        ref={whiteboard}
        className="whiteboard"
      />
    </div>
  );
}

export default Whiteboard;*/
