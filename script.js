document.addEventListener('DOMContentLoaded', () => {
    // 1. Переключение темы
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('bilby-theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('bilby-theme', next);
    });

    // 2. Появление при скролле
    const revealItems = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealItems.forEach(item => revealObserver.observe(item));

    // 3. Кнопка "наверх"
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // 4. Модальное окно
    const modal = document.getElementById('modal');
    const modalImg = modal.querySelector('.modal-img');
    const modalCaption = modal.querySelector('.modal-caption');
    const modalClose = modal.querySelector('.modal-close');

    document.querySelectorAll('.card-img').forEach(img => {
        img.addEventListener('click', () => {
            const caption = img.closest('.card').querySelector('.card-caption');
            const title = caption.childNodes[0].textContent.trim();
            const subtitle = caption.querySelector('span')?.textContent.trim() || '';
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modalCaption.textContent = subtitle ? `${title} — ${subtitle}` : title;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // 5. Лайки и частицы
    const likeButtons = document.querySelectorAll('.like-btn');
    const likes = JSON.parse(localStorage.getItem('bilby-likes') || '{}');
    
    likeButtons.forEach(btn => {
        const cardId = btn.dataset.card;
        const countSpan = btn.querySelector('.like-count');
        if (likes[cardId]) {
            btn.classList.add('liked');
            countSpan.textContent = likes[cardId];
        }
        btn.addEventListener('click', (e) => {
            const current = Number(countSpan.textContent);
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                countSpan.textContent = Math.max(0, current - 1);
                likes[cardId] = Number(countSpan.textContent);
            } else {
                btn.classList.add('liked');
                countSpan.textContent = current + 1;
                likes[cardId] = Number(countSpan.textContent);
            }
            localStorage.setItem('bilby-likes', JSON.stringify(likes));

            // Создаем частицу
            const rect = btn.getBoundingClientRect();
            const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = btn.classList.contains('liked') ? '❤️' : '💔';
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top}px`;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        });
    });

    // 6. Мысли пользователей
    const thoughtForm = document.getElementById('thoughtForm');
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const thoughtsList = document.getElementById('thoughtsList');
    const thoughtsEmpty = document.getElementById('thoughtsEmpty');
    const thoughtsCount = document.getElementById('thoughtsCount');
    
    let thoughts = JSON.parse(localStorage.getItem('bilby-thoughts') || '[]');

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    function formatDate(iso) {
        return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    function renderThoughts() {
        thoughtsList.innerHTML = '';
        [...thoughts].reverse().forEach(thought => {
            const li = document.createElement('li');
            li.className = 'thought-item';
            li.innerHTML = `
                <div class="thought-content">
                    <div class="thought-text">${escapeHtml(thought.text)}</div>
                    <div class="thought-date">${formatDate(thought.date)}</div>
                </div>
                <button class="thought-delete" title="Удалить">✕</button>
            `;
            li.querySelector('.thought-delete').addEventListener('click', () => {
                thoughts = thoughts.filter(t => t.id !== thought.id);
                localStorage.setItem('bilby-thoughts', JSON.stringify(thoughts));
                renderThoughts();
            });
            thoughtsList.appendChild(li);
        });
        
        thoughtsCount.textContent = thoughts.length;
        thoughtsEmpty.classList.toggle('hidden', thoughts.length > 0);
    }

    thoughtInput.addEventListener('input', () => {
        charCount.textContent = thoughtInput.value.length;
    });

    thoughtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = thoughtInput.value.trim();
        if (!text) return;
        thoughts.push({ id: Date.now().toString(), text: text, date: new Date().toISOString() });
        localStorage.setItem('bilby-thoughts', JSON.stringify(thoughts));
        renderThoughts();
        thoughtInput.value = '';
        charCount.textContent = '0';
    });

    renderThoughts();

    // 7. Параллакс
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        const heroH1 = document.querySelector('.hero h1');
        if (heroH1) heroH1.style.transform = `translate(${x}px, ${y}px)`;
    });
});