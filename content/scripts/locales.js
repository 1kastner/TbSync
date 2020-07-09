/*
 license: The MIT License, Copyright (c) 2016-2019 YUKI "Piro" Hiroshi
 original: http://github.com/piroor/webextensions-lib-l10n
 
  Modification by John Bieling:
   * Removed logging
*/

var { TbSync } = ChromeUtils.import("chrome://tbsync/content/tbsync.jsm");

(function (addonId, keyPrefix){

	let localization = {
		i18n: null,
		
		updateString(string) {
			let re = new RegExp(keyPrefix + "(.+?)__", "g");
			return string.replace(re, matched => {
				const key = matched.slice(keyPrefix.length, -2);
				let message = TbSync.getString(key);
				return message || matched;
			});
		},
		
		updateSubtree(node) {
			const texts = document.evaluate(
				'descendant::text()[contains(self::text(), "' + keyPrefix + '")]',
				node,
				null,
				XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
				null
			);
			for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
				const text = texts.snapshotItem(i);
				if (text.nodeValue.includes(keyPrefix)) text.nodeValue = this.updateString(text.nodeValue);
			}
			
			const attributes = document.evaluate(
				'descendant::*/attribute::*[contains(., "' + keyPrefix + '")]',
				node,
				null,
				XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
				null
			);
			for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
				const attribute = attributes.snapshotItem(i);
				if (attribute.value.includes(keyPrefix)) attribute.value = this.updateString(attribute.value);
			}
		},
		
		async updateDocument() {
			this.updateSubtree(document);
		}
	};

	// standard event if loaded by a standard window
	document.addEventListener('DOMContentLoaded', () => {
		localization.updateDocument();
	}, { once: true });

	// custom event, fired by the overlay loader after it has finished loading
	document.addEventListener("DOMOverlayLoaded_" + addonId, () => {
		localization.updateDocument();
	}, { once: true });

})("tbsync@jobisoft.de", "__TBSYNCMSG_");