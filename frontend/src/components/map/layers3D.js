import React, { createRef, useEffect, useState } from 'react';
import './style.css';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import SidePanel from '../sidePanel/index3D';
import Legend from '../legend';
import { Alert, Button } from 'antd';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { GeoJsonLayer, BitmapLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers/typed';

const Layers = observer(({ onSelectLayers }) => {
  const { mapStore } = useStores();
  const [layersRefs, setLayersRefs] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const baseLayer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    // data: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',

    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  useEffect(() => {
    const refs = {};
    if (isInitialLoad) {
      //colocar camada base
      onSelectLayers([baseLayer]);

      setIsInitialLoad(false);
      mapStore.loadSavedLayers();
    }

    mapStore.layers.forEach((layer) => {
      refs[layer.key] = createRef();
    });

    setLayersRefs(refs);
  }, [mapStore.layersKeys]);

  const hexToRgb = (hex) =>
    hex
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  const hexToRgba = (hex, opacity) => {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const validOpacity = Math.round(Math.min(1, Math.max(0, opacity)) * 255);

    return [r, g, b, validOpacity];
  };

  const getColorsHexagon = (def) => {
    const colorRange = [];

    colorRange.push(hexToRgba(def.defaultColor, 1));

    for (let i = 0; i < def.values.length; i++) {
      colorRange.push(hexToRgba(def.values[i].color, 1));
    }

    return colorRange;
  };

  const getColorValueHexagon = (equal, values, value) => {
    let position = 0;

    if (equal) {
      for (let i = 0; i < values.length; i++) {
        if (Number(value) === Number(values[i].value)) {
          position = values[i].pos + 1;
        }
      }
    } else {
      for (let i = 0; i < values.length; i++) {
        if (Number(value) >= Number(values[i].value)) {
          position = values[i].pos + 1;
        } else {
          break;
        }
      }
    }
    return position;
  };

  const getColorHighLight = (f) => {
    if (mapStore.selectFeaturesMode) {
      return hexToRgba(mapStore.selectFeaturesMode === 'first' ? '#FFFF00' : '#b81212', 0.7);
    } else {
      return hexToRgba('#ffffff', 0);
    }
  };

  const handleClickEvent3D = (e, key) => {
    console.log(e);
    if (mapStore.selectFeaturesMode) {
      if (mapStore.isFeatureSelected(key, e.object.gid ?? e.object.GID ?? '1')) {
        mapStore.removeFeatureFromSelection3D(key, e.object.gid ?? e.object.GID ?? '1');
      } else {
        const gid = e.object.gid ?? e.object.GID ?? '1';
        mapStore.addFeatureToSelection3D(key, { gid, element: e.object });
      }
    }
  };

  useEffect(() => {
    mapStore.loadingMap = true;
    const resultLayers = [];
    const layersMapStore = toJS(mapStore.layers);

    layersMapStore.forEach((layer, index) => {
      if (mapStore.layersActive[layer.key]) {
        const styleFunction = (data) => {
          if (layer.styles.colorFunction) {
            return {
              ...layer.styles,
              fillColor: layer.styles.colorFunction(data),
            };
          } else {
            return layer.styles;
          }
        };

        let data = layer.data;

        if (layer.displayColumns.length > 0) {
          data = layer.data.map((item) => {
            const newItem = { ...item };

            newItem.displayColumns = layer.displayColumns;

            return newItem;
          });
        }

        const layerData = new GeoJsonLayer({
          id: layer.key,
          data: data,
          pickable: true,
          extruded: layer.extrudePolygon ?? false,
          wireframe: layer.extrudePolygon ?? false,
          getFillColor: (f) => {
            return hexToRgba(styleFunction(f).fillColor, layer.extrudePolygon ? 1 : styleFunction(f).fillOpacity);
          },
          getElevation: (f) => {
            return Number(f[layer.extrusionColumn]);
          },
          elevationScale: layer.elevationScale ? Number(layer.elevationScale) : 0,
          getLineColor: hexToRgba(layer.styles.color, layer.styles.opacity),
          getLineWidth: layer.styles.weight,
          lineWidthUnits: 'pixels',
          getPolygon: (f) => f,
          onClick: (f) => handleClickEvent3D(f, layer.key),
          autoHighlight: true,
          highlightColor: (f) => {
            return getColorHighLight(f);
          },
        });

        resultLayers.push(layerData);

        if (layer.hexagon) {
          let dataHexagon = data;

          if (layer.displayColumnsHexagon.length > 0) {
            dataHexagon = data.map((item) => {
              const newItem = { ...item };

              newItem.displayColumnsHexagon = layer.displayColumnsHexagon;
              //novos dados necessários

              return newItem;
            });
          }

          console.log(dataHexagon);

          const hexagonLayer = new HexagonLayer({
            data: dataHexagon,
            pickable: index === layersMapStore.length - 1,
            extruded: true,
            radius: layer.radiusHexagon ? Number(layer.radiusHexagon) : 1000,
            elevationScale: layer.elevationScaleHexagon ? Number(layer.elevationScaleHexagon) : 1000,
            getPosition: (d) => d.centroid.coordinates,
            getElevationValue: (f) => {
              return Number(f[0][layer.elevationColumn]);
            },
            getColorValue: (f) => {
              const column = layer.choroplethStyleDefinitionHexagon.column ?? '';
              if (column.trim === '') {
                return 0;
              } else {
                return getColorValueHexagon(
                  layer.choroplethStyleDefinitionHexagon.equal ?? false,
                  layer.choroplethStyleDefinitionHexagon.values,
                  f[0][column]
                );
              }
            },
            colorDomain: [0, getColorsHexagon(layer.choroplethStyleDefinitionHexagon).length - 1],
            colorRange: getColorsHexagon(layer.choroplethStyleDefinitionHexagon),
          });

          resultLayers.push(hexagonLayer);
        }
      }
    });

    const newLayers = [baseLayer, ...resultLayers];
    onSelectLayers(newLayers);
    mapStore.loadingMap = false;
  }, [mapStore.layersActiveComputed]);

  const renderSelectionAlert = () => {
    return (
      <div className="selection-alert">
        <Alert
          message="Feature selection mode."
          type="info"
          showIcon
          action={<Button onClick={() => mapStore.toggleFeatureSelection()}>Save selection</Button>}
        />
      </div>
    );
  };

  return (
    <div>
      <SidePanel layersRefs={layersRefs} onSelectLayers={onSelectLayers} />
      {mapStore.selectFeaturesMode && renderSelectionAlert()}
      <Legend />
    </div>
  );
});

export default Layers;
