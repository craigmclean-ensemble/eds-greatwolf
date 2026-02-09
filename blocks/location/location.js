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

async function renderMarkers(map, path, block, contentDiv) {
  try {
    const resp = await fetch(path);

    if (resp.ok) {
      const json = await resp.json();
      const markers = json.data;

      markers.sort((a, b) => {
        const stateA = (a['data-state'] || '').toLowerCase();
        const stateB = (b['data-state'] || '').toLowerCase();

        if (stateA < stateB) return -1;
        if (stateA > stateB) return 1;
        return 0;
      });

      const list = document.createElement('ul');
      list.classList.add('location-list');

      markers.forEach((locationData) => {
        const markerPosition = getMarkerPosition({
          x: Number(locationData?.['data-x']),
          y: Number(locationData?.['data-y']),
        });

        const markerDiv = document.createElement('div');
        markerDiv.classList.add('location-marker-container');
        markerDiv.style = `left: ${markerPosition.left}; top: ${markerPosition.top};`;

        const anchor = document.createElement('a');
        anchor.classList.add('location-link');
        anchor.href = `https://www.greatwolf.com${locationData.href.startsWith('/') ? locationData.href : `/${locationData.href}`}`;
        anchor.ariaLabel = `Visit Great Wolf ${locationData['data-city']}`;

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
          img.loading = 'lazy';
          popup.append(img);
        }

        const title = document.createElement('p');
        title.classList.add('popup-title');
        title.textContent = `${locationData['data-city']}, ${lookupState(locationData['data-state'])}`;
        popup.append(title);

        const leftPercent = parseFloat(markerPosition.left);

        if (leftPercent < 5) {
          popup.classList.add('is-edge-left');
        } else if (leftPercent > 95) {
          popup.classList.add('is-edge-right');
        }

        anchor.append(large, small, popup);
        markerDiv.append(anchor);
        map.append(markerDiv);

        const li = document.createElement('li');
        const listAnchor = document.createElement('a');
        listAnchor.href = anchor.href;
        listAnchor.innerHTML = ` <span> ${locationData['data-state']}</span> <span>${locationData['data-city']}</span>`;
        li.append(listAnchor);
        list.append(li);
      });

      contentDiv.append(list);
      block.replaceChildren(contentDiv);
    }
  } catch (err) {
    console.error('error fetching location json', err);
  }
}

export default function decorate(block) {
  const contentDiv = document.createElement('div');
  let dataURL = '';

  [...block.children].forEach((row) => {
    const li = document.createElement('div');
    const link = row.querySelector('a');

    if (link && link.href.includes('.json')) {
      dataURL = link.href;
      row.remove();
      return;
    }

    while (row.firstElementChild) li.append(row.firstElementChild);
    contentDiv.append(li);
  });

  // Optimize Images
  contentDiv
    .querySelectorAll('picture > img')
    .forEach((img) =>
      img
        .closest('picture')
        .replaceWith(
          createOptimizedPicture(
            img.src,
            img.alt,
            false,
            [{ media: '(max-width: 1024px)', width: '600' }, { width: '1200' }],
            img?.width,
            img?.height
          )
        )
    );

  const picture = contentDiv.querySelector('picture');
  const parentDiv = picture?.closest('div');
  if (parentDiv) {
    parentDiv.classList.add('location-map');
    renderMarkers(parentDiv, dataURL, block, contentDiv);
  } else {
    block.replaceChildren();
  }
}
