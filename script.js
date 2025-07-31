let tasks=[];

const mainSection = document.getElementById('main-section');
const addSection = document.getElementById('add-section');
const viewSection = document.getElementById('view-section');

const addBtn = document.getElementById('add-btn');
const viewBtn = document.getElementById('view-btn');
const closeAddBtn = document.querySelector('.close-add-form-btn');
const closeViewBtn = document.querySelector('.close-view-form-btn');

const addForm = document.getElementById('add-form');
const taskNameInput = document.getElementById('task-name');
const taskDateInput = document.getElementById('task-date');
const taskTimeInput = document.getElementById('task-time');

const taskList=document.getElementById("task-list");

const editModalSection = document.getElementById('edit-modal-section');
const editForm = document.getElementById('edit-form');
const editTaskName = document.getElementById('edit-task-name');
const editTaskDate = document.getElementById('edit-task-date');
const editTaskTime = document.getElementById('edit-task-time');
const cancelEditBtn = document.querySelector('.cancel-edit');
const saveEditBtn = document.querySelector('.save-edit');

const deleteModalSection = document.getElementById('delete-modal-section');
const deleteMessage = document.getElementById('delete-message');
const cancelDeleteBtn = document.querySelector('.cancel-delete');
const confirmDeleteBtn = document.querySelector('.confirm-delete');

let currentEditIndex=-1;
let pendingDeleteIndex=-1;

function showSection(sectionToShow){
    [mainSection,addSection,viewSection].forEach(section=>{
        if(section===sectionToShow){
            section.classList.remove("hidden");
            section.setAttribute('aria-hidden','false');
        }else{
            section.classList.add("hidden");
            section.setAttribute('aria-hidden','true');
        }
    })
}

loadTasksFromLocalStorage();

addBtn.addEventListener('click', () => showSection(addSection));
viewBtn.addEventListener('click', () =>{
    renderTask(); 
    showSection(viewSection);
});
closeViewBtn.addEventListener('click', () => showSection(mainSection));

addForm.addEventListener("submit",(e)=>{
  e.preventDefault();

  const taskName=taskNameInput.value.trim();
  const taskDate=taskDateInput.value;
  const taskTime=taskTimeInput.value;

  const newTask={
    name:taskName,
    date:taskDate,
    time:taskTime,
    status:"incomplete"
  }

  tasks.push(newTask);
  saveTasksToLocalStorage(); 
  addForm.reset();

  showSection(mainSection);
})


function renderTask(){
  taskList.innerHTML='';

  tasks.forEach((task,index)=>{
    const li=document.createElement('li');

    const taskInfo=document.createElement('div');
    taskInfo.innerHTML=`
    <strong>${task.name}</strong><br>
    <small>${task.date||''} ${task.time||''}</small>
    `;

    const statusDiv=document.createElement('div');
    statusDiv.className='task-status';
    statusDiv.innerHTML=`
    <label><input type="radio" name="status-${index}" value="incomplete" ${task.status === 'incomplete' ? 'checked' :''}>⏳ Incomplete</label>
    <label><input type="radio" name="status-${index}" value="inprogress" ${task.status === 'inprogress' ? 'checked' : ''}>🔄 In progress</label>
    <label><input type="radio" name="status-${index}" value="complete" ${task.status === 'complete' ? 'checked' : ''}>✅ Complete</label>
    `

    const actionDiv=document.createElement('div');
    actionDiv.style.display = 'flex';
    actionDiv.style.gap = '0.5rem';
    const editBtn=document.createElement('button');
    editBtn.textContent='✏️ Edit';
    editBtn.className='edit-btn';
    editBtn.setAttribute('type', 'button');
    editBtn.setAttribute('data-index', index);

    const deleteBtn=document.createElement('button');
    deleteBtn.textContent='🗑️ Delete';
    deleteBtn.className='delete-btn';
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.setAttribute('data-index', index);

    actionDiv.appendChild(editBtn);
    actionDiv.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(statusDiv);
    li.appendChild(actionDiv);

    taskList.appendChild(li);
  })
}

taskList.addEventListener("click",(e)=>{
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  if(deleteBtn){
    const index=parseInt(deleteBtn.getAttribute('data-index'),10);
    pendingDeleteIndex = index;

    deleteMessage.textContent= `Are you sure you want to delete the task "${tasks[index].name}"?`;
    deleteModalSection.classList.remove('hidden');
    deleteModalSection.setAttribute('aria-hidden', 'false');
     return;
  } else {
  if(editBtn){ 
    const index = parseInt(editBtn.getAttribute('data-index'), 10);
    const task = tasks[index];
    currentEditIndex = index;

    editTaskName.value = task.name;
    editTaskDate.value = task.date || '';
    editTaskTime.value = task.time || '';

    editModalSection.classList.remove('hidden');
    editModalSection.setAttribute('aria-hidden', 'false');
  }
  }})

cancelEditBtn.addEventListener("click",()=>{
    editModalSection.classList.add('hidden');
    editModalSection.setAttribute('aria-hidden','true');
    currentEditIndex=-1;
    })

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentEditIndex === -1) return;

    const updatedTask = {
     ...tasks[currentEditIndex], 
     name: editTaskName.value.trim(),
     date: editTaskDate.value,
     time: editTaskTime.value
    };

     tasks[currentEditIndex] = updatedTask;
     saveTasksToLocalStorage();
     currentEditIndex = -1;

     editModalSection.classList.add('hidden');
     editModalSection.setAttribute('aria-hidden', 'true');
     
     renderTask();
    })

cancelDeleteBtn.addEventListener('click', () => {
  deleteModalSection.classList.add('hidden');
  deleteModalSection.setAttribute('aria-hidden', 'true');
  pendingDeleteIndex = -1;
});

confirmDeleteBtn.addEventListener('click', () => {
  if (pendingDeleteIndex !== -1) {
    tasks.splice(pendingDeleteIndex, 1);
    saveTasksToLocalStorage();
    renderTask();
  }
  deleteModalSection.classList.add('hidden');
  deleteModalSection.setAttribute('aria-hidden', 'true');
  pendingDeleteIndex = -1;
});


taskList.addEventListener('change', (e) => {
  if (e.target.type === 'radio' && e.target.name.startsWith('status-')) {
    const index = parseInt(e.target.name.split('-')[1], 10);
    const newStatus = e.target.value;

    tasks[index].status = newStatus;
    saveTasksToLocalStorage();
    renderTask(); 
  }
});

function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
    renderTask();
  }
}

const modalSection = document.getElementById('modal-section');
const cancelModalBtn = modalSection.querySelector('.cancel');
const discardModalBtn = modalSection.querySelector('.discard');

closeAddBtn.addEventListener('click', () => {
  if (taskNameInput.value.trim()) {
    modalSection.classList.remove('hidden');
    modalSection.setAttribute('aria-hidden', 'false');
  } else {
    showSection(mainSection); 
  }
});

cancelModalBtn.addEventListener('click', () => {
  modalSection.classList.add('hidden');
  modalSection.setAttribute('aria-hidden', 'true');
});

discardModalBtn.addEventListener('click', () => {
  modalSection.classList.add('hidden');
  modalSection.setAttribute('aria-hidden', 'true');

  addForm.reset();
  showSection(mainSection);
});



