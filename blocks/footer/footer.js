import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const linksBlock = footer.querySelector('.links.block');
  if (linksBlock) {
    const divs = [...linksBlock.children];

    if (divs.length === 5) {
      const col1 = document.createElement('div');
      const col2 = document.createElement('div');
      const col3 = document.createElement('div');

      col1.append(divs[0]);
      col2.append(divs[1], divs[2]);
      col3.append(divs[3], divs[4]);

      linksBlock.replaceChildren(col1, col2, col3);
    }
  }

  block.append(footer);
}
