let character = {
    name: "Dulf",
    stats: {
		name : "stats",
		content: [
        { name: "HP", current: 10, max: 32, description: "Physische Kraft des Charakters." },
        { name: "SP", current: 0, max: 3 } // No description
    ]},
    inventory: {
		name: "inventory",
		content: [
        { name: "Atem des Morbo", description: "Ein magischer Dolch, der doppelten Hinterhaltschaden verursacht." },
        { name: "Heiltrank", current: 1, max: 3, description: "Regeneriert 10 HP.", content : [{ name: "HP", current: 10, max: 32, description: "Physische Kraft des Charakters." }] }
    ]},
    journal: {
		content: [
        { date: "2025-02-19", entry: "Abenteuer begonnen", description: "Der Held begann seine Reise." }
    ]}
};

displayCharacterMain(character);

function exportCharacter() {
	if (character.image) {
        character.image = character.image.replace(/(\r\n|\n|\r)/gm, ""); // Ensure single-line Base64
    }
	const dataStr = JSON.stringify(character, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = character.name + ".json";
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
		displayCharacterMain(character);
	};
	reader.readAsText(file);
	
}

function displayCharacterSections(character) {
	const flexContainer = document.getElementById("flexcontainer");
	flexContainer.innerHTML = ""; // Clear existing content

	Object.keys(character).forEach((key) => {
		/* if (Array.isArray(character[key])) { // Only process array sections
			displayCharacterSection(character[key], key);
		 }*/
		if (typeof character[key] === "object" && !Array.isArray(character[key]) && character[key] !== null) {
			displayCharacterSection(character[key], key);
		}
	});
}

function displayCharacterMain(character) {
		const characterContainer = document.getElementById("charactercontainer");
		
		makeHeadlineElement(characterContainer, character);
		
		displayCharacterSections(character);
}

function displayCharacterSection(section, sectionTitle = "Section") {
    const flexContainer = document.getElementById("flexcontainer");
    const sectionContainer = document.createElement("div");
    const sectionName = document.createElement("div");

    sectionName.className = "sectionname";
	makeHeadlineElement(sectionName, section);
    
    sectionContainer.className = "sectionContainer";
	makeContentElement(sectionContainer, section);

    sectionName.appendChild(sectionContainer);
    flexContainer.appendChild(sectionName);
}

function increaseCurrent(item) {

    if (!item  || typeof item.current !== "number") {
        console.error(`increaseCurrent: Invalid section or index - ${item}]`);
        return;
    }

    if ("max" in item && item.current < item.max) {
        item.current++;
    } else if (!("max" in item)) {
		item.current++;
	}

    displayCharacterMain(character); // Refresh UI
}

function decreaseCurrent(item) {

    if (!item  || typeof item.current !== "number") {
        console.error(`decreaseCurrent: Invalid section or index - ${item}]`);
        return;
    }

    if (item.current > 0) {
        item.current--;
    }

    displayCharacterMain(character); // Refresh UI
}


function closeEditForm(form) {
    const openForm = form;
    if (openForm) openForm.remove(); // Remove the form when canceled
}


function openEditForm(owner, sectionElement, isNew=false)   {
    if (sectionElement.querySelector(".editForm")) return;

    const form = document.createElement("div");
    form.className = "editForm";

    // Determine the parent object
    let ownerparent = null;
    Object.keys(character).forEach((key) => {
        if (character[key].content && character[key].content.includes(owner)) {
            ownerparent = character[key];
        }
    });
	makeEditForm(form, owner, isNew, ownerparent);



    // Add the form directly below the sectionElement
    if (isNew) {
        sectionElement.querySelector(".sectionelement").insertBefore(form, sectionElement.querySelector(".sectionelement").firstChild);
    } else {
        sectionElement.after(form);
    }
}

function saveChanges(owner, form, isNew) {
    let section = owner;

    if (isNew) {
        // Create a new object
        const newElement = {
            name: form.querySelector("#name")?.value || "", 
            current: parseInt(form.querySelector("#current")?.value) || 0,
            max: parseInt(form.querySelector("#max")?.value) || 0,
            description: form.querySelector("#description")?.value || ""
        };

        // Add it to the character object
        section.push(newElement);
    } else {
        const sectionElement = owner;

        // Only update the fields if they exist
        const nameField = form.querySelector("#name");
        if (nameField && nameField.value) {
            sectionElement.name = nameField.value;
        } else {
            delete sectionElement.name;
        }

        const currentField = form.querySelector("#current");
        if (currentField && currentField.value) {
            sectionElement.current = parseInt(currentField.value);
        } else {
            delete sectionElement.current;
        }

        const maxField = form.querySelector("#max");
        if (maxField && maxField.value) {
            sectionElement.max = parseInt(maxField.value);
        } else {
            delete sectionElement.max;
        }

        const descField = form.querySelector("#description");
        if (descField && descField.value) {
            sectionElement.description = descField.value;
        } else {
            delete sectionElement.description;
        }
    }

    // Close the form after saving
    closeEditForm(form);  // Pass the `form` directly

    // Re-render the sections to reflect the updated data
    displayCharacterSections(character);
}


function deleteAttribute(owner, form, ownerparent) {
    if (!ownerparent || !Array.isArray(ownerparent.content)) {
        console.error("deleteAttribute: Invalid ownerparent or missing content array.", ownerparent);
        return;
    }

    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${owner.name}"?`)) {
        const index = ownerparent.content.indexOf(owner);
        if (index !== -1) {
            ownerparent.content.splice(index, 1);
        } else {
            console.error("deleteAttribute: Item not found in parent content.", owner);
            return;
        }

        closeEditForm(form);
        displayCharacterMain(character);
    }
}
function createBase64ImageUploader(container,owner) {
    //const container = document.getElementById(containerId);
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.aspectRatio = "1";
    container.style.height = "100px";
    container.style.border = "2px dashed #ccc";
    container.style.cursor = "pointer";
    container.style.position = "relative";
    container.style.overflow = "hidden";
    
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    
    const button = document.createElement("div");
    button.innerText = "+";
    button.style.fontSize = "50px";
    button.style.color = "#ccc";
    button.style.position = "absolute";
    button.style.top = "50%";
    button.style.left = "50%";
    button.style.transform = "translate(-50%, -50%)";
    
    const img = document.createElement("img");
	img.id = "imgelement";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.display = "none";
	if (owner.image) {
			img.src = owner.image;
			img.style.display = "block";
			button.style.display = "none";
	}
    
    container.appendChild(button);
    container.appendChild(fileInput);
    container.appendChild(img);
    
    container.addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
                img.style.display = "block";
                button.style.display = "none";
				owner.image = img.src;
            };
            reader.readAsDataURL(file);
        }
    });
}

function makeHeadlineElement (caller, owner) {
		const characterContainer = caller;
		const characterHeadline = document.createElement("div");
		const characterButtons = document.createElement("div");
		const characterImage = document.createElement("div");
		characterContainer.className="charactercontainer";
		characterHeadline.className = "characterheadline";
		
		characterContainer.innerHTML = ``;
		
		characterHeadline.innerHTML = `<h1>${owner.name? owner.name:"Nobody"}</h1>`;
		characterButtons.innerHTML = `<button onclick="exportCharacter()">Exportieren</button>
		<input type="file" id="fileInput" onchange="importCharacter(event)" />
		`;
		createBase64ImageUploader(characterImage,owner);
		
		characterContainer.appendChild(characterHeadline);
		characterHeadline.insertBefore(characterImage,characterHeadline.firstChild);
		if (owner==character) {characterHeadline.appendChild(characterButtons);}
}

function makeContentElement(sectionContainer, section) {
	const contentButtons = document.createElement("div");
	const addButton = document.createElement("button");
	const hideButton = document.createElement("button");
	contentButtons.className = "contentbuttons";
	addButton.innerText = "+ Add";
	addButton.className = "addButton";
	addButton.onclick = () => openEditForm(section.content,sectionContainer,true);
	hideButton.className = "hidebutton";
	hideButton.innerText = ">";
	hideButton.onclick = () => hideShowContent(sectionContainer);
	contentButtons.appendChild(addButton);
	contentButtons.appendChild(hideButton);
	sectionContainer.appendChild(contentButtons);
    section.content.forEach((sectionElement) => {
        const elementContainer = document.createElement("div");
        elementContainer.className = "sectionelement";
		makeContentItemElement(elementContainer, sectionElement);
        sectionContainer.appendChild(elementContainer);
    });
}

function makeContentItemElement (elementContainer, owner) {
	const row1 = document.createElement("div");
	row1.className = "row1";

	if ("name" in owner) {
		const elementName = document.createElement("span");
		elementName.className = "elementName";
		elementName.innerHTML = `<strong>${owner.name}</strong>`;
		row1.appendChild(elementName);
	}
	
	if ("current" in owner) {
		const elementCurrent = document.createElement("span");
		elementCurrent.className = "elementCurrent";
		elementCurrent.innerHTML = ` ${owner.current} `;
		if ("max" in owner) {
			elementCurrent.innerHTML = ` ${owner.current} / ${owner.max}`;	
		}
		row1.appendChild(elementCurrent);

		// Create modification buttons
		const increaseButton = document.createElement("button");
		increaseButton.className = "statIncreaseBt";
		increaseButton.innerText = "+";
		increaseButton.onclick = function () {
			increaseCurrent(owner);
		};

		const decreaseButton = document.createElement("button");
		decreaseButton.className = "statDecreaseBt";
		decreaseButton.innerText = "-";
		decreaseButton.onclick = function () {
			decreaseCurrent(owner);
		};

		const modButtons = document.createElement("div");
		modButtons.className = "modbuttons";
		modButtons.appendChild(increaseButton);
		modButtons.appendChild(decreaseButton);
		row1.appendChild(modButtons);
    }
	const editButton = document.createElement("button");
	editButton.innerText = "Edit";
	editButton.onclick = () => openEditForm(owner, elementContainer);
	row1.appendChild(editButton);
	elementContainer.appendChild(row1);
	
	// Row 2: Status Bar if applicable
	if ("current" in owner && "max" in owner) {
		const row2 = document.createElement("div");
		row2.className = "row2";

		const statBarContainer = document.createElement("div");
		statBarContainer.className = "stat-bar-container";

		const statBar = document.createElement("div");
		statBar.className = "stat-bar";
		statBar.style.width = `${(owner.current / owner.max) * 100}%`;

		statBarContainer.appendChild(statBar);
		row2.appendChild(statBarContainer);

		elementContainer.appendChild(row2);
	}

	// Row 3: Description if available
	if ("description" in owner) {
		const row3 = document.createElement("div");
		row3.className = "row3";

		const elementDescription = document.createElement("p");
		elementDescription.className = "elementDescription";
		elementDescription.innerText = owner.description;

		row3.appendChild(elementDescription);
		elementContainer.appendChild(row3);
	}
	
	if ("content" in owner) {
		const row4 = document.createElement("div");
		row4.className = "row4";
		makeContentElement(row4, owner);
		elementContainer.appendChild(row4);
	}
}

function makeEditForm (form, owner, isNew=false, ownerparent = null) {
	for (const key in isNew? owner[0] : owner) {
		const formRow = document.createElement("div");
		formRow.className = "edit-form-row";
		
		const rowLabel = document.createElement("label");
		rowLabel.className = "form-row-label";
		rowLabel.innerText = key;
		rowLabel.htmlFor = key;
		
		let rowInput = document.createElement("input");
		rowInput.className = "form-row-input";
		if (["name"].includes(key)) {
			rowInput.type="text";

		} else if (["current","max"].includes(key)) {
			rowInput.type = "number";
		}else if (["description"].includes(key)) {
			rowInput = document.createElement("textarea");
		}
		rowInput.id=key;
		rowInput.name=key;
		rowInput.value=owner[key];
		
		formRow.appendChild(rowLabel);
		formRow.appendChild(rowInput);
		form.appendChild(formRow);
	}
	const formButtons = document.createElement("div");
	formButtons.className = "formbuttons";
	const saveButton = document.createElement("button");
	saveButton.className = "savebutton";
	saveButton.onclick = () => saveChanges(owner, form, isNew);
	saveButton.innerText =isNew? 'Add' : 'Save';
	formButtons.appendChild(saveButton);
	const closeButton = document.createElement("button");
	closeButton.className = "closebutton";
	closeButton.innerText = "Close";
	closeButton.onclick = () => closeEditForm(form);
	formButtons.appendChild(closeButton);
	const deleteButton = document.createElement("button");
	deleteButton.className = "deleteBt";
	deleteButton.innerText = "Delete";
	deleteButton.onclick = () => deleteAttribute(owner, form, ownerparent);
	if (!isNew) {formButtons.appendChild(deleteButton)};
	form.appendChild(formButtons);

  }
function hideShowContent(contentSection) {
    const isHidden = Array.from(contentSection.children).some((sectionElement) =>
        sectionElement.classList.contains("hidden")
    );

    Array.from(contentSection.children).forEach((sectionElement) => {
        if (sectionElement.classList.contains("sectionelement")) {
            if (isHidden) {
                sectionElement.classList.remove("hidden");
            } else {
                sectionElement.classList.add("hidden");
            }
        }
    });
}