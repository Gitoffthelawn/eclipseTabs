var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function reload() {
    browser.runtime.reload();
}
export function registerListener(handler) {
    browser.tabs.onActivated.addListener(handler.refreshTabListOnActiveChange);
    browser.tabs.onUpdated.addListener(handler.refreshTabListOnSiteUpdated);
    browser.tabs.onRemoved.addListener(handler.refreshTabListOnTabRemoved);
}
export function tabQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield browser.tabs.query(query);
    });
}
export function startupHandler(handler) {
    return __awaiter(this, void 0, void 0, function* () {
        browser.runtime.onStartup.addListener(handler.startup);
    });
}
export function localStorageSet(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield browser.storage.local.set(data);
    });
}
export function localStorageGet(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield browser.storage.local.get(name);
    });
}
//# sourceMappingURL=firefoxHandler.js.map