import React, { useState, useEffect } from 'react';
import './style.css';
import { observer } from 'mobx-react';
import Layers from './layers3D';
import { GeoJsonLayer, PolygonLayer, BitmapLayer } from '@deck.gl/layers';
import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { DeckGL } from 'deck.gl';
import { scaleThreshold } from 'd3-scale';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { MapContainer } from 'react-leaflet';
import { useStores } from '../../hooks/useStores';
import { Spin, Button } from 'antd';
import { MinusOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';

const center = [-12.966901, -50.366484];
const zoom = 3;

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json';

export const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38],
  ]);

const INITIAL_VIEW_STATE = {
  latitude: center[0],
  longitude: center[1],
  zoom: zoom,
  minZoom: zoom,
  maxZoom: 15,
  pitch: 40,
  bearing: 0,
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true,
});

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196],
  ],
];

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

function getTooltip({ object }) {
  if (object) {
    if (object.displayColumns && object.displayColumns.length > 0) {
      const html = object.displayColumns
        .map(
          ({ column, label }) =>
            `<div>
          <b>${label}: </b>${object[column]}
        </div>`
        )
        .join('');
      return {
        html: `${html}`,
      };
    }
  }
}

const Map = observer(({ data = DATA_URL, mapStyle = MAP_STYLE }) => {
  const [layers3D, setLayers3D] = useState([]);
  const [viewState, setViewState] = useState();
  const { mapStore } = useStores();

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const resetView = () => {
    const stateCopy = viewState;
    stateCopy.longitude = INITIAL_VIEW_STATE.longitude;
    stateCopy.latitude = INITIAL_VIEW_STATE.latitude;
    stateCopy.zoom = INITIAL_VIEW_STATE.zoom;
    stateCopy.pitch = INITIAL_VIEW_STATE.pitch;
    stateCopy.bearing = INITIAL_VIEW_STATE.bearing;
    stateCopy.transitionDuration = 1000;
    setViewState(stateCopy);
  };

  const zoomIn = () => {
    const stateCopy = viewState;
    stateCopy.zoom = stateCopy.zoom + 0.2;
    stateCopy.transitionDuration = 200;
    if (stateCopy.zoom <= INITIAL_VIEW_STATE.maxZoom) {
      setViewState(stateCopy);
    }
  };

  const zoomOut = () => {
    const stateCopy = viewState;
    stateCopy.zoom = stateCopy.zoom - 0.2;
    stateCopy.transitionDuration = 200;
    if (stateCopy.zoom >= INITIAL_VIEW_STATE.minZoom) {
      setViewState(stateCopy);
    }
  };

  const layers = [
    new TileLayer({
      // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
      data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      // data: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',

      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,

      renderSubLayers: (props: any) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile;

        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json',
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f) => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: (f) => COLOR_SCALE(f.properties.growth),
      getLineColor: [255, 255, 255],
      pickable: true,
    }),
  ];

  return (
    <div id="map" style={{ width: '100%', height: '90%', position: 'absolute' }}>
      <Layers onSelectLayers={(layers) => setLayers3D(layers)} />
      {!mapStore.loadingMap ? (
        <DeckGL
          layers={layers3D}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          onViewStateChange={({ viewState }) => {
            setViewState(viewState);
          }}
          controller={true}
          getTooltip={getTooltip}
        >
          <span
            style={{
              zIndex: '999999999999',
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: '35px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Button
              size="default"
              icon={<PlusOutlined />}
              onClick={() => {
                zoomIn();
              }}
            ></Button>
            <Button
              size="default"
              icon={<MinusOutlined />}
              onClick={() => {
                zoomOut();
              }}
            ></Button>
            <Button
              size="default"
              icon={<HomeOutlined />}
              onClick={() => {
                resetView();
              }}
            ></Button>
          </span>
          <span
            style={{
              zIndex: '999999999999',
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '200px',
              fontSize: '10pt',
              background: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
          </span>
        </DeckGL>
      ) : (
        <Spin />
      )}
    </div>
  );
});

export default Map;
