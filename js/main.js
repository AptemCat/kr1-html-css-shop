// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем кнопки заявки после вывода карточек и анкеты скриптом shop.js.
const orderButtons = document.querySelectorAll('button[data-product]');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле для имени выбранной крысы.
const selectedProductInput = document.getElementById('selected-product');

// На странице с неизвестной крысой кнопок заявки и формы нет.
// Ссылки «Подробнее» не участвуют в открытии модального окна.
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Получаем имя крысы из data-атрибута.
    const productName = button.dataset.product;

    // Записываем имя крысы в скрытое поле формы.
    selectedProductInput.value = productName;

    // Открываем модальное окно.
    if (successMessage) successMessage.hidden = true;
    orderForm.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    orderDialog.showModal();
  });
});

// Закрываем модальное окно по кнопке «Закрыть».
closeDialogButton?.addEventListener('click', () => {
  orderDialog.close();
});

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
orderForm?.addEventListener('submit', (event) => {
  // Отменяем стандартную отправку формы,
  // потому что backend пока не подключён.
  event.preventDefault();

  // Сбрасываем предыдущие признаки ошибок.
  const formElements = Array.from(orderForm.elements);

  formElements.forEach((element) => {
    if (element.willValidate) {
      element.removeAttribute('aria-invalid');
    }
  });

  // Проверяем встроенные HTML-ограничения формы.
  if (!orderForm.checkValidity()) {
    formElements.forEach((element) => {
      if (element.willValidate && !element.checkValidity()) {
        element.setAttribute('aria-invalid', 'true');
      }
    });

    // Показываем стандартные сообщения браузера.
    orderForm.reportValidity();
    return;
  }

  // Показываем сообщение об успешной отправке.
  successMessage.hidden = false;
  successMessage.textContent = `Заявка на крысу «${selectedProductInput.value}» оформлена. Данные не отправлены на сервер.`;

  // Очищаем форму.
  orderForm.reset();

  // Закрываем модальное окно.
  orderDialog.close();
});
