const crackData = JSON.parse('{{ crack_data|safe }}');

function createFloatingButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 1000;
    `;

    const loadButton = createButton('Load Annotations', 'loadAnnotationsButton', () => showConfirmationDialog(crackData.length));
    const selectButton = createButton('Select Area', 'selectAreaButton', () => handleSelectArea());

    buttonContainer.appendChild(loadButton);
    buttonContainer.appendChild(selectButton);
    document.body.appendChild(buttonContainer);
}

function createButton(text, id, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;
    button.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    button.addEventListener('click', onClick);
    return button;
}

function handleSelectArea() {
    console.log("Select Area button clicked");
    window.open('https://otho.boshang.online', '_blank');
}

function showConfirmationDialog(annotationCount) {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001;
    `;
    dialog.innerHTML = `
        <p>Are you sure you want to add ${annotationCount} annotations?</p>
        <button id="confirmYes">Yes</button>
        <button id="confirmNo">No</button>
    `;
    document.body.appendChild(dialog);

    document.getElementById('confirmYes').addEventListener('click', () => {
        document.body.removeChild(dialog);
        initializeAnnotations(crackData);
    });

    document.getElementById('confirmNo').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

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

        {% comment %} // Show all annotations
        document.querySelectorAll('.annotation').forEach(el => el.style.display = 'block');
        
        // Remove the floating button after annotations are loaded
        const floatingButton = document.getElementById('loadAnnotationsButton');
        if (floatingButton) {
            floatingButton.remove();
        } {% endcomment %}
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

// Check if the URL starts with "https://webodm.boshang.online/3d/" and create the button if it does
function checkURLAndCreateButton() {
    const currentURL = window.location.href;
    if (currentURL.startsWith("https://webodm.boshang.online/3d/") || 
        currentURL.startsWith("https://webodm.boshang.online/public/")) {
        createFloatingButton();
    }
}

// Run the check when the document is ready
document.addEventListener('DOMContentLoaded', checkURLAndCreateButton);