        let character = {
            name: "Held",
            stats: [
                { name: "Stärke", current: 10, max: 10 },
                { name: "Geschicklichkeit", current: 8, max: 8 }
            ],
            journal: [
                { date: "2025-02-19", entry: "Abenteuer begonnen" }
            ],
            inventory: [
                { name: "Schwert", description: "Ein scharfes Schwert" }
            ]
        };

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
		
		function displayCharacterStats() {
			const statsContainer = document.getElementById("statsContainer");
			statsContainer.innerHTML = `<button class="addStatBt" onclick="addStat()">+ Stat-Tracker hinzufügen</button><br><strong>Name:</strong> ${character.name}<br>`;
			character.stats.forEach((stat, index) => {
				const statElement = document.createElement("div");
				statElement.className = "stat";
				if (stat.max) {
					statElement.innerHTML = `
					<div class="statElement">
						<span><strong>${stat.name}:</strong> ${stat.current} / ${stat.max}</span>
					</div>
					<div class="statElement">
						<div class="stat-bar-container">
							<div class="stat-bar" style="width: ${(stat.current / stat.max) * 100}%;"></div>
						</div>
						<input type="text" class="statModIn" value="1"/>
						<div style="display: flex; flex-direction: column;">
							<button class="statIncreaseBt" onclick="increaseStat(${index})">+</button>
							<button class="statDecreaseBt" onclick="decreaseStat(${index})">-</button>
						</div>
						<button class="statDeleteBt" onclick="deleteStat(${index})">X</button>
					</div>
				`;

				} else {
					statElement.innerHTML = `
						<strong>${stat.name}:</strong> ${stat.current}
						<input type="text" class="statModIn" value="1"/>
						<button class="statIncreaseBt" onclick="increaseStat(${index})">+</button>
						<button class="statDecreaseBt" onclick="decreaseStat(${index})">-</button>
				`;
				}
				statsContainer.appendChild(statElement);
			});
		}

        // Initiale Anzeige der Charakterstatistiken
        displayCharacterStats();
		displayCharacterInventory();
		displayCharacterJournal();
		
		function displayCharacterInventory() {
			const invContainer = document.getElementById("invContainer");
			invContainer.innerHTML = `<button class="addItemBt" onclick="addItem()">+ Item hinzufügen</button><br>`;
			character.inventory.forEach((item) => {
				const itemElement = document.createElement("div");
				itemElement.className="item";
				itemElement.innerHTML=`
					<strong>${item.name}</strong><br>${item.description}
				`;
				invContainer.appendChild(itemElement);
			});
		
		}
		
		function displayCharacterJournal() {
			const journalContainer = document.getElementById("journalContainer");
			journalContainer.innerHTML=`<textarea id="multiline" rows="5" cols="40" class="journalEntryIn"></textarea><br><button class="addJournalBt" onclick="addJournal(this)">+ Eintrag hinzufügen`;
			// Group journal entries by date
			const groupedEntries = character.journal.reduce((acc, entry) => {
				if (!acc[entry.date]) {
					acc[entry.date] = [];
				}
				acc[entry.date].push(entry.entry);
				return acc;
			}, {});

			// Create the display elements
			for (const date in groupedEntries) {
				const dateElement = document.createElement("div");
				dateElement.className = "journal-date";

				// Create a clickable date header
				const dateHeader = document.createElement("div");
				dateHeader.className = "journal-date-header";
				dateHeader.textContent = date;
				dateHeader.onclick = () => {
					const content = dateElement.querySelector(".journal-entries");
					content.style.display = content.style.display === "none" ? "block" : "none";
				};

				// Create the container for journal entries
				const entriesContainer = document.createElement("div");
				entriesContainer.className = "journal-entries";
				entriesContainer.style.display = "none"; // Initially hidden

				// Add each entry for the date
				groupedEntries[date].forEach(entry => {
					const entryElement = document.createElement("div");
					entryElement.className = "journal-entry";
					entryElement.textContent = entry;
					entriesContainer.appendChild(entryElement);
				});

				// Append the header and entries to the date element
				dateElement.appendChild(dateHeader);
				dateElement.appendChild(entriesContainer);

				// Append the date element to the journal container
				journalContainer.appendChild(dateElement);
			}
		}
		
		
	function increaseStat(index) {
		const statElement = document.getElementsByClassName("stat")[index];
		const statModValue = parseInt(statElement.querySelector(".statModIn").value, 10);

		if (!isNaN(statModValue)) {
			character.stats[index].current += statModValue;
			displayCharacterStats(); // Aktualisiere die Anzeige der Statistiken
		} else {
			alert("Bitte eine gültige Zahl eingeben.");
		}
	}
	
	function decreaseStat(index) {
		const statElement = document.getElementsByClassName("stat")[index];
		const statModValue = parseInt(statElement.querySelector(".statModIn").value, 10);

		if (!isNaN(statModValue)) {
			character.stats[index].current -= statModValue;
			displayCharacterStats(); // Aktualisiere die Anzeige der Statistiken
		} else {
			alert("Bitte eine gültige Zahl eingeben.");
		}
	}
	////////////////////////////
	///
	///ADD FUNCTIONS
	///
	////////////////////////////
	
	function addStat() {
		const statName = prompt("Gib den Namen des neuen Attributs ein:");
		const maxValue = parseInt(prompt("Gib den Maximalwert des neuen Attributs ein:"), 10);

		if (statName && !isNaN(maxValue)) {
			character.stats.push({ name: statName, current: 0, max: maxValue });
		}
		displayCharacterStats();
	}
	
	function addItem() {
		const itemName = prompt("Gib den Namen des Items ein:");
		const itemDescr = prompt("Gib eine Beschreibung für das Item ein:");
		
		if (itemName && itemDescr) {
				character.inventory.push({name: itemName, description: itemDescr});
		}
		displayCharacterInventory();
	}
	
	function addJournal(button) {
		const journalDate = new Date().toISOString().split('T')[0];
		const journalEntry = button.parentElement.querySelector(".journalEntryIn").value;
		
		
		if (journalDate && journalEntry) {
			character.journal.push({date: journalDate, entry: journalEntry});
		}
		displayCharacterJournal();
	}
	
	
	////////////////////////////
	///
	///REMOVE FUNCTIONS
	///
	////////////////////////////
	
	function deleteStat(index) {
			character.stats.splice(index,1);
			displayCharacterStats();
	
	}