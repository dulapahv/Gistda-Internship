import React, { Component } from "react";
import { sphere, map, SphereMap } from "./SphereMap";
import env from "react-dotenv";

class Map extends Component {
    initMap() {
        map.Layers.setBase(sphere.Layers.STREETS);
    }

    render() {
        const mapKey = env.API_KEY;
        return (
            <div className="App">
                [map should be here]
                <SphereMap
                    id="sphere-map"
                    mapKey={mapKey}
                    callback={this.initMap}
                />
            </div>
        );
    }
}

export default Map;
