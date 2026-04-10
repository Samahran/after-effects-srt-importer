(function(thisObj) {

    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "SRT Importer", undefined, {resizeable:true});

        var grp = panel.add("group");
        grp.orientation = "column";

        // Title
        grp.add("statictext", undefined, "SRT Importer");

        // Position Dropdown
        var posGroup = grp.add("group");
        posGroup.add("statictext", undefined, "Position:");
        var posDropdown = posGroup.add("dropdownlist", undefined, ["Center", "Bottom"]);
        posDropdown.selection = 0;

        // Font Size
        var sizeGroup = grp.add("group");
        sizeGroup.add("statictext", undefined, "Font Size:");
        var fontSize = sizeGroup.add("edittext", undefined, "60");
        fontSize.characters = 5;

        // Offset
        var offsetGroup = grp.add("group");
        offsetGroup.add("statictext", undefined, "Y Offset:");
        var yOffset = offsetGroup.add("edittext", undefined, "0");
        yOffset.characters = 5;

        // Import Button
        var importBtn = grp.add("button", undefined, "Import SRT");

        importBtn.onClick = function() {
            importSRT(posDropdown.selection.text, parseInt(fontSize.text), parseInt(yOffset.text));
        };

        panel.layout.layout(true);
        return panel;
    }

    function clean(str) {
        return str.replace(/^\s+|\s+$/g, "");
    }

    function timeToSeconds(t) {
        var parts = t.split(":");
        var secParts = parts[2].split(",");
        return parseInt(parts[0],10)*3600 + parseInt(parts[1],10)*60 + parseInt(secParts[0],10) + parseInt(secParts[1],10)/1000;
    }

    function importSRT(positionType, fontSize, yOffset) {
        var file = File.openDialog("Select SRT file");
        if (!file) return;

        file.open("r");
        var content = file.read();
        file.close();

        content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        var blocks = content.split("\n\n");
        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first!");
            return;
        }

        app.beginUndoGroup("Import SRT");

        for (var i = 0; i < blocks.length; i++) {
            var lines = blocks[i].split("\n");

            if (lines.length >= 2 && lines[1].indexOf("-->") !== -1) {

                var times = lines[1].split("-->");
                var start = timeToSeconds(clean(times[0]));
                var end = timeToSeconds(clean(times[1]));

                var text = "";
                for (var j = 2; j < lines.length; j++) {
                    text += lines[j] + " ";
                }

                var layer = comp.layers.addText(text);

                // Set timing
                layer.startTime = start;
                layer.outPoint = end;

                // Set position
                var yPos = (positionType == "Bottom") ? comp.height - 150 + yOffset : comp.height/2 + yOffset;
                layer.property("Position").setValue([comp.width/2, yPos]);

                // Set font size
                var textProp = layer.property("Source Text");
                var textDoc = textProp.value;
                textDoc.fontSize = fontSize;
                textProp.setValue(textDoc);
            }
        }

        app.endUndoGroup();
    }

    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) {
        myPanel.center();
        myPanel.show();
    }

})(this);