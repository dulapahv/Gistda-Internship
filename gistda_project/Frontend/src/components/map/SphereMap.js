import React, { Component } from "react";

export let sphere;
export let map;

export class SphereMap extends Component {
  constructor(props) {
    super(props);
    this.mapCallback = this.mapCallback.bind(this);
    this.forceRender = true;
  }

  componentDidMount() {
    const existingScript = document.getElementById("sphereMapScript");
    const { callback } = this.props;

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://api.sphere.gistda.or.th/map/?key=${this.props.mapKey}`;
      script.id = "sphereMapScript";
      document.body.appendChild(script);

      script.onload = () => {
        try {
          this.mapCallback();
          if (callback) callback();
        } catch {}
      };
    }

    if (existingScript) this.mapCallback();
    if (existingScript && callback) callback();

    this.forceRender = !this.forceRender;
  }

  mapCallback() {
    if (window.sphere) {
      sphere = window.sphere;
      map = new window.sphere.Map({
        placeholder: document.getElementById(this.props.id),
      });
    }
  }

  render() {
    return (
      <div
        id={this.props.id}
        className="w-full h-full rounded-t-lg md:rounded-none md:rounded-r-lg"
      />
    );
  }
}
