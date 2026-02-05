import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const img = pic.querySelector('img');
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');

        const optimizedPic = createOptimizedPicture(src, alt, false, [{ width: '750' }]);

        pic.replaceWith(optimizedPic);

        const picWrapper = optimizedPic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
