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
  "socialTies", 
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
  "gpt-4-32k",
  "gpt-35-turbo",
  "replicate-alpaca-7b",
  "replicate-llama-13b",
  "text-davinci-003"
];
const temperatures = [
  "0", 
  "0.5",
  "1"
];

const convIdsAll= [
  "000", "001", "002", "003", "004", "005", "006", "007", "008", "009",
  "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
  "020", "021", "022", "023", "024", "025", "026", "027", "028", "029"
]

const convIdsFirst = [
  "000"
]

selectContainer = document.getElementById('select-container');

// Create dropdown containers
const graphTypeContainer = createDropdownContainer("Graph Type:", "graphType", graphTypes);
const domainContainer = createDropdownContainer("Domain:", "domain", domains);
const conditionContainer = createDropdownContainer("Condition:", "condition", conditions);
const modelContainer = createDropdownContainer("Model:", "model", models);
const temperatureContainer = createDropdownContainer("Temperature:", "temperature", temperatures);
const convIdsContainer = createDropdownContainer("Conversation ID:", "convId", convIdsAll);


// Append dropdown containers to select container
selectContainer.appendChild(graphTypeContainer);
selectContainer.appendChild(domainContainer);
selectContainer.appendChild(conditionContainer);
selectContainer.appendChild(modelContainer);
selectContainer.appendChild(temperatureContainer);
selectContainer.appendChild(convIdsContainer);

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
const convIdsSelect = convIdsContainer.querySelector('select');

// Add change event listeners to dropdowns
graphTypeSelect.addEventListener('change', displayChat);
domainSelect.addEventListener('change', displayChat);
conditionSelect.addEventListener('change', displayChat);
modelSelect.addEventListener('change', displayChat);
temperatureSelect.addEventListener('change', displayChat);
convIdsSelect.addEventListener('change', displayChat);

function addMessageToContainer(message, container) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${message.role}`;
  messageElement.innerText = message.content;
  container.appendChild(messageElement);
}

function addTestToContainer(tests, scores, container) {
  const testElement = document.createElement('div');
  testElement.className = 'message test-score';

  // Loop through each test and add it to the container
  for(const key of Object.keys(tests)) {
    const score = scores[key].score / scores[key].max_score;
    const rubric = scores[key].rubric;
    let colorClass = '';

    // Set the color class based on the score
    if (score > 0.8) {
      colorClass = 'green';
    } else if (score > 0.5) {
      colorClass = 'yellow';
    } else {
      colorClass = 'red';
    }

    testElement.innerText= `Test: ${key}\nExpected: [${tests[key].expected_answer}]\n\nScore: ${score} / ${scores[key].max_score}\nRubric: ${rubric}`;
    // Add the color class to the test element
    testElement.classList.add(colorClass);
    container.appendChild(testElement);
  };
}

function displayChatFromLocalFile(data) {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = ''; // Clear the previous chat content

  data.messages.forEach(message => {
    addMessageToContainer(message, chatContainer);
  });

  if (data.scores != null) {
    addTestToContainer(data.tests, data.scores, chatContainer);
  }
}

function displayChat() {
  // Get selected dropdown values
  const graphType = graphTypeSelect.value;
  const domain = domainSelect.value;
  const condition = conditionSelect.value;
  const model = modelSelect.value;
  const temperature = temperatureSelect.value;
  var convId = convIdsSelect.value;

  if (!["gpt-4-32k", "gpt-35-turbo", "text-davinci-003"].includes(model)){
    convIdsSelect.value = "000";
    convId = convIdsSelect.value;
  }

  // Construct JSON file path
  const jsonFilePath = `${baseUrl}/conversations/${graphType}/${domain}/${condition}/${model}/temp_${temperature}_${convId}.json`;

  // Fetch JSON file
  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => {
      const chatContainer = document.getElementById('chat-container');
      chatContainer.innerHTML = ''; // Clear the previous chat content

      data.messages.forEach(message => {
        addMessageToContainer(message, chatContainer);
      });
      if (data.scores != null) {
        addTestToContainer(data.tests, data.scores, chatContainer);
      }
    })
    .catch(error => {
      const chatContainer = document.getElementById('chat-container');
      chatContainer.innerHTML = ''; // Clear the previous chat content
  
      addMessageToContainer({ role: 'error', content: 'Conversation doesn\'t exist' }, chatContainer);  
    });
}
