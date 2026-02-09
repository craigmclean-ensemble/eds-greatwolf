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

    const columns = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
    columns[0].append(divs[0]);
    columns[1].append(divs[1], divs[2]);
    columns[2].append(divs[3], divs[4]);

    linksBlock.replaceChildren(...columns);

    // Add toggle functionality for mobile
    linksBlock.querySelectorAll(':scope > div > div').forEach((section) => {
      const title = section.querySelector('p');
      if (title) {
        // Create a wrapper for the title and button
        const header = document.createElement('div');
        header.classList.add('section-header');

        const button = document.createElement('button');
        button.classList.add('section-toggle');
        button.ariaLabel = 'Toggle List';

        // Move title into header and add button
        title.before(header);
        header.append(title, button);

        header.addEventListener('click', () => {
          const isOpen = section.classList.toggle('is-open');
          button.setAttribute('aria-expanded', isOpen);
        });
      }
    });
  }

  block.append(footer);
}
