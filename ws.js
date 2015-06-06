var doingSbS;

function buildMessage(type, content){
  return "{\"type\": \"" + type + "\", \"content\": " + content + "}";
}

// When the document ready, gui components are initialized and the websocket port is requested
$(document).ready(function() {
  $.getScript('gui.js', function(){
    activateComponents();
  });

  $.getScript('ajax.js', function(){
    requestParams();
  });
});

function initializeWebsocket(data){
  // Inserts "host":"port" in websocket url and then initializes it
  wsUrl = wsUrl.replace("$", data);
  ws = new WebSocket(wsUrl);
  doingSbS = false;

  ws.onopen = function(){
    // Requests the available graphs
    var initialMessage = buildMessage(AVAILABLE_GRAPHS, "''");
    ws.send(initialMessage);

    // Sends pings periodically in order to maintain the conection
    setInterval(function(){ ws.send(""); }, SECS_BY_PING * 1000);

    // Loads the default graph
    handleGraphRequest(DEFAULT_GRAPH);
  };

  // What does the client do when it receives a message
  ws.onmessage = function (evt){

    // Converts the received string to a JSON object
    var message = JSON.parse(evt.data);

    switch(message.type){
      case NODE:
        showNodeInfo(message.content);
        break;
      case F_PATH:
        /* Resets the stroke of the lines and the color of the nodes to discard changes from other painted paths, except
         * when we want to maintain the processed nodes after finishing a step-by-step execution
         */
        if(!forceOS)
          resetColorsAndSizes();
        forceOS = false;

        showFullPath(message.content);
        break;
      case P_PATH:
        // If it's the beginning of this phase, resets the stroke of the lines and the color and size of the nodes to discard changes from other painted paths
        if(!doingSbS){
          resetColorsAndSizes();
          doingSbS = true;
        }

        showPartialPath(message.content);
        break;
      case AVAILABLE_GRAPHS:
        // Builds the graph menu with the received data
        var graphMenu = $("#selectedGraph")[0];
        for(i=0;i<message.content.length;i++)
          graphMenu.options[i] = new Option(message.content[i], message.content[i], false);
        break;
    }

    // Copies the literal string as a feedback when debugging
    if(debug)
    	showFeedback("info", evt.data);
  };
}

function showNodeInfo(nodeInfo){
    var info = "<p>Node selected: "+nodeInfo.id+"</p>";
    info += "<p>Node info: "+nodeInfo.info+"</p>";

    // Appends information to some section from the node panel
    $("#nodePanelText").html(info);

    $("#nodePanel").show();
}

function showFullPath(data){
    doingSbS = false;
    currentNode = null;

    // Restores the posibility to change the parameters
    disableParameters(false);

    /* To avoid duplicated data, instead of receiving every pair of source-target,
     * all the numbers are the target, except for the first one, that is the initial source
     */

    // Colors and makes grow the involved links and nodes
    changeNode(data[0], nodeColors["finalPath"], 1.5);
    var i;
    for(i=0;i<data.length-3;i++){
      changeNode(data[i+1], nodeColors["finalPath"], 1.5);
      highlightLink(data[i],data[i+1]);

      // For undirected graphs
      highlightLink(data[i+1],data[i]);
    }

    // The last two numbers aren't checked in the previous loop because they are reserved to iterations made and path cost, respectively
    $("#iterations").text(data[data.length-2]);
    $("#pathCost").text(data[data.length-1]);
    $("#searchPanel").show();
}

function showPartialPath(data){
    // Prevents non-sense changes. If you are running an algorithm step by step, you should not change parameters during the proccess
    disableParameters(true);

    // In every step, the server will send back the next node and the following ones to be expanded

    // First, the next node is highlighted and grown
    changeNode(data[0], nodeColors["current"], 1.5);

    // The previous "next node" value has to be marked as processed
    changeNode(currentNode, nodeColors["processed"], 1.5);

    // Updates the value
    currentNode = data[0];

    // If the next goal is the goal one, the search is completed, so it forces a full path call
    var goalNode = $("#goalNode").text();
    if(data[0].localeCompare(goalNode)==0){
      forceOS = true;
      doingSbS = false;
      return;
    }

    // If there are known expanding nodes, they will be highlighted and grown as well
    var i;
    for(i=1;i<data.length;i++)
      changeNode(data[i], nodeColors["expanded"], 1.5);
}
