/*What does this do? All here! 
 http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
 function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}
injectScript(chrome.runtime.getURL('/js/rbx.js'), 'body');