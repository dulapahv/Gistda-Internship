import React, { Component } from 'react';

import env from 'react-dotenv';

import { map, sphere, SphereMap } from './SphereMap';

export { map, sphere };

export default class Map extends Component {
  initMap() {
    if (map) map.Layers.setBase(sphere.Layers.STREETS);
  }

  render() {
    const { mapStyle } = this.props;
    const mapKey = env.API_KEY;
    return (
      <div className={mapStyle}>
        <SphereMap id='sphere-map' mapKey={mapKey} callback={this.initMap} />
      </div>
    );
  }
}