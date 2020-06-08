export const updateHTMLEvent = new Event('updateHTMLList')

export function updatePinnedFolderList(elements, tabs) {
  var pinnedFolder = {}
  pinnedFolder.item = false
  pinnedFolder.folder = true
  pinnedFolder.name = "Pinned Tabs"
  pinnedFolder.open = (elements["pinned"] == undefined || elements["pinned"].open == undefined) ? true : elements["pinned"].open
  pinnedFolder.folderID = "pinned"
  pinnedFolder.parentFolderID = -1
  pinnedFolder.elements = []
  for (var tab of tabs) {
    if (tab.pinned) {
      var storedTab = {}
      storedTab.item = true
      storedTab.folder = false
      storedTab.hidden = tab.hidden
      storedTab.tabExists = true
      storedTab.tabID = tab.id
      storedTab.itemID = tab.id
      storedTab.url = tab.url
      storedTab.favIconURL = tab.favIconUrl
      storedTab.title = tab.title
      storedTab.parentFolderID = pinnedFolder.folderID
      pinnedFolder.elements.push(storedTab)
    }
  }
  elements["pinned"] = pinnedFolder
}

export function updateTabs(elements, tabs) {
  var unorderedFolder = {}
  unorderedFolder.item = false
  unorderedFolder.folder = true
  unorderedFolder.name = "Unordered Tabs"
  unorderedFolder.open = (elements["unordered"] == undefined || elements["unordered"].open == undefined) ? true : elements["unordered"].open
  unorderedFolder.folderID = "unordered"
  unorderedFolder.parentFolderID = -1
  unorderedFolder.elements = []
  for (var tab of tabs) {
    var exist = tabExistsByTabID(tab.id, elements)
    if (!tab.pinned && !exist) {
      var storedTab = {}
      storedTab.item = true
      storedTab.folder = false
      storedTab.hidden = tab.hidden
      storedTab.tabExists = true
      storedTab.tabID = tab.id
      storedTab.itemID = tab.id
      storedTab.url = tab.url
      storedTab.favIconURL = tab.favIconUrl
      storedTab.title = tab.title
      storedTab.parentFolderID = unorderedFolder.folderID
      unorderedFolder.elements.push(storedTab)
    }
  }
  elements["unordered"] = unorderedFolder
}

export async function renameFolder(folderID, newName) {
  var folder = getFolderJSONObjectByID(folderID, await getDataStructFromFirefox())
  folder.name = newName
  await saveDataInFirefox(data)
}

export async function moveItem(itemID, oldParentFolderID, newParentFolderID) {
  var data = await getDataStructFromFirefox()
  var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
  var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
  var item = getItemJSONObjectByID(itemID, data)
  var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
  if (oldParentFolder != undefined && newParentFolder != undefined && item != undefined && key != undefined) {
    item.parentFolderID = newParentFolderID
    newParentFolder.elements.push(item)
    delete oldParentFolder.elements[key]
    await saveDataInFirefox(data)
    return true
  }
  return false
}

export async function removeItem(itemID, oldParentFolderID) {
  var data = await getDataStructFromFirefox()
  var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
  var item = getItemJSONObjectByID(itemID, data)
  var key = getKeyByIDAndType(oldParentFolder.elements, false, item.itemID)
  if (oldParentFolder != undefined && item != undefined && key != undefined) {
    delete oldParentFolder.elements[key]
    await saveDataInFirefox(data)
    return true
  }
  return false
}

export async function moveFolder(folderID, oldParentFolderID, newParentFolderID) {
  var data = await getDataStructFromFirefox()
  var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
  var newParentFolder = getFolderJSONObjectByID(newParentFolderID, data)
  var folder = getFolderJSONObjectByID(folderID)
  var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
  console.log(key)
  if (oldParentFolder != undefined && newParentFolder != undefined && folder != undefined && key != undefined) {
    folder.parentFolderID = newParentFolderID
    newParentFolder.elements.push(folder)
    delete oldParentFolder.elements[key]
    await saveDataInFirefox(data)
    return true
  }
  return false
}

export async function removeFolder(folderID, oldParentFolderID) {
  var data = await getDataStructFromFirefox()
  var oldParentFolder = getFolderJSONObjectByID(oldParentFolderID, data)
  var folder = getFolderJSONObjectByID(folderID, data)
  var key = getKeyByIDAndType(oldParentFolder.elements, true, folder.folderID)
  if (oldParentFolder != undefined && folder != undefined && key != undefined) {
    delete oldParentFolder.elements[key]
    await saveDataInFirefox(data)
    return true
  }
  return false
}

function getKeyByIDAndType(elements, isFolder, id) {
  for (var key in elements) {
    var obj = elements[key]
    switch (isFolder) {
      case true:
        if (obj.folderID == id) return key
        break
      case false:
        if (obj.itemID == id) return key
        break
    }
  }
  return undefined
}

export async function addFolder(parentID, newFolderID, name) {
  var data = await getDataStructFromFirefox()
  var parentFolder = getFolderJSONObjectByID(parentID, data)
  var folder = {}
  folder.item = false
  folder.folder = true
  folder.open = true
  folder.name = name
  folder.elements = []
  folder.folderID = newFolderID
  folder.parentFolderID = parentID
  parentFolder.elements.push(folder)
  await saveDataInFirefox(data)
  return folder
}

export async function addTab(folderID, title, url, favIconURL, tabExists, tabID, itemID, hidden) {
  var data = await getDataStructFromFirefox()
  var folder = getFolderJSONObjectByID(folderID, data)
  var item = {}
  item.folder = false
  item.item = true
  item.hidden = hidden
  item.tabID = tabID
  item.itemID = itemID
  item.title = title
  item.url = url
  item.favIconURL = favIconURL
  item.tabExists = tabExists
  item.parentFolderID = folderID
  folder.elements.push(item)
  await saveDataInFirefox(data)
  return item
}

export function getItemJSONObjectByID(id, data) {
  return getItemJSONObjectByIDRecursion(id, data.elements)
}

function getItemJSONObjectByIDRecursion(id, items) {
  var returnVal = undefined
  for (var key in items) {
    var element = items[key]
    if (element.item && element.itemID == id) return element
    else if (element.folder) {
      returnVal = getItemJSONObjectByIDRecursion(id, element.elements)
      if (returnVal != undefined) return returnVal
    }
  }
  return undefined
}

export function getFolderJSONObjectByID(id, data) {
  //for selectTab -1 is baseDir
  if (id == -1) return data
  return getFolderJSONObjectByIDRecursion(id, data.elements)
}

function getFolderJSONObjectByIDRecursion(id, folder) {
  var returnVal = undefined
  for (var key in folder) {
    var element = folder[key]
    if (element.folder) {
      if (element.folderID == id) {
        return element
      } else {
        returnVal = getFolderJSONObjectByIDRecursion(id, element.elements)
        if (returnVal != undefined) return returnVal
      }
    }
  }
  return undefined
}

export function getFoldersInFolder(folder) {
  var folderArr = []
  for (var key in folder.elements) {
    var item = folder.elements[key]
    if (item.folder) folderArr.push(item)
  }
  return folderArr
}

export function saveDataInFirefox(data) {
  return browser.storage.local.set({ data })
}

export function getFirefoxStructFromFirefox() {
  return browser.storage.local.get("data")
}

export async function getDataStructFromFirefox() {
  return (await getFirefoxStructFromFirefox()).data
}

export async function getActiveTab() {
  return (await browser.tabs.query({ currentWindow: true, active: true }))[0]
}

export function getCurrentWindowTabs() {
  return browser.tabs.query({ currentWindow: true });
}

export async function generateFolderID() {
  var collectedFolders = 0
  var data = await getDataStructFromFirefox()
  return getNumberOfFoldersAlreadyExisting(data.elements)
}

export function getNumberOfFoldersAlreadyExisting(folderContainer) {
  var number = 0
  for (var key in folderContainer) {
    var item = folderContainer[key]
    if (item.folder) {
      number++
      number += getNumberOfFoldersAlreadyExisting(item.elements)
    }
  }
  return number
}

export function getNumberOfItemsAlreadyExisting(folderContainer) {
  var number = 0
  for (var key in folderContainer) {
    var item = folderContainer[key]
    if (item.item) number++
    if (item.folder) number += getNumberOfFoldersAlreadyExisting(item.elements)
  }
  return number
}

export function tabExistsByItemID(itemID, elements) {
  var returnVal
  for (var key in elements) {
    var item = elements[key]
    if (item.item && item.itemID == itemID) {
      return true
    }
    if (item.folder) {
      if (item.folderID == "unordered") break
      returnVal = tabExistsByItemID(itemID, item.elements)
      if (returnVal != false) return returnVal
    }
  }
  return false
}

export function tabExistsByTabID(tabID, elements) {
  var returnVal = undefined
  for (var key in elements) {
    var item = elements[key]
    if (item.item && item.tabID == tabID) {
      return true
    }else if (item.folder) {
      if (item.folderID != "unordered") {
        returnVal = tabExistsByTabID(tabID, item.elements)
        if (returnVal != false) return returnVal
      }
    }
  }
  return false
}

export function folderExists(folderID, elements) {
  var returnVal = undefined
  for (var key in elements) {
    var item = elements[key]
    if (item.folder) {
      if (item.folderID == folderID) {
        return item
      } else returnVal = folderExists(folderID, item.elements)
      if(returnVal != undefined) return returnVal
    }
  }
}
