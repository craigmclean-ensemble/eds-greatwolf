import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const contentDiv = document.createElement('div');
  contentDiv.className = 'banner-content';

  const data = [...block.children].reduce((acc, row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const value = row.children[1]?.textContent.trim();
    const valueCell = row.children[1];

    if (key) {
      acc[key] = value;
    } else if (value) {
      const firstWrapper = document.createElement('div');
      firstWrapper.className = 'banner-first-element';
      if (valueCell.firstElementChild) {
        firstWrapper.append(valueCell.firstElementChild);
      }

      const remainingWrapper = document.createElement('div');
      remainingWrapper.className = 'banner-remaining-elements';

      while (valueCell.firstChild) {
        const child = valueCell.firstChild;

        // Put text content of a tag into a span
        const anchor = child.querySelector?.('a');
        if (anchor) {
          const span = document.createElement('span');
          while (anchor.firstChild) {
            span.append(anchor.firstChild);
          }
          anchor.append(span);
        }

        remainingWrapper.append(child);
      }

      contentDiv.append(firstWrapper, remainingWrapper);
    }
    return acc;
  }, {});

  // Clear the block of content
  block.textContent = '';

  const bannerDiv = document.createElement('div');
  bannerDiv.className = 'banner';

  const video = document.createElement('video');

  const posterSrc = data?.['video-thumb'] || '';
  const optimizedPoster = `${posterSrc}?width=750&format=webply&optimize=medium`;
  if (optimizedPoster) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedPoster;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  video.poster = optimizedPoster;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('width', '100%');
  video.setAttribute('height', '100%');

  const source = document.createElement('source');
  source.src = data?.['video-large'] || '';
  source.type = 'video/mp4';
  source.media = '(min-width: 769px)';

  const sourceSmall = document.createElement('source');
  sourceSmall.src = data?.['video-small'] || '';
  sourceSmall.type = 'video/mp4';

  video.append(source, sourceSmall);

  bannerDiv.appendChild(video);
  bannerDiv.appendChild(contentDiv);

  block.appendChild(bannerDiv);

  bannerDiv
    .querySelectorAll('picture > img')
    .forEach((img) =>
      img
        .closest('picture')
        .replaceWith(
          createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
        )
    );
  block.replaceChildren(bannerDiv);
}
