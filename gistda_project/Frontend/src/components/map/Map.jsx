import React, { Component } from "react";
import { sphere, map, SphereMap } from "./SphereMap";
import env from "react-dotenv";

class Map extends Component {
    initMap() {
        if (map) map.Layers.setBase(sphere.Layers.STREETS);
    }

    render() {
        const mapKey = env.API_KEY;
        return (
            <div className="App">
                <div className="h-[calc(100vh-12rem)]">
                    <SphereMap
                        id="sphere-map"
                        mapKey={mapKey}
                        callback={this.initMap}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            </div>
        );
    }
}

export default Map;
