let $ = require("jquery");

module.exports = function (node) {
	let retVal = '';
    if (node.any.length) {
    	retVal += '<h3 class="tota11y-info-error-title">Fix any of the following</h3>';
    	retVal += '<p><ul>';
    	$(node.any).each((i, failure) => {
    		let htmlSafeMessage = failure.message.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
    		retVal += '<li>';
    		retVal += htmlSafeMessage;
    		retVal += '</li>';
    	});
    	retVal += '</ul></p>';
    	//TODO: related Nodes
    }

    let all = node.all.concat(node.none);
    if (all.length) {
    	retVal += '<h3>Fix all of the following</h3>';
    	retVal += '<p><ul>';
    	$(all).each((i, failure) => {
    		let htmlSafeMessage = failure.message.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
    		retVal += '<li>';
    		retVal += htmlSafeMessage;
    		retVal += '</li>';
    	});
    	retVal += '</ul></p>';
    	//TODO: related Nodes
    }
    return retVal;
}