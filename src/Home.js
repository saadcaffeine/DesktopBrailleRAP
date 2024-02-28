import React from 'react';
import { useContext, useEffect } from 'react';
import AppContext from "./AppContext";

class Home extends React.Component {
  static contextType = AppContext;
  //const {setParams, setPyWebViewReady} = useContext(AppContext);
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.params) {
      console.log("Home componentDidMount " + this.props.params + " " + this.props.params.Paper.width);
      if (this.props.params) {
        console.log("setting up params")
        this.context.setParams(this.props.params);
      }
    }

    if (this.props.webviewready)
      this.context.setPyWebViewReady(this.props.webviewready);
    return () => {
      console.log("Home Cleaning up");
    };
  }

  render() {
    return (
      <>
        <div className="Home">
          
          <a href="https://www.braillerap.org" target="_blank">
            <img src="./braillerap_logo.svg" width='25%' alt="BrailleRAP logo"  />
          </a>
          <h1>DesktopBrailleRAP</h1>
          <h2>Version:{`${process.env.REACT_APP_VERSION}`}</h2>
        </div>
      </>

    );
  }
};

export default Home;