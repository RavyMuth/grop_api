    let API_KEY = localStorage.getItem('groq_key') || '';
    const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const MODEL = 'llama-3.3-70b-versatile';

    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    let history = [
      { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' }
    ];

    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    function addMessage(text, role) {
      const div = document.createElement('div');
      div.className = `msg ${role}`;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      inputEl.value = '';
      addMessage(text, 'user');
      history.push({ role: 'user', content: text });

      const typingEl = addMessage('Typing...', 'bot typing');
      sendBtn.disabled = true;

      try {
        if (!API_KEY) {
          setTimeout(() => {
            typingEl.remove();
            addMessage('Please set your API key (get one free at https://console.groq.com/keys)', 'bot');
          }, 500);
          return;
        }
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({ model: MODEL, messages: history })
        });
        const data = await res.json();
        typingEl.remove();
        if (data.error) {
          addMessage('Error: ' + (data.error.message || JSON.stringify(data.error)), 'bot');
        } else {
          const reply = data.choices[0].message.content;
          addMessage(reply, 'bot');
          history.push({ role: 'assistant', content: reply });
        }
      } catch (err) {
        typingEl.remove();
        addMessage('Network error: ' + err.message, 'bot');
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }

    // Welcome message
    if (!API_KEY) {
      const key = prompt('Enter your Groq API key (get free at https://console.groq.com/keys):');
      if (key) { API_KEY = key; localStorage.setItem('groq_key', key); }
    }
    addMessage('Hello! I\'m a free AI assistant. Ask me anything.', 'bot');