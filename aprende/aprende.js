const selector = document.querySelector('#tarjeta');
const download = document.querySelector('[data-download]');
const projectNotice = document.querySelector('[data-project-notice]');
const codePanel = document.querySelector('[data-code-panel]');
const codeStatus = document.querySelector('[data-code-status]');
const codeBlock = document.querySelector('[data-code]');
const storageKey = 'greyforge-aprende-tarjeta';
let projectUrl = download?.getAttribute('href');
const codeRequests = {};

async function showCode() {
  if (!codePanel.open) return;
  const requested = projectUrl;
  codeBlock.parentElement.hidden = true;
  if (!requested) {
    codeStatus.textContent = 'Sin código para esta tarjeta.';
    return;
  }
  codeStatus.textContent = 'Cargando código…';
  try {
    const name = requested
      .split('/')
      .pop()
      .replace(/\.blocks\.json$/, '.json');
    codeRequests[name] ??= fetch(`../datos/codigo/${name}`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .catch((error) => {
        delete codeRequests[name];
        throw error;
      });
    const entry = await codeRequests[name];
    if (projectUrl !== requested) return;
    if (!entry?.codigo) throw new Error();
    codeStatus.textContent = entry.lenguaje === 'cpp' ? 'C++' : 'MicroPython';
    codeBlock.textContent = entry.codigo;
    codeBlock.parentElement.hidden = false;
  } catch {
    if (projectUrl === requested) {
      codeStatus.textContent = 'No se pudo leer el código aquí. Abre el proyecto en GreyForge y elige Código.';
    }
  }
}

function selectBoard() {
  const option = selector.selectedOptions[0];
  projectUrl = option.dataset.project;
  document.querySelectorAll('[data-uno]').forEach((element) => {
    element.textContent = element.getAttribute(`data-${option.value}`) ?? '—';
  });
  download.hidden = !projectUrl;
  projectNotice.hidden = Boolean(projectUrl);
  if (projectUrl) download.href = projectUrl;
  else download.removeAttribute('href');
  void showCode();
}

if (selector) {
  try {
    const saved = localStorage.getItem(storageKey);
    if (Array.from(selector.options).some((option) => option.value === saved)) selector.value = saved;
  } catch {
    // La selección sigue disponible en esta página.
  }
  selector.closest('[hidden]').hidden = false;
  selector.addEventListener('change', () => {
    try {
      localStorage.setItem(storageKey, selector.value);
    } catch {
      // La selección sigue disponible en esta página.
    }
    selectBoard();
  });
  selectBoard();
}

codePanel?.addEventListener('toggle', showCode);

document.querySelectorAll('.program img').forEach((img) => {
  const fallback = img.previousElementSibling;
  const showImage = () => {
    img.hidden = false;
    fallback.hidden = true;
  };
  if (img.complete && img.naturalWidth) showImage();
  else img.addEventListener('load', showImage, { once: true });
});
