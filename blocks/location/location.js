import { createOptimizedPicture } from '../../scripts/aem.js';

const stateMap = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  ontario: 'Ontario, CA',
};

const lookupState = (name) => {
  if (!name) return '';
  const searchName = name.trim().toLowerCase();
  return stateMap[searchName] || name;
};

function getMarkerPosition({ x = 0, y = 0 }) {
  const canvasWidth = 1228.6;
  const canvasHeight = 758.5;

  const offsetX = 30;
  const offsetY = 60;

  const left = ((x + offsetX) / canvasWidth) * 100;
  const top = ((y + offsetY) / canvasHeight) * 100;

  return {
    left: `${left.toFixed(4)}%`,
    top: `${top.toFixed(4)}%`,
  };
}

async function renderMarkers(map, path) {
  try {
    const resp = await fetch(path);

    if (resp.ok) {
      const json = await resp.json();
      const markers = json.data;

      markers.forEach((locationData) => {
        const markerPosition = getMarkerPosition({
          x: Number(locationData?.['data-x']),
          y: Number(locationData?.['data-y']),
        });

        const markerDiv = document.createElement('div');
        markerDiv.classList.add('location-marker-container');
        markerDiv.style = `left: ${markerPosition.left}; top: ${markerPosition.top};`;

        const large = document.createElement('div');
        large.classList.add('location-marker');
        const small = document.createElement('div');
        small.classList.add('location-marker-small');

        const popup = document.createElement('div');
        popup.classList.add('marker-popup');

        if (locationData.image) {
          const img = document.createElement('img');
          img.classList.add('popup-image');
          img.src = `${locationData.image}?width=300&format=webply&optimize=medium`;
          img.alt = locationData['data-city'] || 'Lodge Image';
          popup.append(img);
        }

        const title = document.createElement('p');
        title.classList.add('popup-title');
        title.textContent = `${locationData['data-city']}, ${lookupState(locationData['data-state'])}`;
        popup.append(title);

        markerDiv.append(large, small, popup);

        map.append(markerDiv);
      });
    }
  } catch {}
}

export default function decorate(block) {
  const ul = document.createElement('div');
  let dataURL = '';
  [...block.children].forEach((row) => {
    const li = document.createElement('div');

    const link = row.querySelector('a');

    if (link) {
      dataURL = link.href;
      row.remove();
      return;
    }

    while (row.firstElementChild) li.append(row.firstElementChild);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1024' }]))
  );

  const picture = ul.querySelector('picture');
  const parentDiv = picture.closest('div');
  parentDiv?.classList.add('location-map');

  renderMarkers(parentDiv, dataURL);

  block.replaceChildren(ul);
}
