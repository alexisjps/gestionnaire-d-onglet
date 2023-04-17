const groupList = document.getElementById('group-list');
const createGroupForm = document.getElementById('create-group-form');
const searchInput = document.getElementById('search-input');
const searchResultsList = document.getElementById('search-results-list');

function createGroupElement(group) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.textContent = group.name;
  button.addEventListener('click', () => openTabsFromGroup(group.id));
  li.appendChild(button);
  return li;
}

async function displayTabGroups() {
  const tabGroupsContainer = document.getElementById('tab-groups-container');
  tabGroupsContainer.innerHTML = '';

  const tabGroups = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getTabGroups' }, (response) => {
      resolve(response);
    });
  });

  if (tabGroups) { // Ajouté
    tabGroups.forEach((group) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'tab-group';

      const groupTitle = document.createElement('h2');
      groupTitle.className = 'tab-group-title';
      groupTitle.textContent = group.name;
      groupElement.appendChild(groupTitle);

      const groupTabs = document.createElement('ul');
      groupTabs.className = 'tab-group-tabs';

      group.tabs.forEach((tab) => {
        const tabElement = document.createElement('li');
        tabElement.className = 'tab-group-tab';
        tabElement.textContent = tab.title;
        groupTabs.appendChild(tabElement);
      });

      groupElement.appendChild(groupTabs);
      tabGroupsContainer.appendChild(groupElement);
    });
  } // Ajouté
}

function createSearchResultElement(tab) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.textContent = tab.title;
  button.addEventListener('click', () => {
    chrome.tabs.update(tab.id, { active: true });
    window.close();
  });
  li.appendChild(button);
  return li;
}

async function updateGroupList() {
  groupList.innerHTML = '';
  const tabGroups = await getTabGroups();
  for (const group of tabGroups) {
    groupList.appendChild(createGroupElement(group));
  }
}

async function searchTabs(query) {
  searchResultsList.innerHTML = '';
  if (!query) return;

  const tabs = await new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });

  const matchingTabs = tabs.filter(tab => tab.title.toLowerCase().includes(query.toLowerCase()));
  for (const tab of matchingTabs) {
    searchResultsList.appendChild(createSearchResultElement(tab));
  }
}

function getTabGroups() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getTabGroups' }, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function createTabGroup() {
  const groupName = prompt("Entrez le nom du groupe d'onglets :");
  if (groupName) {
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'createTabGroup', groupName }, () => {
        resolve();
      });
    });
    await displayTabGroups();
  }
}

function openTabsFromGroup(groupId) {
  chrome.runtime.sendMessage({ action: 'openTabsFromGroup', groupId });
}

createGroupForm.addEventListener('submit', event => {
    event.preventDefault();
    const groupName = event.target.elements['group-name'].value;
    if (groupName) {
      createTabGroup(groupName);
      updateGroupList();
      event.target.reset();
    }
  });

  searchInput.addEventListener('input', event => {
    const query = event.target.value;
    searchTabs(query);
  });

  updateGroupList();