import React, { Component } from 'react';

export let sphere;
export let map;

export class SphereMap extends Component {
  constructor(props) {
    super(props);
    this.mapCallback = this.mapCallback.bind(this);
    this.forceRender = true;
  }

  componentDidMount() {
    const existingScript = document.getElementById('sphereMapScript');
    const { callback } = this.props;

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://api.sphere.gistda.or.th/map/?key=${this.props.mapKey}`;
      script.id = 'sphereMapScript';
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
      map.Event.bind(sphere.EventName.Ready, function () {
        window.sphereDrawLoaded = true;
        window.sphere.Util.loadStyle(
          sphere.Server.map + '/js/mapbox-gl-draw.css'
        );
        window.sphere.Util.loadScript(
          sphere.Server.map + '/js/mapbox-gl-draw.js',
          () => {
            // see more options https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md#options
            const drawOptions = {
              controls: {
                point: false,
                line_string: false,
                polygon: true,
                trash: true,
                combine_features: true,
                uncombine_features: true,
              },
            };
            var drawPanel = new window.MapboxDraw(drawOptions);
            map.Renderer.addControl(drawPanel, 'top-right'); // see details https://docs.mapbox.com/mapbox-gl-js/api/#map#addcontrol
            map.Renderer.addControl(new HomeButton());
          }
        );
        map.bound(
          {
            minLon: 97.343699,
            minLat: 5.612738,
            maxLon: 105.636781,
            maxLat: 20.464926,
          },
          { padding: { top: 7, bottom: 7 } }
        );
      });
    }
  }

  render() {
    return (
      <div
        id={this.props.id}
        className='w-full h-full rounded-t-lg md:rounded-none md:rounded-r-lg'
      />
    );
  }
}

class HomeButton {
  onAdd() {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    this._button = document.createElement('button');
    this._button.className = 'mapboxgl-ctrl-icon';

    this._icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._icon.setAttribute('width', '24');
    this._icon.setAttribute('height', '24');
    this._icon.setAttribute('viewBox', '-3 0 25 25');
    this._icon.setAttribute('stroke-width', '2');
    this._icon.setAttribute('fill', '#213a7e');
    this._icon.setAttribute('stroke-linecap', 'round');
    this._icon.setAttribute('stroke-linejoin', 'round');

    this._path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._path.setAttribute(
      'd',
      'M21.71,11.29l-9-9a1,1,0,0,0-1.42,0l-9,9a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,13H4v7.3A1.77,1.77,0,0,0,5.83,22H8.5a1,1,0,0,0,1-1V16.1a1,1,0,0,1,1-1h3a1,1,0,0,1,1,1V21a1,1,0,0,0,1,1h2.67A1.77,1.77,0,0,0,20,20.3V13h1a1,1,0,0,0,.92-.62A1,1,0,0,0,21.71,11.29Z'
    );
    this._icon.appendChild(this._path);

    this._button.appendChild(this._icon);
    this._container.appendChild(this._button);

    this._container.onclick = () => {
      this._map.bound(
        {
          minLon: 97.343699,
          minLat: 5.612738,
          maxLon: 105.636781,
          maxLat: 20.464926,
        },
        { padding: { top: 7, bottom: 7 } }
      );
    };
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  getDefaultPosition() {
    return 'top-left';
  }
}
