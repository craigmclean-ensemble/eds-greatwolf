import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('header');

  const gridDiv = document.createElement('div');
  gridDiv.classList.add('feature-grid');

  [...block.children].forEach((row, rowIndex) => {
    if (rowIndex === 0) {
      const div = row.querySelector('div');
      headerDiv.append(div);
      return;
    }

    row
      .querySelectorAll('picture > img')
      .forEach((img) =>
        img
          .closest('picture')
          .replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [
              { media: '(max-width: 1024px)', width: '600' },
              { width: '1200' },
              img?.width,
              img?.height,
            ])
          )
      );

    const textContainer = row.querySelector('div:first-child');

    if (textContainer) {
      const titlesWrapper = document.createElement('div');
      titlesWrapper.classList.add('titles-wrapper');

      const p = textContainer.querySelector('p:not(.button-container)');
      const h2 = textContainer.querySelector('h2');
      const buttonContainer = textContainer.querySelector('.button-container');

      if (p) titlesWrapper.append(p);
      if (h2) titlesWrapper.append(h2);

      textContainer.prepend(titlesWrapper);

      const anchor = buttonContainer?.querySelector('a');
      if (anchor && !anchor.querySelector('span')) {
        const span = document.createElement('span');
        while (anchor.firstChild) span.append(anchor.firstChild);
        anchor.append(span);
      }
    }

    gridDiv.append(row);
  });

  block.replaceChildren();

  block.append(headerDiv, gridDiv);
}
