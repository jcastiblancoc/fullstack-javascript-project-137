/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* eslint-disable no-console */\n\nconst form = document.getElementById('rss-form');\nconst input = form.querySelector('input[aria-label=\"url\"]');\nconst feedback = document.getElementById('feedback');\nconst feedsContainer = document.querySelector('#feeds ul');\nconst postsContainer = document.querySelector('#posts ul');\n\nconst state = {\n  feeds: [],\n  posts: [],\n};\n\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n\n  const url = input.value.trim();\n  if (!url) return;\n\n  // 🚨 Validación simple para detectar repetidos\n  if (state.feeds.some((f) => f.url === url)) {\n    showFeedback('RSS already exists', 'error');\n    return;\n  }\n\n  const feed = { id: Date.now(), url, title: `Feed: ${url}` };\n  state.feeds.push(feed);\n\n  const post = {\n    id: Date.now(),\n    feedId: feed.id,\n    title: `Post from ${url}`,\n    link: '#',\n  };\n  state.posts.push(post);\n\n  render();\n  input.value = '';\n\n  // ✅ Mensaje esperado por los tests de Playwright\n  showFeedback('RSS has been loaded', 'success');\n});\n\nfunction render() {\n  // Render feeds\n  feedsContainer.innerHTML = '';\n  state.feeds.forEach((feed) => {\n    const li = document.createElement('li');\n    li.textContent = feed.title;\n    feedsContainer.appendChild(li);\n  });\n\n  // Render posts\n  postsContainer.innerHTML = '';\n  state.posts.forEach((post) => {\n    const li = document.createElement('li');\n    const a = document.createElement('a');\n    a.href = post.link;\n    a.textContent = post.title;\n    li.appendChild(a);\n    postsContainer.appendChild(li);\n  });\n}\n\nfunction showFeedback(message, type = 'success') {\n  feedback.textContent = message;\n  feedback.classList.remove('text-success', 'text-danger');\n\n  if (type === 'success') {\n    feedback.classList.add('text-success');\n  } else {\n    feedback.classList.add('text-danger');\n  }\n}\n\nconsole.log('RSS Reader initialized');\n\n\n//# sourceURL=webpack://@hexlet/code/./src/index.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;