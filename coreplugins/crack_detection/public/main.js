function initializeAnnotations() {
    if (window.viewer && window.viewer.scene) {
        let scene = window.viewer.scene;

        { // Stain Annotations
            scene.annotations.add(new Potree.Annotation({//Crack 2
                title: "b.spimg_image_label",
                position: [572281.233, 4498559.325, 33.729],
                cameraPosition: [572290.9623721616, 4498556.8638048265, 24.601052325185435],
                cameraTarget: [572274.1997239867, 4498562.065219445, 35.615814593457664],
                actions: [
                    {
                        "icon": Potree.resourcePath + "/icons/profile.svg",
                        "onclick": function(){
                            showimgmodal(b.spimg_image_label);
                        }
                    }
                ]
            }));
			// To show the annotation
			document.querySelector('.annotation').style.display = 'block';
        }
    } else {
        console.log("Potree viewer or scene is not ready yet. Retrying in 1 second...");
        setTimeout(initializeAnnotations, 1000); // Retry after 1 second
    }
}

// Start the initialization process
initializeAnnotations();

// The PluginsAPI part remains unchanged
PluginsAPI.Map.willAddControls([
    'contours/build/Contours.js',
    'contours/build/Contours.css'
], function(args, Contours){
    var tasks = [];
    for (var i = 0; i < args.tiles.length; i++){
        tasks.push(args.tiles[i].meta.task);
    }

    if (tasks.length === 1){
        args.map.addControl(new Contours({map: args.map, tasks: tasks}));
    }
});