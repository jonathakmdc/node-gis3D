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

function getTooltip({ object }) {
  if (object) {
    if (object.displayColumns) {
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
    const objHexagon = object?.points?.[0].source;
    if (objHexagon) {
      if (objHexagon.displayColumnsHexagon) {
        const html = objHexagon.displayColumnsHexagon
          .map(
            ({ column, label }) =>
              `<div>
          <b>${label}: </b>${objHexagon[column]}
        </div>`
          )
          .join('');
        return {
          html: `${html}`,
        };
      }
    }
  }
}

const Map = observer(() => {
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

  return (
    <div id="map" style={{ width: '100%', height: '96%', position: 'absolute' }}>
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
