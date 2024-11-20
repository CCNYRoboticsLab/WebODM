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

// Add InspectionNet functionality
function toggleUploadPanel() {
    console.log("toggleUploadPanel called");
    const uploadPanel = document.getElementById("uploadPanel");
    if (uploadPanel) {
        console.log("Upload panel found, current display:", uploadPanel.style.display);
        uploadPanel.style.display =
            uploadPanel.style.display === "none" ? "block" : "none";
    } else {
        console.log("Upload panel not found");
    }
}

// Add InspectionNet button and panel
function setupInspectionNet() {
    console.log("setupInspectionNet called");
    const addButton = document.querySelector(".add-button .btn.btn-primary.btn-sm");
    if (addButton) {
        console.log("Add button found, creating InspectionNet button");
        // Create InspectionNet button
        const inspectionButton = document.createElement("button");
        inspectionButton.className = "upload-button btn btn-primary";
        inspectionButton.textContent = "InspectionNet";
        inspectionButton.onclick = toggleUploadPanel;

        // Add button next to "+Add Project"
        addButton.parentNode.insertBefore(
            inspectionButton,
            addButton.nextSibling
        );
        console.log("InspectionNet button added to DOM");

        // Create the upload panel with improved styling
        const uploadPanel = document.createElement('div');
        uploadPanel.id = "uploadPanel";
        uploadPanel.className = "upload-panel";
        uploadPanel.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 1000px;
            height: 80vh;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
        `;

        // Add a semi-transparent overlay
        const overlay = document.createElement('div');
        overlay.id = "uploadPanelOverlay";
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        `;
        
        uploadPanel.innerHTML = `
            <div style="position: relative; height: 100%;">
                <button class="close-panel btn btn-danger" style="
                    position: absolute;
                    right: -10px;
                    top: -10px;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    line-height: 30px;
                    text-align: center;
                    font-size: 20px;
                    z-index: 1002;
                " onclick="toggleUploadPanel()">×</button>
                <iframe src="https://laimatt.boshang.online/" 
                    style="width: 100%; height: calc(100% - 10px); border: none; border-radius: 4px;"
                ></iframe>
            </div>
        `;

        // Add overlay and panel to the document
        document.body.appendChild(overlay);
        document.body.appendChild(uploadPanel);
        
        // Modify toggleUploadPanel to handle both panel and overlay
        toggleUploadPanel = function() {
            const panel = document.getElementById("uploadPanel");
            const overlay = document.getElementById("uploadPanelOverlay");
            if (panel && overlay) {
                const isVisible = panel.style.display === "block";
                panel.style.display = isVisible ? "none" : "block";
                overlay.style.display = isVisible ? "none" : "block";
            }
        };

        console.log("Upload panel added to DOM");
    } else {
        console.log("Add button not found. Selector '.add-button .btn.btn-primary.btn-sm' returned:", addButton);
        const allButtons = document.querySelectorAll('button');
        console.log("All buttons on page:", allButtons);
        const addButtonContainer = document.querySelector('.add-button');
        console.log("Add button container:", addButtonContainer);
    }
}

// Check if the URL starts with "https://webodm.boshang.online/3d/" and create the button if it does
function checkURLAndCreateButton() {
    const currentURL = window.location.href;
    if (currentURL.startsWith("https://webodm.boshang.online/3d/") || 
        currentURL.startsWith("https://webodm.boshang.online/public/")) {
        createFloatingButton();
    }
}

// Run both initialization functions when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");
    checkURLAndCreateButton();
    setupInspectionNet();
});

// Also try running setup after a short delay in case DOM elements are added dynamically
setTimeout(() => {
    console.log("Trying setupInspectionNet after 2 second delay");
    setupInspectionNet();
}, 2000);