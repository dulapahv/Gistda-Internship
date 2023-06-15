import React, { Component } from "react";
import { sphere, map, SphereMap } from "./SphereMap";
import env from "react-dotenv";

export { map };

class Map extends Component {
    initMap() {
        if (map) map.Layers.setBase(sphere.Layers.STREETS);
    }

    render() {
        const { mapStyle } = this.props;
        const mapKey = env.API_KEY;
        return (
            <div className={mapStyle}>
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
