import React from "react";





import PathFinderVisualiser from "./pathFinderVisualiser/pathfinderVisualiser";

// Stylesheets
import "./App.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>

       <PathFinderVisualiser/>

      
      </div>
    );
  }
}