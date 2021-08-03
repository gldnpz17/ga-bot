document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Sending login request...');

  let data = new FormData(event.target);

  let response = await fetch('/api/login', {
    body: JSON.stringify({
      key: data.get('group-chat-key')
    })
  });

  switch (response.status) {
    case 200:
      let query = new URLSearchParams(window.location.search);
      window.location.assign(query.get('continue'));
      break;
    case 500:
      alert(await response.text());
    case 429:
      alert('Whoa whoa whoa. Slow down, this endpoint\'s rate-limited.');
    default:
      alert('Error logging in.');
  }
});