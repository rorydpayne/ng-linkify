'use strict';

const URL_REGEX = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|mailto:|ftp:\/\/)?[a-z0-9]+([\:\@\-\.\_]{1}[a-z0-9]+)*\.([a-z]{1,13}|[0-9]{1,5})(:[0-9]{1,5})?(\/[^\s]*)?(?:([^!"\#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~\s]))/ig;
const EMAIL_REGEX = /^(mailto:)?(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
const WITH_SCHEME_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|mailto:|ftp:\/\/)/i;
const WITH_MAILTO_REGEX = /^(mailto:)/i;

const MODULE_NAME = 'linkify';
let angular;

if (typeof module === 'object' && module.exports) {
	angular = require('angular');
	module.exports = MODULE_NAME;
} else {
	angular = window.angular;
}

class LinkifyFilter {
	makeLinks(input) {
		if (!input) {
			return '';
		}

		const text = input.replace(URL_REGEX, url => {
				const idx = input.indexOf(url);
		if (input.substring(idx - 5, idx) === 'src="') {
			return url;
		}
		const wrap = document.createElement('div');
		const anch = document.createElement('a');
		anch.href = url.replace(/&amp;/g, '&');
		anch.target = '_blank';
		if (EMAIL_REGEX.test(url)) {
			if (!WITH_MAILTO_REGEX.test(url)) {
				anch.href = `mailto:${url.replace(/&amp;/g, '&')}`;
			}
			anch.target = '_top';
		} else if (!WITH_SCHEME_REGEX.test(url)) {
			anch.href = `http://${url.replace(/&amp;/g, '&')}`;
		}
		anch.innerHTML = url;
		wrap.appendChild(anch);
		return wrap.innerHTML;
	});

		if (!text) {
			return '';
		}

		return text;
	}

	static filter() {
		return new LinkifyFilter().makeLinks;
	}
}

class LinkifyService {
	constructor($filter) {
		this.$filter = $filter;
	}

	createLinks(string) {
		const res = this.$filter('linkify')(string);
		return res;
	}
}

class Linkify {
	constructor(linkify, $timeout) {
		this.restrict = 'A';
		this.linkify = linkify;
		this.$timeout = $timeout;
	}

	link(scope, element, attrs) {
		if (element.html()) {
			this.linkifyHtml(element);
		}
		if (attrs.ngBindHtml) {
			scope.$watch(attrs.ngBindHtml, () => {
				this.linkifyHtml(element);
		});
		}
	}

	linkifyHtml(element) {
		this.$timeout(() => {
			element.html(this.linkify.createLinks(element.html()));
	});
	}
}

angular.module(MODULE_NAME, []);

angular.module(MODULE_NAME)
	.filter('linkify', [LinkifyFilter.filter])
	.service('linkify', ['$filter', LinkifyService])
	.directive('linkify', ['linkify', '$timeout', Linkify]);
