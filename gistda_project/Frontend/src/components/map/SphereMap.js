import React, { Component, useEffect } from "react";

export let sphere;
export let map;

export class SphereMap extends Component {
    constructor(props) {
        super(props);
        this.mapCallback = this.mapCallback.bind(this);
        this.forceRender = false;
    }

    mapCallback() {
        if (window.sphere) {
            sphere = window.sphere;
            map = new window.sphere.Map({
                placeholder: document.getElementById(this.props.id),
                language: "en",
            });
        }
    }

    componentDidMount() {
        const existingScript = document.getElementById("sphereMapScript");
        const callback = this.props.callback;

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

    render() {
        return (
            <div
                id={this.props.id}
                style={{ width: "100%", height: "100%" }}
            ></div>
        );
    }
}
