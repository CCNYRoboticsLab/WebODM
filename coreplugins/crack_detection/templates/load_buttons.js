const crackData = JSON.parse('{{ crack_data|safe }}');

function initializeAnnotations(crackData) {
    if (window.viewer && window.viewer.scene) {
        let scene = window.viewer.scene;

        crackData.forEach((crack, index) => {
            scene.annotations.add(new Potree.Annotation({
                title: `Crack ${index + 1}`,
                position: [parseFloat(crack.center_lat), parseFloat(crack.center_long), parseFloat(crack.center_alt)],
                cameraPosition: [parseFloat(crack.center_lat) + 10, parseFloat(crack.center_long) - 2, parseFloat(crack.center_alt) - 9],
                cameraTarget: [parseFloat(crack.center_lat), parseFloat(crack.center_long), parseFloat(crack.center_alt)],
                actions: [
                    {
                        "icon": Potree.resourcePath + "/icons/profile.svg",
                        "onclick": function(){
                            showCrackDetails(crack);
                        }
                    }
                ]
            }));
        });

        // To show all annotations
        document.querySelectorAll('.annotation').forEach(el => el.style.display = 'block');
    } else {
        console.log("Potree viewer or scene is not ready yet. Retrying in 1 second...");
        setTimeout(() => initializeAnnotations(crackData), 1000); // Retry after 1 second
    }
}

function showCrackDetails(crack) {
    // Implement this function to show crack details when clicked
    console.log("Crack details:", crack);
    // You can create a modal or update a div with the crack information here
}

// Initialize annotations
{% comment %} initializeAnnotations(crackData); {% endcomment %}
// Call the initialization function when the document is ready
document.addEventListener('DOMContentLoaded', initializeAnnotations(crackData));
