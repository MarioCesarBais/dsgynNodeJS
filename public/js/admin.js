const deleteNoticia = btn => {
  const prodId = btn.parentNode.querySelector('[name=noticiaId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const noticiaElement = btn.closest('article');

  fetch('/admin/noticia/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      noticiaElement.parentNode.removeChild(noticiaElement);
    })
    .catch(err => {
      console.log('admin.js 21', err);
    });
};
