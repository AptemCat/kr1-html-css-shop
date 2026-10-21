// Каталог и анкеты крыс используют одну базу из products.js.
(() => {
  const products = window.shopProducts || [];
  const money = value => `${value.toLocaleString('ru-RU')} руб.`;
  const fields = [
    ['Цена', product => money(product.price)],
    ['Амплуа', product => product.role],
    ['Пол', product => product.sex],
    ['Возраст', product => `${product.ageMonths} мес.`],
    ['Окрас', product => product.color],
    ['Уши', product => product.ears],
    ['Шерсть', product => product.coat],
    ['Характер', product => product.temperament],
    ['Активность', product => product.activity],
    ['Экипировка', product => product.outfit],
    ['Особый талант', product => product.talent]
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    else if (tag === 'caption') node.className = 'characteristics-table__caption';
    else if (tag === 'th') node.className = 'characteristics-table__heading';
    else if (tag === 'td') node.className = 'characteristics-table__cell';
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function photo(product, className) {
    const image = element('img', className);
    image.alt = product.imageAlt || `Крыса ${product.name}: ${product.color.toLowerCase()} окрас, ${product.coat.toLowerCase()} шерсть`;
    image.width = 800;
    image.height = 600;
    image.addEventListener('error', () => {
      image.src = 'images/rats/placeholder.svg';
      image.alt = `Фото крысы ${product.name} пока не добавлено`;
    }, { once: true });
    image.src = product.image;
    return image;
  }

  function card(product, compare) {
    const article = element('article', `product-card${product.featured ? ' product-card--featured' : ''}`);
    const link = element('a', 'product-card__image-link');
    link.href = `product.html?id=${encodeURIComponent(product.id)}`;
    link.append(photo(product, 'product-card__image'));
    article.append(link,
      element('h3', 'product-card__title', product.name),
      element('p', 'product-card__description', product.shortDescription),
      element('p', 'product-card__price', money(product.price)));
    const details = element('a', 'button button--primary product-card__button', 'Подробнее');
    details.href = link.href;
    const actions = element('div', 'product-card__actions');
    actions.append(details);
    article.append(actions);
    if (compare) {
      const label = element('label', 'product-card__compare');
      const checkbox = element('input', 'product-card__checkbox');
      checkbox.type = 'checkbox';
      checkbox.name = 'compare';
      checkbox.value = product.id;
      checkbox.dataset.compareId = product.id;
      label.append(checkbox, document.createTextNode(` Сравнить: ${product.name}`));
      article.append(label);
    } else {
      const order = element('button', 'button button--secondary product-card__button', 'Заказать');
      order.type = 'button';
      order.dataset.product = product.name;
      actions.append(order);
    }
    return article;
  }

  const catalog = document.getElementById('catalog-grid');
  if (catalog) {
    catalog.replaceChildren(...products.map(product => card(product, true)));
    const selected = new Set();
    const link = document.getElementById('compare-link');
    const count = document.getElementById('compare-count');
    const empty = document.getElementById('comparison-empty');
    const wrapper = document.getElementById('comparison-table-wrap');
    const table = document.getElementById('comparison-table');

    function updateComparison() {
      const chosen = products.filter(product => selected.has(product.id));
      count.textContent = `Выбрано: ${chosen.length}`;
      link.setAttribute('aria-disabled', String(!chosen.length));
      if (chosen.length) link.setAttribute('href', '#comparison');
      else link.removeAttribute('href');
      empty.hidden = Boolean(chosen.length);
      wrapper.hidden = !chosen.length;
      table.replaceChildren();
      if (!chosen.length) return;
      table.append(element('caption', '', 'Сравнение выбранных крыс'));
      const head = element('thead');
      const names = element('tr');
      const corner = element('th', '', 'Характеристика');
      corner.scope = 'col';
      names.append(corner);
      chosen.forEach(product => {
        const cell = element('th');
        cell.scope = 'col';
        const productLink = element('a', '', product.name);
        productLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
        cell.append(productLink);
        names.append(cell);
      });
      head.append(names);
      const body = element('tbody');
      fields.forEach(([title, value]) => {
        const row = element('tr');
        const heading = element('th', '', title);
        heading.scope = 'row';
        row.append(heading, ...chosen.map(product => element('td', '', value(product))));
        body.append(row);
      });
      table.append(head, body);
    }

    catalog.addEventListener('change', event => {
      const checkbox = event.target.closest('[data-compare-id]');
      if (!checkbox) return;
      if (checkbox.checked) selected.add(checkbox.value);
      else selected.delete(checkbox.value);
      updateComparison();
    });
    link.addEventListener('click', event => {
      if (!selected.size) event.preventDefault();
    });
    updateComparison();
  }

  const popular = document.getElementById('popular-grid');
  if (popular) popular.replaceChildren(...products.slice(0, 3).map(product => card(product, false)));

  const detail = document.getElementById('product-detail');
  if (detail) {
    const id = new URLSearchParams(window.location.search).get('id');
    const product = products.find(product => product.id === id);
    if (!product) {
      detail.append(element('h1', 'section__title', 'Крыса не найдена'),
        element('p', '', 'Проверьте ссылку или выберите другого кандидата в каталоге.'));
      const back = element('a', 'button button--primary', 'Открыть каталог');
      back.href = 'catalog.html';
      detail.append(back);
      document.title = 'Крыса не найдена — RatShop';
      document.getElementById('product-current').textContent = 'Не найдено';
      document.getElementById('order-dialog').remove();
      document.getElementById('success-message').remove();
      return;
    }
    document.title = `${product.name} — крысиный каталог RatShop`;
    document.querySelector('meta[name="description"]').content = product.shortDescription;
    document.getElementById('product-current').textContent = product.name;
    const layout = element('div', 'product-detail__layout');
    const info = element('div', 'product-detail__info');
    info.append(element('h1', 'section__title', product.name),
      element('p', 'product-detail__description', product.description),
      element('p', 'product-detail__price', money(product.price)));
    const order = element('button', 'button button--primary', `Заказать: ${product.name}`);
    order.type = 'button';
    order.dataset.product = product.name;
    info.append(order);
    layout.append(photo(product, 'product-detail__image'), info);
    const table = element('table', 'characteristics-table');
    table.append(element('caption', '', `Характеристики: ${product.name}`));
    const body = element('tbody');
    fields.filter(([title]) => title !== 'Цена').forEach(([title, value]) => {
      const row = element('tr');
      const heading = element('th', '', title);
      heading.scope = 'row';
      row.append(heading, element('td', '', value(product)));
      body.append(row);
    });
    table.append(body);
    detail.append(layout, table);
  }
})();
