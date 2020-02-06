// Task Class: создает новую задачу 

class Task {
  constructor(task, startDate, dueDate, id) {
    this.task = task;
    this.startDate = startDate;
    this.dueDate = dueDate;
    this.status = "1";
    this.id = id;
  }
}
// UI Class: производит UI действия (добавить, удалить, изменить, показать оповещения и др.)
class UI {

  static showAndHideElement(selector) {
    document.querySelector(selector).classList.toggle('d-none');
  }

  // показываем задачи из localStorage
  static displayTasks() {
    const list = document.querySelector('tbody');
    list.innerHTML = "";
    const chart = document.querySelector('.chartData');
    chart.innerHTML = "";

    UI.drawChart();

    const tasks = Store.getTasks();
    UI.sortTasks(tasks);
    tasks.forEach((task) => {
      UI.addTasksToList(task);
    })
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
    <td class="taskText d-flex align-middle"><input type="text" class="textField task" value ='${task.task}'</td>
    <td class="text-center align-middle"><input type="date" class="date startDate" value='${task.startDate}'></td>
    <td class="text-center align-middle"><input type="date" class="date dueDate" value='${task.dueDate}'></td>
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




  static drawChart() {
    const daysScale = document.querySelector('.taskChart .days');
    const chartField = document.querySelector('.chartData');
    daysScale.innerHTML = '';
    chartField.innerHTML = '';

    const tasks = Store.getTasks();
    UI.sortTasks(tasks, 'startDate');

    const chartStartDate = tasks.length ? new Date(tasks[0].startDate) : new Date();
    const lastDay = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth() + 1, 0).getDate();
    for (let i = -1; i < 30; i++) {
      const dateCell = document.createElement('div');
      let day = chartStartDate.getDate() + i;
      if (day > lastDay) {
        day -= lastDay
      }
      if (day < 1) {
        day = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), day).getDate();
      }
      dateCell.classList.add("day", 'border', 'border-primary');
      dateCell.innerHTML = day;
      daysScale.appendChild(dateCell);
    }

    tasks.forEach(task => drawTaskOnChart(task));


    // отрисовываем таск на графике
    function drawTaskOnChart(task) {

      const chartRow = document.createElement('div');
      const dayWidth = document.querySelector('.day').getBoundingClientRect().width;

      const taskStart = ((new Date(task.startDate).getTime() - (new Date(chartStartDate).getTime()) + 1000 * 3600 * 24) / (1000 * 3600 * 24)) * dayWidth;
      const taskDuration = ((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 3600 * 24)) * dayWidth;

      chartRow.innerHTML = `
    <div class="taskName border border-primary">${task.task}</div>
    <div class="taskDates ">
      <div class="timeBlock bg-primary" style="left: ${taskStart}px; width: ${taskDuration}px">
        <div class="left"></div>
        <div class="right"></div>
      </div>
    </div>`
      chartRow.classList.add('d-flex', 'mt-1', 'taskRow', 'border');
      chartField.appendChild(chartRow);
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
  static sortTasks(tasks, key) {
    if (!key) {
      const keyValue = document.querySelector('.select-sort');

      switch (keyValue.value) {
        case "1":
          key = 'status';
          break;
        case "2":
          key = 'dueDate';
          break;
        case "3":
          key = 'startDate';
          break;
      }
    }
    tasks.sort((a, b) => a[key] > b[key] ? 1 : -1);
  }

  // показываем оповещение
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`
    div.appendChild(document.createTextNode(message));

    const container = document.querySelector('.container');
    const buttons = document.querySelector('.buttons');
    container.insertBefore(div, buttons);

    setTimeout(() => {
      document.querySelector('.alert').remove()
    }, 2500);
  }
  // очищаем поля ввода 
  static clearFields() {
    document.querySelector('#task-text').value = '';
    document.querySelector('#startDate').value = '';
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
      try {
        tasks = JSON.parse(localStorage.getItem('tasks'));
      } catch (e) {
        console.log('!!!Невозможно прочитать файл. ', e)
        tasks = [];
      }
    }
    return tasks;
  }

  // добавляем задачу в массив 
  static setTask(task) {
    const tasks = Store.getTasks();
    tasks.push(task)

    localStorage.setItem('tasks', JSON.stringify(tasks))
  }

  //изменяем задачу в массиве
  static editTask(key, value, id) {
    const tasks = Store.getTasks();
    const task = tasks.find(task => task.id === id);
    if (task === undefined) return;
    task[key] = value;
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // удаляем задачу из массива 
  static removeTask(id) {
    const tasks = Store.getTasks();
    const taskToDeleteIndex = tasks.findIndex(task => task.id === id);
    if (taskToDeleteIndex !== -1) {
      tasks.splice(taskToDeleteIndex, 1)
    }


    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}



// ~~~~~~~~~~~~~~~~~~~~~EVENTS - СОБЫТИЯ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// Event: display tasks - после загрузки страницы, показываем список задач из localStorage
document.addEventListener('DOMContentLoaded', UI.displayTasks);


// event: show/hide table or chart
document.querySelector('#showTableBtn').addEventListener('click', () => {
  UI.showAndHideElement('tbody');
})
document.querySelector('#showChartBtn').addEventListener('click', () => {
  UI.showAndHideElement('.chartData');

})

// Event: add Task - добавляем задачу из формы в список
document.querySelector('#task-form').addEventListener('submit', (evt) => {
  evt.preventDefault();

  // get form input - получаем данные из формы
  const text = document.querySelector('#task-text').value;
  const startDate = document.querySelector('#startDate').value;
  const dueDate = document.querySelector('#dueDate').value;

  // Validation - проверка поля на заполненность
  if (text === '') {
    UI.showAlert('Please, fill the "Task" field', 'danger');
  } else {

    //Create new task - создаем новую задачу
    const taskItem = new Task(text, startDate, dueDate);

    // add task - добавляем задачу в список и в localStorage
    UI.addTasksToList(taskItem);
    Store.setTask(taskItem);

    UI.drawChart();

    //show successMessage - оповещение при успехе
    UI.showAlert('Task added', 'success');

    //clear input field
    UI.clearFields();
  }
})


// Events: remove/edit tasks
document.querySelector('tbody').addEventListener('click', (e) => {

  const isDeleteButton = e.target.classList.contains('delete');
  const isTextField = e.target.classList.contains('textField');
  const isDueDate = e.target.classList.contains('dueDate');
  const isStartDate = e.target.classList.contains('startDate');
  const isStatus = e.target.classList.contains('custom-select');


  if (isDeleteButton) { // remove Task - удаляем задачу из перечня и из localStorage
    e.preventDefault();
    UI.removeTask(e.target);
    Store.removeTask(e.target.parentElement.parentElement.id);
    UI.drawChart();

  } else if (isTextField) { // edit Task - редактируем задачу в перечне и в localStorage
    e.target.addEventListener('change', () => {
      Store.editTask('task', e.target.value, e.target.parentElement.parentElement.id);
      UI.drawChart();
    })
  } else if (isStartDate) {
    e.target.addEventListener('change', () => {
      Store.editTask('startDate', e.target.value, e.target.parentElement.parentElement.id);
      UI.drawChart();
    })
  } else if (isDueDate) {
    e.target.addEventListener('change', () => {
      Store.editTask('dueDate', e.target.value, e.target.parentElement.parentElement.id);
      UI.drawChart();
    })
  } else if (isStatus) {
    UI.statusTask(e.target);
    Store.editTask("status", e.target.value, e.target.parentElement.parentElement.id);
  }
})

// event: sort Task
document.querySelector('.select-sort').addEventListener('change', () => {
  UI.displayTasks();

});