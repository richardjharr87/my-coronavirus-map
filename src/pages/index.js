import React from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';
import Layout from 'components/Layout';
import Map from 'components/Map';
import { useTracker } from 'hooks';
import { commafy, friendlyDate } from '../lib/util';

const LOCATION = {
  lat: 0,
  lng: 0,
  // lat: 38.9072,
  // lng: -77.0369,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {

  const { data: countries = [] } = useTracker({
    api: 'countries'
  });
  const { data: stats = {} } = useTracker({
    api: 'all'
  });

  console.log('stats', stats);
  //  console.log('countries', countries);

  const hasCountries = Array.isArray(countries) && countries.length > 0;

  const dashboardStats = [
    {
      primary: {
        label: 'Total Cases',
        value: commafy(stats?.cases)
      },
      secondary: {
        label: 'Per 1 million',
        value: stats?.casesPerOneMillion
      }

    },
    {
      primary: {
        label: 'Total Deaths',
        value: commafy(stats?.deaths)
      },
      secondary: {
        label: 'Per 1 million',
        value: stats?.deathsPerOneMillion
      }

    },
    {
      primary: {
        label: 'Total Tests',
        value: commafy(stats?.tests)
      },
      secondary: {
        label: 'Per 1 million',
        value: stats?.testsPerOneMillion
      }
    },
    {
      primary: {
        label: 'Active Cases',
        value: commafy(stats?.active)
      },
    },
    {
      primary: {
        label: 'Critical Cases',
        value: commafy(stats?.critical)
      },
    },
    {
      primary: {
        label: 'Recovered Cases',
        value: commafy(stats?.recovered)
      },


    },







  ]
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    if (!hasCountries) return;

    const geoJson = {
      type: 'FeatureCollection',
      features: countries.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        console.log(feature);
        const { properties } = feature
        let updatedFormatted;
        let casesString;

        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties;

        casesString = `${cases}`;
      if (cases > 1000)
      {
        casesString = `${casesString.slice(0,-3)}k+`
      }
      
        if (updated) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
            <h2>${country}</h2>
            <ul>
            <li><strong>Confirmed:</strong> ${cases}</li>
            <li><strong>Deaths:</strong> ${deaths}</li>
            <li><strong>Recovered:</strong> ${recovered}</li>
            <li><strong>Last Update:</strong> ${updatedFormatted}</li>
            </ul>
            </span>
            ${casesString}
          </span>
        `;

        map.invalidateSize();

        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'icon',
            html
          }),
          riseOnHover: true
        });
      }
    });

    geoJsonLayers.addTo(map)
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  return (
    <Layout pageName="home">
      <div className="tracker">
        <Map {...mapSettings} />
        <div className="tracker-stats">
          <ul>
            {dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
              return (
                <li key={`Stat-${i}`} className="tracker-stat">
                  <p className="tracker-stat-primary">
                    {primary?.value}
                    <strong>{primary?.label}</strong>
                  </p>
                  <p className="tracker-stat-secondary">
                    {secondary?.value}
                    <strong>{secondary?.label}</strong>
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="tracker-last-updated">
          <p>
            Last Update: {stats? friendlyDate (stats?.updated):'-'}
          </p>
        </div>
      </div>
      <Helmet>
        <title>Home Page</title>
      </Helmet>

    </Layout>
  );
};

export default IndexPage;
