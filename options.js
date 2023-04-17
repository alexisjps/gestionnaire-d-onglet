const openExtensionShortcutInput = document.getElementById('open-extension-shortcut');
const saveButton = document.getElementById('save-button');
const saveStatus = document.getElementById('save-status');

// Charger les options enregistrées
function loadOptions() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['openExtensionShortcut'], result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

// Enregistrer les options
function saveOptions(options) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(options, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Afficher les options enregistrées sur la page
async function displayOptions() {
  const options = await loadOptions();
  openExtensionShortcutInput.value = options.openExtensionShortcut || '';
}

// Enregistrer les options lorsque l'utilisateur clique sur "Enregistrer"
saveButton.addEventListener('click', async () => {
  const options = {
    openExtensionShortcut: openExtensionShortcutInput.value
  };

  await saveOptions(options);
  saveStatus.style.display = 'inline';

  setTimeout(() => {
    saveStatus.style.display = 'none';
  }, 3000);
});

// Charger et afficher les options enregistrées lorsque la page est chargée
displayOptions();
