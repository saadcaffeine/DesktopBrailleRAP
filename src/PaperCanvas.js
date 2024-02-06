// Canvas component
import React from 'react';
import AppContext from './AppContext';
import paper from 'paper';


const mouseState = {
  NONE: 0,
  MOVE: 1,
  SCALE: 2
};

class PaperCanvas extends React.Component {
  static contextType = AppContext;

  constructor(props) {

    super(props);
    this.canvasRef = React.createRef();

    this.selected = null;
    this.svgs = [];
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.importSvg = this.importSvg.bind(this);
    this.addTxt = this.addTxt.bind(this);
    this.setPositionCurrent = this.setPositionCurrent.bind(this);
    this.setRotate = this.setRotate.bind(this);
    this.resize = this.resize.bind(this);
    this.paperwidth = 210;
    this.paperheight = 290;
    this.usablewidth = 190;
    this.usableheight = 240;
    this.rotate = false;
  }
  resize ()
  {
      if (this.canvasRef.current)
      {
        let canvasWidth = this.canvasRef.current.clientWidth / window.devicePixelRatio;
        let canvasHeight = this.canvasRef.current.clientheight / window.devicePixelRatio;

        let pixelMillimeterRatio = Math.min(canvasWidth / this.paperwidth, canvasHeight / this.paperheight);
        //console.log("canvas width " + this.canvasRef.current.clientWidth);
        //console.log("win ratio " + window.devicePixelRatio);
        //console.log("pix ratio:" + pixelMillimeterRatio);
      
        this.zoom = 1;
        this.pixelRatio = pixelMillimeterRatio;
        this.paper.activate ();
          this.paper.project.activeLayer.scaling = pixelMillimeterRatio;
        //this.paper.project.activeLayer.scaling = pixelMillimeterRatio;
      }
      
  }
  componentDidMount() {

    
    /*window.addEventListener('load', () => */{
      //paper.setup(canvasRef.current);
      this.paper = new paper.PaperScope();
      this.paper.setup(this.canvasRef.current);
      console.log(this.canvasRef.current);
      this.paper.activate();

      console.log("loaded");
      this.paper.settings.insertItems = true;
      this.paper.settings.handleSize = 8;

      let canvasWidth = this.canvasRef.current.width / window.devicePixelRatio;
      let canvasHeight = this.canvasRef.current.height / window.devicePixelRatio;

      let pixelMillimeterRatio = Math.min(canvasWidth / this.paperwidth, canvasHeight / this.paperheight);
      console.log("canvas width " + this.canvasRef.current.width);
      console.log("win ratio " + window.devicePixelRatio);
      console.log("pix ratio:" + pixelMillimeterRatio);

      this.paper.project.activeLayer.applyMatrix = false;
      this.paper.project.activeLayer.scaling = pixelMillimeterRatio;
      this.paper.project.activeLayer.pivot = this.paper.project.activeLayer.bounds.center;
      this.zoom = 1;
      this.pixelRatio = pixelMillimeterRatio;

      //this.paper.project.activeLayer.position = new this.paper.Point(0,0);
      this.paper.project.activeLayer.rotate(0);

      /*
      this.debugpath = new this.paper.Path.Line([0, 0], [this.paperwidth / 2, this.paperheight / 2]);
      this.debugpath.strokeWidth = 1;
      this.debugpath.strokeColor = 'red';
      this.paper.project.activeLayer.addChild(this.debugpath);

      this.debugpath2 = new this.paper.Path.Line([0, 0], [this.paperwidth / 2, this.paperheight / 2]);
      this.debugpath2.strokeWidth = 1;
      this.debugpath2.strokeColor = 'green';
      this.paper.project.activeLayer.addChild(this.debugpath2);
      */

      let bounds = new this.paper.Path.Rectangle(0, 0, this.paperwidth, this.paperheight);
      bounds.strokeWidth = 1;
      bounds.strokeColor = 'black';
      bounds.scaling = 1;
      bounds.strokeScaling = false;
      bounds.locked=true;
      this.paper.project.activeLayer.addChild(bounds);

      bounds = new this.paper.Path.Rectangle(0, 0, this.usablewidth, this.usableheight);
      bounds.strokeWidth = 1;
      bounds.strokeColor = 'red';
      bounds.scaling = 1;
      bounds.strokeScaling = false;
      bounds.locked = true;
      this.paper.project.activeLayer.addChild(bounds);

      let text = new paper.PointText({
        point: [25, 25],
        justification: 'left',
        content: 'Demo',
        fillColor: '#00000090',
        fontFamily: 'Courier New',
        fontWeight: 'bold',
        fontSize: 10,
        pivot: [0, -10]
      });
      text.selected = false;
      text.bounds.selected = false;
      text.applyMatrix = false;
      text.locked = false;
      //text.pivot = [0, -10];
      this.paper.project.activeLayer.addChild(text);

      this.paper.view.on('mousemove', this.mouseMove);
      this.paper.view.on('mouseup', this.mouseUp);
      this.paper.view.on('mousedown', this.mouseDown);
      //this.paper.view.on("resize", this.resize);

      this.context.SetPaper(this.paper);
      this.context.SetImportSVG(this.importSvg);
      this.context.SetImportText(this.addTxt);
      this.context.SetPaperCanvas(this);

      // window.addEventListener('resize', () => {
      //   this.resize ();
      // });
  
    }
    /*);*/

    //this.context.SetPaper ("blabla toto it work");

  }
  setRotate(val) {
    this.rotate = val;
  }
  getRotate() {
    return this.rotate;
  }
  setPositionCurrent(x, y) {
    if (x === undefined || y === undefined)
      return;
    if (this.selected) {
      this.selected.position.x = x;
      this.selected.position.y = y;
      this.signalSelectedChange();
    }
  }

  deselectChildren(element) {
    if (element.bounds)
      element.bounds.selected = false;
    if (element.children)
      for (let i = 0; i < element.children.length; i++) {
        element.children[i].selected = false;
        if (element.children[i].bounds)
          element.children[i].bounds.selected = false;
        if (element.children[i].children) this.deselectChildren(element.children[i]);
      }
  }
  deselectAll() {
    this.paper.project.deselectAll();
    this.deselectChildren(this.paper.project.activeLayer);
    if (this.selected)
      this.selected.bounds.select = false;
    this.selected = null;
  }
  addTxt(txt) {
    this.deselectAll();
    let text = new paper.PointText({
      point: [this.paperwidth / 2, this.paperheight / 2],
      justification: 'left',
      content: txt,
      fillColor: '#00000080',
      fontFamily: 'Courier New',
      fontWeight: 'bold',
      fontSize: 10
    });
    text.applyMatrix = false;
    text.selected = false;
    text.bounds.selected = true;
    text.pivot = [0, -10];
    text.locked = false;
    this.paper.project.activeLayer.addChild(text);
    this.selected = text;

    this.signalSelectedChange();
  }

  importSvg(data) {
    console.log(data);
    //var url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/tiger.svg`
    let isvg = this.paper.project.importSVG(data, (item) => {
      console.log('loaded svg');
      item.strokeScaling = false;
      item.pivot = item.bounds.topLeft;
      item.position = new this.paper.Point((this.paperwidth - item.bounds.width) / 2, (this.paperheight - item.bounds.height) / 2);

      //item.scale(0.5)
      //item.position = new this.paper.Point(item.bounds.width/2, item.bounds.height/2)
      let mmPerPixels = 1;
      //if (item.bounds.width)
      //    mmPerPixels = 105 /item.bounds.width;
      item.scale(mmPerPixels);
      item.bounds.selected = false;
      item.name = data.name;
      item.locked = false;
      console.log(item);

      console.log('svg item :' + item);
      
      return item;
    });

    this.paper.project.activeLayer.addChild(isvg);

    return isvg;
  }
  SelectedDelete() {
    if (this.selected)
    {
      this.selected.remove();
    }
  }



  SelectedUp() {
    if (this.selected)
    {
      this.selected.bringToFront();
    }
  }



  SelectedDown() {
    if (this.selected)
    {
      this.selected.sendToBack();
    }
  }

  signalSelectedChange() {
    if (this.selected) {
      this.context.setPosition([this.selected.position.x, this.selected.position.y]);
      this.context.setSize([this.selected.bounds.width, this.selected.bounds.height]);
      this.context.setAngle(this.selected.rotation);
    }
  }

  mouseMove(event) {
    if (this.selected && this.mouse_state === mouseState.MOVE) {
      if (!this.rotate) {
        //let delta = this.paper.project.activeLayer.globalToLocal(event.delta)
        let delta = event.delta;
        delta.x = event.delta.x / this.paper.project.activeLayer.scaling.x;
        delta.y = event.delta.y / this.paper.project.activeLayer.scaling.y;


        this.signalSelectedChange();

        this.selected.translate(delta);
      }
      else {
        let mousepos = new this.paper.Point(0, 0);
        mousepos.x = event.point.x / this.paper.project.activeLayer.scaling.x;
        mousepos.y = event.point.y / this.paper.project.activeLayer.scaling.y;

        let delta = new this.paper.Point(0, 0);
        delta.x = event.delta.x / this.paper.project.activeLayer.scaling.x;
        delta.y = event.delta.y / this.paper.project.activeLayer.scaling.y;

        let start = new this.paper.Point(0, 0);
        start.x = mousepos.x - delta.x;
        start.y = mousepos.y - delta.y;

        
        

        let v1 = new this.paper.Point(0, 0);
        let v2 = new this.paper.Point(0, 0);
        
        if (this.selected.className !== "PointText")
        {
          this.selected.pivot = this.selected.bounds.center;
          v1.x = start.x - this.selected.bounds.center.x;
          v1.y = start.y - this.selected.bounds.center.y;
          v2.x = mousepos.x - this.selected.bounds.center.x;
          v2.y = mousepos.y - this.selected.bounds.center.y;

          /*
          this.debugpath.segments[0].point = this.selected.bounds.center;
          this.debugpath.segments[1].point = mousepos;
          this.debugpath2.segments[0].point = this.selected.bounds.center;
          this.debugpath2.segments[1].point = start;
          */
        }
        
        else
        {
          
          v1.x = start.x - this.selected.position.x;
          v1.y = start.y - this.selected.position.y;
          v2.x = mousepos.x - this.selected.position.x;
          v2.y = mousepos.y - this.selected.position.y;

          /*
          this.debugpath.segments[0].point = this.selected.position;
          this.debugpath.segments[1].point = mousepos;

        
          this.debugpath2.segments[0].point = this.selected.position;
          this.debugpath2.segments[1].point = start;
          */
        
        }
        
        this.selected.rotate(v2.angle - v1.angle);
        console.log (this.selected.rotation);
        this.signalSelectedChange();
        
        if (this.selected.className !== "PointText")
        {
          this.selected.pivot = this.selected.bounds.topLeft;
        }
        
      }

    }
  }

  mouseUp(event) {
    if (this.selected && this.mouse_state === mouseState.MOVE) {
      //let delta = this.paper.project.activeLayer.globalToLocal(event.delta)
      //this.selected.translate (delta);
    }
    this.mouse_state = mouseState.NONE;
  }
  mouseDown(event) {


    //console.log(event.point);
    //console.log(this.paper.project.activeLayer.globalToLocal(event.point));
    if (this.selected) {
      let handle = this.selected.hitTest(
        this.paper.project.activeLayer.globalToLocal(event.point),
        {
          handles: true,
          selected: true,
          bounds: true,
          tolerance: this.paper.settings.handleSize
        }
      );
      //console.log('handle ' + handle);
      if (handle) {
        console.log('handle hit');
      } else {
        handle = this.selected.hitTest(
          this.paper.project.activeLayer.globalToLocal(event.point)
        );
        if (handle) {
          this.mouse_state = mouseState.MOVE;
        } else {
          if (this.selected.bounds.contains (this.paper.project.activeLayer.globalToLocal(event.point)))
          {
            this.mouse_state = mouseState.MOVE;
          }
          else
            this.deselectAll();
        }
      }
    } else {
      let clicked = this.paper.project.activeLayer.hitTest(event.point,
        {
          stroke: true,
          bounds: true,
          fill: true,
          tolerance: this.paper.settings.hitTolerance
        });
      if (! clicked)
      {
        
        this.paper.project.getItem({
            recursive: true,
            bounds: bounds => bounds.contains(this.paper.project.activeLayer.globalToLocal(event.point)),
            match: item => {
              console.log ("serach " + item.bounds + " " + this.paper.project.activeLayer.globalToLocal(event.point) + 
                " " + clicked + " " + item.className + " " + item.locked) ;
                if (item.locked === false && item.className !== "Layer")
                {
                  if (!clicked || item.isAbove(clicked) )  {
                      clicked = item;
                  }
                }
                return false;
            },
        });
        console.log (clicked);
      }
      let item = null;
      if (clicked)
      {
        if (clicked.item)
          item = clicked.item;
        else
          item = clicked;
      }
      if (item) {
        
          console.log('clicked:' + item);
          
          // get svg fom item
          while (item.parent != null) {
            if (item.parent.className === 'Layer') break;

            item = item.parent;
            //console.log(item.className);
          }
          console.log(item.className);
          item.bounds.selected = true;
          this.selected = item;

          this.signalSelectedChange();

        
      } else {
        this.deselectAll();
      }
    }
    
  }
  setOffset(x, y) {
    let mat = this.paper.project.activeLayer.matrix;
    mat.tx = x;
    mat.ty = y;
    this.paper.project.activeLayer.matrix = mat;
  }
  render() {
    return (
      <canvas id={this.props.Id} ref={this.canvasRef} hdmi resize>
        {this.props.children}
      </canvas>
    );
  }
}
export default PaperCanvas;