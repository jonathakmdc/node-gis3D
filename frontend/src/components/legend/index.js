import React from 'react';
import { Collapse, Divider, Row, Spin, Tag } from 'antd';
import { observer } from 'mobx-react';
import './style.css';
import { useStores } from '../../hooks/useStores';

const { Panel } = Collapse;

const Legend = observer(({ layersRefs }) => {
  const { mapStore } = useStores();

  const getActiveLayers = (layersActive) => {
    let keys = [];
    for (let i = 0; i < layersActive.length; i++) {
      let key = Object.keys(layersActive[i])[0];
      let value = Object.values(layersActive[i])[0];

      if (value === true) {
        keys.push(key);
      }
    }
    return keys;
  };

  const renderLegenda = () => {
    const activeLayers = getActiveLayers(mapStore.layersActiveComputed);
    return (
      <div>
        {activeLayers.length > 0 ? (
          mapStore.layers
            .filter((layer) => activeLayers.includes(layer.key))
            .map((layer) => {
              let legenda = [];
              console.log(layer);
              // extrusão ativa (legenda de altura)
              if (layer.extrudePolygon) {
                legenda.push(
                  <>
                    <Row>
                      <b>{layer.extrusionColumnLabel}</b>
                    </Row>
                    <Row align="middle" style={{ marginTop: '10px' }}>
                      <Tag color="#6B7280" style={{ width: '20px', height: '25px' }} /> Polygon's Height
                    </Row>
                    <Divider />
                  </>
                );
              }
              // temático ativo (legenda de cores do mapa)
              if (layer.choroplethStyleDefinition?.values?.length > 0) {
                if (layer.choroplethStyleDefinition?.equal) {
                  legenda.push(
                    <>
                      <Row>
                        <b>{layer.choroplethStyleDefinition.label}</b>
                      </Row>
                      <Row>(Polygon's Color)</Row>
                      <Row align="middle" style={{ marginTop: '10px' }}></Row>
                      {layer.choroplethStyleDefinition.values.map((obj, index) => (
                        <Row key={index} align="middle" style={{ marginTop: '10px' }}>
                          <Tag color={obj.color} style={{ width: '20px', height: '25px' }} /> {`= ${obj.value}`}
                        </Row>
                      ))}
                      <Row align="middle" style={{ marginTop: '10px' }}>
                        <Tag
                          color={layer.choroplethStyleDefinition.defaultColor}
                          style={{ width: '20px', height: '25px' }}
                        />{' '}
                        {`Other values`}
                      </Row>
                      <Divider />
                    </>
                  );
                } else {
                  legenda.push(
                    <>
                      <Row>
                        <b>{layer.choroplethStyleDefinition.label}</b>
                      </Row>
                      <Row>(Polygon's color)</Row>
                      <Row align="middle" style={{ marginTop: '10px' }}>
                        <Tag
                          color={layer.choroplethStyleDefinition.defaultColor}
                          style={{ width: '20px', height: '25px' }}
                        />{' '}
                        {`0 ~ ${layer.choroplethStyleDefinition.values[0].value}`}
                      </Row>
                      {layer.choroplethStyleDefinition.values.map((obj, index) => (
                        <Row key={index} align="middle" style={{ marginTop: '10px' }}>
                          <Tag color={obj.color} style={{ width: '20px', height: '25px' }} />{' '}
                          {index !== layer.choroplethStyleDefinition.values.length - 1
                            ? `${obj.value} ~ ${layer.choroplethStyleDefinition.values[index + 1].value}`
                            : `≥ ${obj.value}`}
                        </Row>
                      ))}
                      <Divider />
                    </>
                  );
                }
              }
              // hexagon ativo (legenda de altura de hexagon)
              if (layer.hexagon) {
                legenda.push(
                  <>
                    <Row>
                      <b>{layer.elevationColumnLabel}</b>
                    </Row>
                    <Row align="middle" style={{ marginTop: '10px' }}>
                      <Tag color="#6B7280" style={{ width: '20px', height: '25px' }} /> Hexagon's Height
                    </Row>
                    <Divider />
                  </>
                );
              }
              // hexagon ativo e cores (legenda de cores do hexagon)
              if (layer.choroplethStyleDefinitionHexagon?.values?.length > 0) {
                if (layer.choroplethStyleDefinitionHexagon?.equal) {
                  legenda.push(
                    <>
                      <Row>
                        <b>{layer.choroplethStyleDefinitionHexagon.label}</b>
                      </Row>
                      <Row>(Hexagon's color)</Row>
                      <Row align="middle" style={{ marginTop: '10px' }}></Row>
                      {layer.choroplethStyleDefinitionHexagon.values.map((obj, index) => (
                        <Row key={index} align="middle" style={{ marginTop: '10px' }}>
                          <Tag color={obj.color} style={{ width: '20px', height: '25px' }} /> {`= ${obj.value}`}
                        </Row>
                      ))}
                      <Row align="middle" style={{ marginTop: '10px' }}>
                        <Tag
                          color={layer.choroplethStyleDefinitionHexagon.defaultColor}
                          style={{ width: '20px', height: '25px' }}
                        />{' '}
                        {`Other values`}
                      </Row>
                      <Divider />
                    </>
                  );
                } else {
                  legenda.push(
                    <>
                      <Row>
                        <b>{layer.choroplethStyleDefinitionHexagon.label}</b>
                      </Row>
                      <Row>(Hexagon's color)</Row>
                      <Row align="middle" style={{ marginTop: '10px' }}>
                        <Tag
                          color={layer.choroplethStyleDefinitionHexagon.defaultColor}
                          style={{ width: '20px', height: '25px' }}
                        />{' '}
                        {`0 ~ ${layer.choroplethStyleDefinitionHexagon.values[0].value}`}
                      </Row>
                      {layer.choroplethStyleDefinitionHexagon.values.map((obj, index) => (
                        <Row key={index} align="middle" style={{ marginTop: '10px' }}>
                          <Tag color={obj.color} style={{ width: '20px', height: '25px' }} />{' '}
                          {index !== layer.choroplethStyleDefinitionHexagon.values.length - 1
                            ? `${obj.value} ~ ${layer.choroplethStyleDefinitionHexagon.values[index + 1].value}`
                            : `≥ ${obj.value}`}
                        </Row>
                      ))}
                      <Divider />
                    </>
                  );
                }
              }
              //legenda.push(<div style={{ lineHeight: '26px' }}>teste</div>);
              return legenda;
            })
        ) : (
          <span>No layer added to map</span>
        )}
      </div>
    );
  };

  return (
    <div className="legend">
      <Collapse bordered={false}>
        <Panel header="Legend" key="1">
          {mapStore.loading || mapStore.loadingMap ? (
            <>
              <Spin />
            </>
          ) : (
            renderLegenda()
          )}
        </Panel>
      </Collapse>
    </div>
  );
});

export default Legend;
