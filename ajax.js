function publishGraph(formData){
    $.ajax({
        type: "POST",
        url: BASE_URI,
        data: formData,
        // Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false,
        success: function (data, textStatus, response) {
            showFeedback("success", "Your graph was loaded successfully. If you want to use it in future executions, put the following hash in the input field: " + data);
            handleGraphRequest(data);
        },
        error: function (response, textStatus, errorThrown) {
            showFeedback("danger", "You uploaded an invalid graph. Please, check its format.");
        }
    });
}

function applyLayout(g, layout){
    $.ajax({
        type: "POST",
        url: "api/layout/" + layout,
        data: JSON.stringify(g),
        contentType: "application/json",
        success: function (data, textStatus, response) {
            node.each(function(d){
                d.px = d.x = data[d.id].x;
                d.py = d.y = data[d.id].y;
            });
            tick();
        },
        error: function (response, textStatus, errorThrown) {
            showFeedback("danger", "Error: " + errorThrown);
        }
    });
}

function requestGraph(url){
    $.ajax({
        type: "GET",
        url: url,
        contentType: "text/plain",
        success: function (data, textStatus, response) {
            links = data.links;
            nodes = data.nodes;

            // If there is no data about links' direction, it will be assumed that the graph is directed
            var isDirected = data.directed;
            if(isDirected == null)
                isDirected = true;
            var filename = url.split("/")[url.split("/").length-1];
            initialize(filename, isDirected);
        },
        statusCode: {
            404: function(response, textStatus, errorThrown) {
                showFeedback("danger", "Error: graph not found");
            }
        }
    });
}