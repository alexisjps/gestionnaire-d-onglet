const tabGroupsKey = 'tabGroups';

// Charger les groupes d'onglets existants à partir du stockage sync
function getTabGroups() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([tabGroupsKey], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[tabGroupsKey] || []);
      }
    });
  });
}

// Enregistrer les groupes d'onglets dans le stockage sync
function setTabGroups(tabGroups) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [tabGroupsKey]: tabGroups }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Créer un nouveau groupe d'onglets
async function createTabGroup(groupName) {
  const tabGroups = await getTabGroups();
  const newGroup = { id: Date.now(), name: groupName, tabs: [] };
  tabGroups.push(newGroup);
  await setTabGroups(tabGroups);
}

// Enregistrer l'état actuel des onglets dans un groupe
async function saveTabsToGroup(groupId) {
  const tabGroups = await getTabGroups();
  const group = tabGroups.find((group) => group.id === groupId);
  if (!group) {
    console.error('Group not found:', groupId);
    return;
  }

  group.tabs = await new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve(tabs.map((tab) => ({ title: tab.title, url: tab.url })));
    });
  });

  await setTabGroups(tabGroups);
}

// Ouvrir les onglets d'un groupe
async function openTabsFromGroup(groupId) {
  const tabGroups = await getTabGroups();
  const group = tabGroups.find((group) => group.id === groupId);
  if (!group) {
    console.error('Group not found:', groupId);
    return;
  }

  for (const tab of group.tabs) {
    chrome.tabs.create({ url: tab.url });
  }
}

// Gérer les messages provenant des scripts de l'extension
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case 'createTabGroup':
      await createTabGroup(message.groupName);
      break;
    case 'saveTabsToGroup':
      await saveTabsToGroup(message.groupId);
      break;
    case 'openTabsFromGroup':
      await openTabsFromGroup(message.groupId);
      break;
    case 'getTabGroups':
      const tabGroups = await getTabGroups();
      sendResponse(tabGroups);
      break;
    default:
      console.error('Unrecognized message action:', message.action);
  }
});

// Ajouter des raccourcis clavier
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'open_extension':
      // Ouvrir la fenêtre contextuelle de l'extension (ne fonctionne pas dans un script d'arrière-plan)
      break;
    // Ajoutez d'autres raccourcis clavier ici
    default:
      console.error('Unrecognized command:', command);
  }
});
