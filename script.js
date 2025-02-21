let character = {
    name: "Held",
    stats: [
        { name: "Stärke", current: 10, max: 10, description: "Physische Kraft des Charakters." },
        { name: "Mana", current: 5, max: 20 } // No description
    ],
    inventory: [
        { name: "Schwert", description: "Ein scharfes Schwert für tapfere Krieger." },
        { name: "Heiltrank", current: 1, max: 3, description: "Regeneriert 10 HP." }
    ],
    journal: [
        { date: "2025-02-19", entry: "Abenteuer begonnen", description: "Der Held begann seine Reise." }
    ]
};

displayCharacterSections(character);

function exportCharacter() {
	const dataStr = JSON.stringify(character, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "character.json";
	a.click();
	URL.revokeObjectURL(url);
}

function importCharacter(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(e) {
		const content = e.target.result;
		character = JSON.parse(content);
		console.log("Charakterdaten importiert:", character);
		displayCharacterStats();
		displayCharacterInventory();
	};
	reader.readAsText(file);
}

function displayCharacterSections(character) {
	const flexContainer = document.getElementById("flexcontainer");
	flexContainer.innerHTML = ""; // Clear existing content

	Object.keys(character).forEach((key) => {
		if (Array.isArray(character[key])) { // Only process array sections
			displayCharacterSection(character[key], key);
		}
	});
}


function displayCharacterSection(section, sectionTitle = "Section") {
    const flexContainer = document.getElementById("flexcontainer");
    const sectionContainer = document.createElement("div");
    const sectionName = document.createElement("div");

    sectionName.className = "sectionname";
    sectionName.innerHTML = `<h2>${sectionTitle}</h2>`;
	// Add Button next to the section name
    const addButton = document.createElement("button");
    addButton.innerText = "+ Add";
    addButton.className = "addButton";
    addButton.onclick = () => openEditForm(null, sectionTitle, -1, sectionContainer);
    
    sectionName.appendChild(addButton);
    sectionContainer.className = "sectionContainer";

    section.forEach((sectionElement, index) => {
        const elementContainer = document.createElement("div");
        elementContainer.className = "sectionelement";

        // Row 1: Name, Current/Max Values, and Buttons
        const row1 = document.createElement("div");
        row1.className = "row1";

        if ("name" in sectionElement) {
            const elementName = document.createElement("span");
            elementName.className = "elementName";
            elementName.innerHTML = `<strong>${sectionElement.name}</strong>`;
            row1.appendChild(elementName);
        }

        if ("current" in sectionElement) {
            const elementCurrent = document.createElement("span");
            elementCurrent.className = "elementCurrent";
            elementCurrent.innerHTML = ` ${sectionElement.current} `;
			if ("max" in sectionElement) {
				elementCurrent.innerHTML = ` ${sectionElement.current} / ${sectionElement.max}`;	
			}
            row1.appendChild(elementCurrent);

            // Create modification buttons
            const modButtons = document.createElement("div");
            modButtons.className = "modbuttons";
			modButtons.innerHTML = `
				<div style="display: flex; flex-direction: column;">
					<button class="statIncreaseBt" onclick="increaseCurrent('${sectionTitle}', ${index})">+</button>
					<button class="statDecreaseBt" onclick="decreaseCurrent('${sectionTitle}', ${index})">-</button>
				</div>
			`;

            row1.appendChild(modButtons);
        }
		const editButton = document.createElement("button");
		editButton.innerText = "Edit";
		editButton.onclick = () => openEditForm(sectionElement, sectionTitle, index, row1);
		row1.appendChild(editButton);
        elementContainer.appendChild(row1);

        // Row 2: Status Bar if applicable
        if ("current" in sectionElement && "max" in sectionElement) {
            const row2 = document.createElement("div");
            row2.className = "row2";

            const statBarContainer = document.createElement("div");
            statBarContainer.className = "stat-bar-container";

            const statBar = document.createElement("div");
            statBar.className = "stat-bar";
            statBar.style.width = `${(sectionElement.current / sectionElement.max) * 100}%`;

            statBarContainer.appendChild(statBar);
            row2.appendChild(statBarContainer);

            elementContainer.appendChild(row2);
        }

        // Row 3: Description if available
        if ("description" in sectionElement) {
            const row3 = document.createElement("div");
            row3.className = "row3";

            const elementDescription = document.createElement("p");
            elementDescription.className = "elementDescription";
            elementDescription.innerText = sectionElement.description;

            row3.appendChild(elementDescription);
            elementContainer.appendChild(row3);
        }

        sectionContainer.appendChild(elementContainer);
    });

    sectionName.appendChild(sectionContainer);
    flexContainer.appendChild(sectionName);
}

function increaseCurrent(sectionName, index) {
    let section = character[sectionName]; // Get the correct section array

    if (!section || !section[index] || typeof section[index].current !== "number") {
        console.error(`increaseCurrent: Invalid section or index - ${sectionName}[${index}]`);
        return;
    }

    if ("max" in section[index] && section[index].current < section[index].max) {
        section[index].current++;
    } else if (!("max" in section[index])) {
		section[index].current++;
	}

    displayCharacterSections(character); // Refresh UI
}

function decreaseCurrent(sectionName, index) {
    let section = character[sectionName]; // Get the correct section array

    if (!section || !section[index] || typeof section[index].current !== "number") {
        console.error(`decreaseCurrent: Invalid section or index - ${sectionName}[${index}]`);
        return;
    }

    if (section[index].current > 0) {
        section[index].current--;
    }

    displayCharacterSections(character); // Refresh UI
}


function closeEditForm(form) {
    const openForm = form;
    if (openForm) openForm.remove(); // Remove the form when canceled
}


function openEditForm(sectionElement, sectionTitle, index, trigger) {
    // Check if the form is already open for the element
    if (trigger.parentNode.querySelector(".editForm")) {
        return; // If already open, do nothing
    }
	
	const isNew = sectionElement === undefined || sectionElement === null;

    // Get the corresponding sectionElement data
    if (sectionElement){const sectionElement = character[sectionTitle][index]};

    // Create the pop-out form below the sectionElement
    const form = document.createElement("div");
    form.className = "editForm";  // Style this to look like part of the section

    form.innerHTML = `
        
        
        <!-- Name -->
		<div class="edit-form-row">
		<input type="checkbox" id="nameCheckbox" ${isNew ? "" : sectionElement.name ? 'checked' : ''} />
        <label for="name">Name:</label>
        <input type="text" id="name" value="${isNew ? "" : sectionElement.name || ''}" />
        
		</div>

        <!-- Current -->
		<div class="edit-form-row">
		<input type="checkbox" id="currentCheckbox" ${isNew ? "" : sectionElement.current ? 'checked' : ''} />
        <label for="current">Current:</label>
        <input type="number" id="current" value="$isNew ? "" : {sectionElement.current || ''}" />
        
		</div>

		<div class="edit-form-row">
        <!-- Max -->
		<input type="checkbox" id="maxCheckbox" ${isNew ? "" : sectionElement.max ? 'checked' : ''} />
        <label for="max">Max:</label>
        <input type="number" id="max" value="${isNew ? "" : sectionElement.max || ''}" />
		</div>

		<div class="edit-form-row">
        <!-- Description -->
		<input type="checkbox" id="descriptionCheckbox" ${isNew ? "" : sectionElement.description ? 'checked' : ''} />
		<label for="description">Description:</label>
        <textarea id="description">${isNew ? "" : sectionElement.description || ''}</textarea>     
		</div>
	
        <button onclick="saveChanges('${sectionTitle}', ${index}, this.parentNode, ${isNew})">${isNew ? "Create" : "Save"}</button>
        <button onclick="closeEditForm(this.parentNode)">Cancel</button>
        ${!isNew ? `<button class="deleteBt" onclick="deleteAttribute('${sectionTitle}', ${index}, this)" style="background-color: #d9534f;">Delete</button>` : ""}
    `;


    // Add the form directly below the sectionElement
    if (isNew) {
        trigger.insertBefore(form, trigger.firstChild);
    } else {
        trigger.appendChild(form);
    }
}

function saveChanges(sectionTitle, index, trigger, isNew) {
     let section = character[sectionTitle];

    if (isNew) {
        // Create a new object
        const newElement = {
            name: document.getElementById("name").value,
            current: parseInt(document.getElementById("current").value) || 0,
            max: parseInt(document.getElementById("max").value) || 0,
            description: document.getElementById("description").value
        };

        // Add it to the character object
        section.push(newElement);
		//section.insertBefore(newElement, section.firstChild);
    } else {
		const sectionElement = character[sectionTitle][index];

		// Check the state of the checkboxes and update accordingly
		const nameChecked = document.getElementById("nameCheckbox").checked;
		const currentChecked = document.getElementById("currentCheckbox").checked;
		const maxChecked = document.getElementById("maxCheckbox").checked;
		const descriptionChecked = document.getElementById("descriptionCheckbox").checked;

		// Update the character data only if the checkbox is checked
		if (nameChecked) {
			sectionElement.name = document.getElementById("name").value;
		} else {
			delete sectionElement.name; // Remove attribute if unchecked
		}

		if (currentChecked) {
			sectionElement.current = parseInt(document.getElementById("current").value);
		} else {
			delete sectionElement.current; // Remove attribute if unchecked
		}

		if (maxChecked) {
			sectionElement.max = parseInt(document.getElementById("max").value);
		} else {
			delete sectionElement.max; // Remove attribute if unchecked
		}

		if (descriptionChecked) {
			sectionElement.description = document.getElementById("description").value;
		} else {
			delete sectionElement.description; // Remove attribute if unchecked
		}
	}
    // Close the form after saving
    closeEditForm(trigger);

    // Re-render the sections to reflect the updated data
    displayCharacterSections(character);
}

function deleteAttribute(sectionTitle, index, trigger) {
    // Confirm the deletion action
    if (confirm(`Are you sure you want to delete this ${sectionTitle} item?`)) {
        // Remove the element from the section array
        character[sectionTitle].splice(index, 1);

        // Close the form after deletion
        closeEditForm(trigger);

        // Re-render the sections to reflect the updated data
        displayCharacterSections(character);
    }
}
