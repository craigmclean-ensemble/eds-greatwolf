export default function decorate(block) {
  const header = document.createElement('div');
  const ul = document.createElement('ul');
  [...block.children].forEach((row, index) => {
    if (index === 0) {
      header.append(row);
      return;
    }
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    ul.append(li);
  });

  ul.querySelectorAll('li > div:first-child').forEach((section) => {
    const title = section.querySelector('p');
    const parentLi = section.parentElement;
    const answer = parentLi?.querySelector('div:last-child');

    if (title && answer) {
      const titleContainer = document.createElement('div');
      titleContainer.classList.add('section-header');

      const button = document.createElement('button');
      button.classList.add('section-toggle');
      button.ariaLabel = 'Toggle List';

      title.before(titleContainer);
      titleContainer.append(title, button);

      titleContainer.addEventListener('click', () => {
        const isAlreadyOpen = answer.classList.contains('is-open');

        // find all open answer blocks
        ul.querySelectorAll('div:last-child.is-open').forEach((openAnswer) => {
          openAnswer.classList.remove('is-open');
          const openButton = openAnswer?.parentElement?.querySelector('.section-toggle');
          if (openButton) openButton.setAttribute('aria-expanded', 'false');
        });

        if (!isAlreadyOpen) {
          answer.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        } else {
          button.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  block.replaceChildren(header, ul);
}
