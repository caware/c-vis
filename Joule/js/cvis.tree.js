// tree class
function tree(treeConf) {
  
    //  Build up plot descriptors and the visualisation tree for plot lines from the tree configuration
    //  Default it to make a plot line for a non leaf the sum of the leaves under it.
    
    // Public variables
    
    this.plotLineDesc = new Array();
    this.selected = [];
    
    // Private variables
    
    var that = this;
    var pL = treeConf.functionTree;
    var plotLineExceptions = treeConf.plotLines;
    var depth = 0;
    var absMaxDepth = 0;
    // Private methods
    
    var traverse = function (pL, defaultName){
        var i;

        if (pL.pLName !== null) {
	console.log ("Starting plot line " + pL.pLName);
            that.plotLineDesc.push(pL);            
            if (defaultName === "") {
                defaultName = pL.nodeName;
            }
            else defaultName = defaultName + ": " + pL.nodeName;
        }
        else {
	    that.title = pL.nodeName;
	}
        
        pL.defined = false;
        pL.selected = false;
        pL.needed = false;
        pL.valid = false;

	pL.error = false;
        pL.id = that.plotLineDesc.length - 1;
        
        if (!pL.hasOwnProperty("description")) pL.description = defaultName;

        if (pL.hasOwnProperty("children")){
            var comps = Array();
            var totalStr = pL.nodeName + " Total";
            for (i=0; i<pL.children.length; i++){
                var child = pL.children[i];
		child.parent = pL;
                depth++;
                traverse(child, defaultName);
                depth--;
                if (child.hasOwnProperty("components")){
                    comps = comps.concat (child.components);
                }
                else {
                    comps.push (child.pLName);
                }
                
            }
            pL.components = comps;
        }
        else {
            pL.components = new Array(pL.pLName);
        }
        
	  pL.depth = depth + 1;
	
	console.log("Finished plot line " + pL.pLName);       
    }
       
    var resolveComponents = function (components){
        // Any plot lines referred to must be defined
        var ok = true;
        for (var i = 0; i<components.length; i++){
            if (!isMeter(components[i])){
                var pL = _.findWhere(that.plotLineDesc, {"pLName" : components[i]});
                if (pL === null) {
                    ok = false;
                }
                else if (!pL.defined) {
                    ok = false;
                }
            }
        }
        return ok;
    }
    
    var processExcepPL = function (pLDesc, pLEx){
        
	var ok = true;
      
	if (pLEx.mode === "ALT") {
            delete pLDesc.components;
            pLDesc.primary = new Array (pLEx.components[0]);
            if (!resolveComponents(pLDesc.primary)) ok = false;
            pLDesc.secondary = new Array (pLEx.components[1]);
            if (!resolveComponents(pLDesc.secondary)) ok = false;
        } else if (pLEx.mode === "SUM") {
            pLDesc.components = pLEx.components;
            if (!resolveComponents (pLDesc.components)) ok = false;
        } else if (pLEx.mode === "DIFF") {
            pLDesc.components = new Array(pLEx.components[0]);
            if (!resolveComponents (pLDesc.components)) ok = false;
            pLDesc.minus = new Array(pLEx.components[1]);
            if (!resolveComponents (pLDesc.minus)) ok = false;
        } else console.error("ERROR");
	
	if (ok) {
	    pLDesc.defined = true;
	} else {
            console.error("error");
            console.log(JSON.stringify (pLDesc));
            console.log(JSON.stringify (pLEx));
        }
    }
    
    // Function code
    
    // Start with simple traversal, using default construction
 
    console.groupCollapsed("Scanning plotlines");
    traverse(pL, "");
    console.groupEnd();
    
    // Check resolution for simple ones
    
    for (var k = 0; k < this.plotLineDesc.length; k++){
        var ok = true;
        if (this.plotLineDesc[k].hasOwnProperty ("components")){
            this.plotLineDesc[k].defined = resolveComponents (this.plotLineDesc[k].components);
        }
    }
        
    console.log ("Simple plot lines done");
    console.log ("Exc: " + typeof plotLineExceptions);
    
    // Now look at the overriding plot line descriptors
    
    if (typeof plotLineExceptions !== "undefined"){
    	console.log("Doing exceptions");
	for (var j = 0; j < plotLineExceptions.length; j++){
            var pLEx = plotLineExceptions[j];
            pLDesc = _.findWhere(this.plotLineDesc, {"pLName" : pLEx.pLName});
            if (pLDesc !== null){
            	processExcepPL(pLDesc, pLEx);
            }
    	}
    }
    
    this.plotLineDesc.forEach(function (v, k, l) {
      if (v.components.length == 1 && !v.hasOwnProperty("minus") && v.depth == 2) v.depth = 0;
      else if (v.depth == 2 && !v.hasOwnProperty("children")) v.depth = 1;
      if (v.depth == 1) v.parent = l[0];
      if (v.depth == 2) v.parent = l[1];
      if (v.depth > absMaxDepth) absMaxDepth = v.depth;
    });
    
    this.absMaxDepth = absMaxDepth;
    
    this.plotLineDesc[0].selected = true
    this.selected.push(this.plotLineDesc[0]);
    
}