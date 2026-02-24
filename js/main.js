// Main functionality for HUBPAC OS

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    // Open default window if needed, or leave clean
    // openWindow('projects');

    setupDraggableWindows();
});

// Z-Index Management
let highestZ = 10;

function bringToFront(windowId) {
    highestZ++;
    document.getElementById(windowId).style.zIndex = highestZ;

    // Remove active class from all
    document.querySelectorAll('.os-window').forEach(w => w.classList.remove('active'));
    // Add to current
    document.getElementById(windowId).classList.add('active');
}

function openWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.display = 'flex';
        bringToFront(`window-${appId}`);

        // On very small screens, ensure it starts "maximized" visually
        if (window.innerWidth <= 480) {
            win.classList.add('maximized');
        }

        // Reset animation
        win.style.animation = 'none';
        win.offsetHeight; /* trigger reflow */
        win.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
}

function closeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.display = 'none';
        win.classList.remove('maximized');
    }
}

function toggleMaximize(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.classList.toggle('maximized');
        bringToFront(`window-${appId}`);
    }
}

function minimizeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.animation = 'popOut 0.3s ease forwards';
        setTimeout(() => {
            win.style.display = 'none';
            win.style.animation = '';
        }, 300);
    }
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').textContent = timeString;
}

// Drag functionality
function setupDraggableWindows() {
    const windows = document.querySelectorAll('.os-window');

    windows.forEach(win => {
        const header = win.querySelector('.window-header');

        // Bring to front on click anywhere on window
        win.addEventListener('mousedown', () => {
            bringToFront(win.id);
        });

        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            win.style.transition = 'none'; // Disable transition during drag
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                // Simple bounds checking (optional, can let windows go partially off screen)
                // if (newX < 0) newX = 0;
                // if (newY < 0) newY = 0;

                win.style.left = `${newX}px`;
                win.style.top = `${newY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                win.style.transition = ''; // Re-enable transition if any
            }
        });
    });
}

// Wallpaper Switcher
function setWallpaper(url) {
    document.documentElement.style.setProperty('--bg-wallpaper', `url('${url}')`);
}

// Contact Form Handler (AJAX)
const contactForm = document.querySelector('#window-contact form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Enviando...';
        btn.disabled = true;

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                btn.innerText = '¡Mensaje Enviado!';
                btn.classList.replace('btn-primary', 'btn-success');
                contactForm.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.replace('btn-success', 'btn-primary');
                    btn.disabled = false;
                    closeWindow('contact');
                }, 2000);
            } else {
                throw new Error('Error en el envío');
            }
        } catch (error) {
            btn.innerText = 'Error al enviar';
            btn.classList.replace('btn-primary', 'btn-danger');

            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.replace('btn-danger', 'btn-primary');
                btn.disabled = false;
            }, 3000);
        }
    });
}
