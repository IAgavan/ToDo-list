// Task Class: создает новую задачу 

class Task {
  constructor(task, dueDate, id) {
    this.task = task;
    this.dueDate = dueDate;
    this.status = "1";
    this.id = id;
  }
}
// UI Class: производит UI действия (добавить, удалить, изменить, показать оповещения и др.)
class UI {
  // показываем задачи из localStorage
  static displayTasks() {
    const tasks = Store.getTasks();

    UI.sortTasks(tasks);
    tasks.forEach((task) => UI.addTasksToList(task))

  }
  // добавляем задачу в список задач 
  static addTasksToList(task) {
    const taskList = document.querySelector('tbody');
    const tasks = taskList.children;
    const number = tasks.length + 1;
    const row = document.createElement('tr');


    // создаем уникальный ID для задачи, если его нет
    if (!task.id) {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
      let id = "";
      for (var i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      task.id = id;
    }

    row.id = task.id;

    //наполняем таблицу задачи
    row.innerHTML = `
    <th scope="row" class="number text-center align-middle">${number}</th>
    <td class="taskText d-flex align-middle"><input type="text" class="textField d-none"><p class="text m-0 ">${task.task}</p> <button class="btn btn-sm btn-primary edit-button ml-auto">Edit</button></td>
    <td class="text-center align-middle">${task.dueDate}</td>
    <td class="text-center align-middle">
      <select class="custom-select custom-select-sm w-75 px-1">
        <option value="1">In progress</option>
        <option value="2">Pending</option>
        <option value="3">Finished</option>
      </select>
    </td>
    <td class="text-center align-middle"><a href="" class="btn btn-primary btn-sm delete">X</a></td>
    `;

    //проверяем статус задачи
    const statusSelector = row.querySelector('.custom-select');
    statusSelector.value = task.status;
    switch (statusSelector.value) {
      case "2":
        row.classList.add('table-warning');
        break;
      case "3":
        row.classList.add('table-success');
        break;
    }

    taskList.appendChild(row);

  }

  // изменяем задачу в списке
  static editTask(element) {
    {
      const listItem = element.parentElement;
      const text = listItem.querySelector('.text');
      const editInput = listItem.querySelector('.textField');
      const isEditing = text.classList.contains('d-none');

      if (isEditing) {
        text.innerText = editInput.value;
        element.innerText = 'Edit';
      } else {
        editInput.value = text.innerText;
        element.innerText = 'Save'
      }
      text.classList.toggle('d-none');
      editInput.classList.toggle('d-none');
    }
  }

  // изменяем статус задачи
  static statusTask(element) {
    const row = element.parentElement.parentElement;

    element.addEventListener('change', () => {
      switch (element.value) {
        case "1":
          row.classList.remove('table-warning');
          row.classList.remove('table-success');
          break;
        case "2":
          row.classList.remove('table-success');
          row.classList.add('table-warning');
          break;
        case "3":
          row.classList.remove('table-warning');
          row.classList.add('table-success');
          break;
      }
    })


  }

  // удаляем задачу
  static removeTask(element) {
    element.parentElement.parentElement.remove();
    const taskList = document.querySelector('tbody');
    const tasks = taskList.children;
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].querySelector('th').textContent = i + 1;
    }
  }

  //сортируем список по ключу
  static sortTasks(tasks) {
    const keyValue = document.querySelector('.select-sort');

    let key = '';
    switch (keyValue.value) {
      case "1":
        key = 'status';
        break;
      case "2":
        key = 'dueDate';
        break;

    }
    tasks.sort((a, b) => a[key] > b[key] ? 1 : -1);
  }

  // показываем оповещение
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`
    div.appendChild(document.createTextNode(message));

    const container = document.querySelector('.container');
    const form = document.querySelector('#task-form');
    container.insertBefore(div, form);

    setTimeout(() => {
      document.querySelector('.alert').remove()
    }, 2500);
  }
  // очищаем поля ввода 
  static clearFields() {
    document.querySelector('#task-text').value = '';
    document.querySelector('#dueDate').value = '';
  }
}

// Storage Class - работа с localStorage
class Store {
  //  получаем массив из localStorage
  static getTasks() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
      tasks = [];
    } else {
      tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
  }

  // добавляем задачу в массив 
  static addTask(task) {
    const tasks = Store.getTasks();
    tasks.push(task)

    localStorage.setItem('tasks', JSON.stringify(tasks))
  }

  //изменяем задачу в массиве
  static editTask(element, key) {
    const tasks = Store.getTasks();
    tasks.forEach((task) => {
      if (task.id === element.parentElement.parentElement.id) {
        task[key] = key==="status"? element.value: element.innerText;
      }
    })
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // удаляем задачу из массива 
  static removeTask(element) {
    const tasks = Store.getTasks();
    const id = element.parentElement.parentElement.id;
    tasks.forEach((task, index) => {
      if (task.id === id) {
        tasks.splice(index, 1)
      }
    })

    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}



// ~~~~~~~~~~~~~~~~~~~~~EVENTS - СОБЫТИЯ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// Event: display tasks - после загрузки, показываем список задач из localStorage
document.addEventListener('DOMContentLoaded', UI.displayTasks);



// Event: add Task - добавляем задачу из формы в список
document.querySelector('#task-form').addEventListener('submit', (evt) => {
  evt.preventDefault();

  // get form input - получаем данные из формы
  const text = document.querySelector('#task-text').value;
  const dueDate = document.querySelector('#dueDate').value;

  // Validation - проверка поля на заполненность
  if (text === '') {
    UI.showAlert('Please, fill the "Task" field', 'danger');
  } else {

    //Create new task - создаем новую задачу
    const taskItem = new Task(text, dueDate);

    // add task - добавляем задачу в список и в localStorage
    UI.addTasksToList(taskItem);
    Store.addTask(taskItem);

    //show successMessage - оповещение при успехе
    UI.showAlert('Task added', 'success');

    //clear input field
    UI.clearFields();
  }
})


// Events: remove/edit 
document.querySelector('tbody').addEventListener('click', (e) => {
  // remove Task - удаляем задачу из перечня и из localStorage
  if (e.target.classList.contains('delete')) {
    e.preventDefault();
    UI.removeTask(e.target);
    Store.removeTask(e.target);

    UI.showAlert('Task removed', 'sucsess')
  }

  // Event: edit Task - редактируем задачу в перечне и в localStorage
  if (e.target.classList.contains('edit-button')) {
    UI.editTask(e.target);
    Store.editTask(e.target.previousElementSibling, 'task');    
  }

  // event: edit Status - изменяем статус задачи
  if (e.target.classList.contains('custom-select')) {

    UI.statusTask(e.target);
    Store.editTask(e.target, "status");
  }
})

// event: sort Task
document.querySelector('.select-sort').addEventListener('change', () => {
  const list = document.querySelector('tbody').querySelectorAll('tr');
  list.forEach(item => item.remove())
  UI.displayTasks();

});