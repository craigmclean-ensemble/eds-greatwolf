import { createOptimizedPicture } from '../../scripts/aem.js';

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
        markerDiv.append(large, small);

        map.append(markerDiv);
      });
    }
  } catch {
    console.log(`Error Fetching ${path}`);
  }
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
