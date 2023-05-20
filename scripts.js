const chatContainer = document.getElementById('chat-container');
const jsonFileInput = document.getElementById('jsonFile');
const baseUrl = "https://cogeval.github.io/cogmaps";
const graphTypes = [
  "n7line", 
  "n7tree",
  "n13line",
  "n15star",
  "n16cluster",
  "n21star"
];
const domains = [
  "ordRooms", 
  "socialTiles", 
  "unordSpatial"
];
const conditions = [
  "1stepPath", 
  "2stepPath",
  "nonteleDetour",
  "nonteleShortcut",
  "rewardReval",
  "teleDetour",
  "teleShortcut",
  "transReval",
  "valuePath"
];
const models = [
  "anthropic-claude-v1",
  "bard",
  "cohere-xlarge",
  "forefront-pythia-20b",
  "gpt-4-32k",
  "gpt-35-turbo",
  "huggingface-bigscience-bloombz",
  "replicate-alpaca-7b",
  "replicate-llama-13b",
  "text-davinci-003"
];
const temperatures = [
  "0", 
  "0.5",
  "1"
];

selectContainer = document.getElementById('select-container');

// Create dropdown containers
const graphTypeContainer = createDropdownContainer("Graph Type:", "graphType", graphTypes);
const domainContainer = createDropdownContainer("Domain:", "domain", domains);
const conditionContainer = createDropdownContainer("Condition:", "condition", conditions);
const modelContainer = createDropdownContainer("Model:", "model", models);
const temperatureContainer = createDropdownContainer("Temperature:", "temperature", temperatures);

// Append dropdown containers to select container
selectContainer.appendChild(graphTypeContainer);
selectContainer.appendChild(domainContainer);
selectContainer.appendChild(conditionContainer);
selectContainer.appendChild(modelContainer);
selectContainer.appendChild(temperatureContainer);

function createDropdownContainer(labelText, selectId, options) {
  // Create container div
  const container = document.createElement("div");
  container.classList.add("dropdown-container");

  // Create label element
  const label = document.createElement("label");
  label.classList.add("dropdown-label");
  label.setAttribute("for", selectId);
  label.textContent = labelText;

  // Create select element
  const select = document.createElement("select");
  select.classList.add("dropdown-select");
  select.setAttribute("id", selectId);

  // Create option elements
  options.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("value", option);
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });

  // Append label and select elements to container div
  container.appendChild(label);
  container.appendChild(select);

  return container;
}

jsonFileInput.addEventListener('change', (event) => {  
  const file = event.target.files[0];  
  if (file) {  
    const reader = new FileReader();  
    reader.onload = (e) => {  
      const data = JSON.parse(e.target.result);  
      displayChatFromLocalFile(data);  
    };  
    reader.readAsText(file);  
  }  
});  

// Get select elements from dropdown containers
const graphTypeSelect = graphTypeContainer.querySelector('select');
const domainSelect = domainContainer.querySelector('select');
const conditionSelect = conditionContainer.querySelector('select');
const modelSelect = modelContainer.querySelector('select');
const temperatureSelect = temperatureContainer.querySelector('select');

// Add change event listeners to dropdowns
graphTypeSelect.addEventListener('change', displayChat);
domainSelect.addEventListener('change', displayChat);
conditionSelect.addEventListener('change', displayChat);
modelSelect.addEventListener('change', displayChat);
temperatureSelect.addEventListener('change', displayChat);

function addMessageToContainer(message, container) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${message.role}`;
  messageElement.innerText = message.content;
  container.appendChild(messageElement);
}

function addTestToContainer(tests, container) {
  const testElement = document.createElement('div');
  testElement.className = 'test';
  testElement.innerText = JSON.stringify(tests, null, 4);
  container.appendChild(testElement);
}

function displayChatFromLocalFile(data) {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = ''; // Clear the previous chat content

  data.messages.forEach(message => {
    addMessageToContainer(message, chatContainer);
  });

  addTestToContainer(data.tests, chatContainer);
}

function displayChat() {
  // Get selected dropdown values
  const graphType = graphTypeSelect.value;
  const domain = domainSelect.value;
  const condition = conditionSelect.value;
  const model = modelSelect.value;
  const temperature = temperatureSelect.value;

  // Construct JSON file path
  const jsonFilePath = `${baseUrl}/conversations/${graphType}/${domain}/${condition}/${model}/temp_${temperature}_000.json`;

  // Fetch JSON file
  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => {
      const chatContainer = document.getElementById('chat-container');
      chatContainer.innerHTML = ''; // Clear the previous chat content

      data.messages.forEach(message => {
        addMessageToContainer(message, chatContainer);
      });
  
      addTestToContainer(data.tests, chatContainer);
    })
    .catch(error => {
      const chatContainer = document.getElementById('chat-container');
      chatContainer.innerHTML = ''; // Clear the previous chat content
  
      addMessageToContainer({ role: 'error', content: 'Conversation doesn\'t exist' }, chatContainer);  
    });
}