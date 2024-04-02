import React from 'react';
import AppContext from './AppContext';
import paper from 'paper';
import BrailleToGeometry from './BrailleToGeometry';
import GeomToGCode from './GeomToGCode';
import DotGrid from './dotgrid';
import GeomPoint from './GeomPoint';
import FileSaver from 'file-saver';
import Modal from 'react-modal'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Print extends React.Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      comevent: "",
      printstatus: ""
    };

    this.canvasRef = React.createRef();

    this.ptcloud = [];

    this.HandleDownload = this.HandleDownload.bind(this);
    this.HandleRefresh = this.HandleRefresh.bind(this);
    this.HandlePrint = this.HandlePrint.bind(this);
    this.resize = this.resize.bind(this);
  }

  componentDidMount() {
    
    //paper.setup(canvasRef.current);
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvasRef.current);

    this.paper.settings.insertItems = false;
    this.paper.settings.handleSize = 8;

    this.initPaper();
    this.buildpage();
  }
  initPaper() {
    let canvasWidth = this.canvasRef.current.width / window.devicePixelRatio;
    let canvasHeight = this.canvasRef.current.height / window.devicePixelRatio;

    let pixelMillimeterRatio = Math.min(canvasWidth / this.context.Params.Paper.width, canvasHeight / this.context.Params.Paper.height);
    console.log("canvas width " + this.canvasRef.current.width);
    console.log("win ratio " + window.devicePixelRatio);
    console.log("pix ratio:" + pixelMillimeterRatio);

    this.paper.project.activeLayer.applyMatrix = false;
    this.paper.project.activeLayer.scaling = pixelMillimeterRatio;
    this.paper.project.activeLayer.pivot = this.paper.project.activeLayer.bounds.center;
    this.zoom = 1;
    this.pixelRatio = pixelMillimeterRatio;

    let bounds = new this.paper.Path.Rectangle(0, 0, this.context.Params.Paper.width, this.context.Params.Paper.height);
    bounds.name = "Paper";
    bounds.strokeWidth = 1;
    bounds.strokeColor = 'black';
    bounds.scaling = 1;
    bounds.strokeScaling = false;
    this.paper.project.activeLayer.addChild(bounds);

    let bounds2 = new this.paper.Path.Rectangle(0, 0, this.context.Params.Paper.usablewidth, this.context.Params.Paper.usableheight);
    bounds2.name = "Usable";
    bounds2.strokeWidth = 1;
    bounds2.strokeColor = 'red';
    bounds2.scaling = 1;
    bounds2.strokeScaling = false;
    this.paper.project.activeLayer.addChild(bounds2);


    let text = new paper.PointText({
      point: [105, 140],
      justification: 'center',
      content: 'Preview',
      fillColor: '#80000090',
      fontFamily: 'Courier New',
      fontWeight: 'bold',
      fontSize: 10,
      pivot: [0, -10]

    });
    text.selected = false;
    text.bounds.selected = false;
    text.applyMatrix = false;
    text.pivot = [0, -10];
    this.paper.project.activeLayer.addChild(text);



  }

  resize() {
    return;
    if (this.canvasRef !== null && this.canvasRef.current !== null) {
      let canvasWidth = this.canvasRef.current.clientWidth / window.devicePixelRatio;
      let canvasHeight = this.canvasRef.current.clientHeight / window.devicePixelRatio;

      let pixelMillimeterRatio = Math.min(canvasWidth / this.context.Params.Paper.width, canvasHeight / this.context.Params.Paper.height);
      this.zoom = 1;
      this.pixelRatio = pixelMillimeterRatio;
      this.paper.activate();
      this.paper.project.activeLayer.scaling = pixelMillimeterRatio;
    }
  }

  buildpage() {
    let canv = this.context.GetPaperCanvas();

    if (canv) {
      let gcode = "";
      let GeomBraille = [];
      let GeomVector = [];

      let b = new BrailleToGeometry();

      let bounds = canv.paper.project.activeLayer.bounds;
      let element = canv.paper.project.activeLayer;
      this.plotItem(element, gcode, bounds, GeomBraille, GeomVector);
      
      let f = new DotGrid(this.context.Params.Paper.usablewidth, 
          this.context.Params.Paper.usableheight, 
          this.context.Params.stepvectormm, 
          this.context.Params.stepvectormm);
      f.setarray(GeomBraille);
      let FilteredVector = f.filter(GeomVector);
      
      GeomBraille = GeomBraille.concat(FilteredVector);
      let sorted = [];
      if (this.context.Params.ZigZagBloc === true) {
         sorted = b.SortGeomZigZagBloc(GeomBraille); 
        console.log ("optim zigzag") ;
      }
      else
        sorted = b.SortGeomZigZag(GeomBraille);
      
      this.ptcloud = sorted;  // save dots for printing

      // display dots on preview
      for (let i = 0; i < sorted.length; i++) {

        let dot = new this.paper.Path.Circle(new this.paper.Point(sorted[i].x, sorted[i].y), 0.5);
        dot.strokeWidth = 1;
        dot.strokeColor = 'black';
        dot.scaling = 1;
        dot.strokeScaling = false;
        dot.fillColor = 'black';
        this.paper.project.activeLayer.addChild(dot);

        /*
         let text = new paper.PointText({
           point: [sorted[i].x, sorted[i].y],
           justification: 'center',
           content: i.toString(),
           fillColor: '#80000090',
           fontFamily: 'Courier New',
           fontWeight: 'light',
           fontSize: 3,
           pivot: [0, -6]
         });
         text.selected = false;
         text.bounds.selected = false;
         text.applyMatrix = false;
         //text.pivot = [0, -10];
         this.paper.project.activeLayer.addChild(text);
         */
      }

    }
  }
  itemMustBeDrawn(item) {
    return (item.strokeWidth > 0 && item.strokeColor != null) || item.fillColor != null;
  }

  plotItem(item, gcode, bounds, GeomBraille, GeomVector) {
    if (!item.visible) {
      return
    }


    console.log("plot:" + item.className);
    if (item.className === 'Shape') {
      let shape = item
      if (this.itemMustBeDrawn(shape)) {
        let path = shape.toPath(true)
        item.parent.addChildren(item.children)
        item.remove()
        item = path
      }
    }
    if (item.locked === true)
      return;
    if ((item.className === 'PointText')) {
      if (this.props.louis.isInit()) {
        let g = new BrailleToGeometry();

        let transcript = this.props.louis.unicode_translate_string(item.content, this.context.Params.brailletbl);

        let v = new this.paper.Point(item.handleBounds.topRight.x - item.handleBounds.topLeft.x,
          item.handleBounds.topRight.y - item.handleBounds.topLeft.y);

        let n = new this.paper.Point(item.handleBounds.bottomLeft.x - item.handleBounds.topLeft.x,
          item.handleBounds.bottomLeft.y - item.handleBounds.topLeft.y
        );

        v = v.rotate(item.rotation);
        n = n.rotate(item.rotation);
        v = v.normalize();
        n = n.normalize();
       
        let pts = g.BrailleStringToGeom(transcript, item.position.x, item.position.y, v.x, v.y, n.x, n.y);

        for (let i = 0; i < pts.length; i++)
          GeomBraille.push(pts[i]);
        

      }
    }
    if ((item.className === 'Path' ||
      item.className === 'CompoundPath') && item.strokeWidth > 0.001) {
      let path = item

      if (path.segments != null) {
        for (let i = 0; i < path.length; i += this.context.Params.stepvectormm) {
          let dot = new this.paper.Path.Circle(path.getPointAt(i), 1);
          GeomVector.push(new GeomPoint(dot.position.x, dot.position.y));
        }
      }
    }
    if (item.children == null) {
      return;
    }
    for (let child of item.children) {
      this.plotItem(child, gcode, bounds, GeomBraille, GeomVector)
    }
  }
  HandleRefresh() {
    this.paper.project.clear();
    this.initPaper();
    this.buildpage();
  }
  HandleDownload() {
    if (this.ptcloud.length > 0) {
      let gcoder = new GeomToGCode(this.context.Params.Speed);
      gcoder.GeomToGCode(this.ptcloud);
      let gcode = gcoder.GetGcode();
      //console.log (gcode);
      let blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "braille.gcode");
    }
  }
  HandlePrint() {

    if (this.ptcloud.length > 0 && this.props.webviewready === true) {
      let gcoder = new GeomToGCode(this.context.Params.Speed);
      gcoder.GeomToGCode(this.ptcloud);
      let gcode = gcoder.GetGcode();
      //console.log (gcode);
      console.log("go modal " + this.context.Params.comport);
      this.setState({ comevent: "" });
      this.setState({ showModal: true });

      // request backend to print gcode
      window.pywebview.api.PrintGcode(gcode, this.context.Params.comport).then(status => {
        // remove modal status screen

        console.log(status);
        this.setState({ showModal: false, printstatus: status });
        // set a timer to call setstate with a little delay
        // because form change are disabled for screen reader due to
        // modal status box

        this.timer = setInterval(() => {
          this.StatusPrintEnd();
        }, 500);

      }
      );
    }
  }
  StatusPrintEnd() {
    if (this.timer)
      clearInterval(this.timer);
    let msg = "Impression terminée " + this.state.printstatus;
    this.setState({ comevent: msg });
  }
  render() {
    return (
      <>
        <Modal
          isOpen={this.state.showModal}
          contentLabel=""
          aria={{ hidden: false, label: ' ' }}
        >
          <div aria-hidden={false} className='ModalView'>

            <h3>
              Impression en cours
            </h3>
            <br />
            <h3>
              Merci de patienter
            </h3>

          </div>
        </Modal>
        <div className="Print">


          <div className="PrintCanvas">
            <canvas id="previewid" ref={this.canvasRef} hdmi resize>

            </canvas>
          </div>
          <div className="PrintTitle">
            <h3>Apercu avant impression</h3>
            <button className="pure-button " onClick={this.HandleDownload}>
              <FontAwesomeIcon icon={icon({ name: 'download', family: 'classic', style: 'solid' })} />
              &nbsp;Télécharger
            </button>
            &nbsp;
            <button className="pure-button  " onClick={this.HandlePrint}>
              <FontAwesomeIcon icon={icon({ name: 'print', family: 'classic', style: 'solid' })} />
              &nbsp;Imprimer
            </button>
            &nbsp;
            <button className="pure-button " onClick={this.HandleRefresh}>
              <FontAwesomeIcon icon={icon({ name: 'rotate-right', family: 'classic', style: 'solid' })} />
              &nbsp;Rafraichir
            </button>
            <p>{this.context.Params.comport}</p>
            <h3>{this.state.comevent}</h3>
          </div>
        </div>
      </>


    );
  }
};

export default Print;