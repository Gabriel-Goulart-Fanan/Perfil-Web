document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch('/usuario', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        document.getElementById('mensagem').innerText = data.mensagem || data.erro;
      } catch (err) {
        document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
      }
    });
  }
});