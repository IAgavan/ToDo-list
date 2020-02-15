 // масштабы графика
 let currentScale = 8;


 // Task Class: создает новую задачу 

 class Task {
   constructor(task, startDate, dueDate, id) {
     this.task = task;
     this.startDate = startDate;
     this.dueDate = dueDate;
     this.status = "1-In progress";
     this.id = id;
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

 // UI Class: производит UI действия (добавить, удалить, изменить, показать оповещения и др.)
 class UI {

   // показываем задачи из localStorage
   static displayTasks(key) {

     const list = document.querySelector('tbody');
     list.innerHTML = "";
     const chartTasks = document.querySelector('.tasksInChartData');
     chartTasks.innerHTML = "";
     const chartTiming = document.querySelector('.timingChartData');
     chartTiming.innerHTML = "";

     const tasks = Store.getTasks();
     UI.sortTasks(tasks, key);
     tasks.forEach((task) => {
       UI.addTasksToList(task);

     })

     UI.drawChart();
   }

   // добавляем задачу в список задач 
   static addTasksToList(task) {
     const taskList = document.querySelector('tbody');
     const tasks = taskList.children;
     const number = tasks.length + 1;
     const row = document.createElement('tr');


     // создаем уникальный ID для задачи, если его нет
     if (!task.id) {
       const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
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
    <td class="text-center align-middle"><input type="date" class="date startDate" value='${task.startDate}' max= '${task.dueDate}'></td>
    <td class="text-center align-middle"><input type="date" class="date dueDate" value='${task.dueDate}' min = '${task.startDate}'></td>
    <td class="text-center align-middle">
      <select class="custom-select custom-select-sm w-75 px-1">
        <option value="1-In progress">In progress</option>
        <option value="2-Pending">Pending</option>
        <option value="3-Finished">Finished</option>
      </select>
    </td>
    <td class="text-center align-middle"><a href="" class="btn btn-primary btn-sm delete">X</a></td>
    `;

     // навешиваем слушатели на соответствующие элементы
     const deleteButton = row.querySelector('.delete');
     const textField = row.querySelector('.textField');
     const dueDate = row.querySelector('.dueDate');
     const startDate = row.querySelector('.startDate');
     const statusSelector = row.querySelector('.custom-select');


     deleteButton.addEventListener('click', (e) => {
       e.preventDefault();
       UI.removeTask(e.target);
       Store.removeTask(e.target.parentElement.parentElement.id);
       UI.drawChart();
     });

     textField.addEventListener('change', (e) => {
       Store.editTask('task', e.target.value, e.target.parentElement.parentElement.id);
       UI.drawChart();
     });

     startDate.addEventListener('change', (e) => {
       if (startDate.value > dueDate.value) {
         startDate.value = dueDate.value;
         UI.showAlert('Startdate should be erlier than enddate', 'danger')
       } else {
         dueDate.min = startDate.value;
         Store.editTask('startDate', startDate.value, startDate.parentElement.parentElement.id);
         UI.drawChart();
       }
     })

     dueDate.addEventListener('change', (e) => {
       if (startDate.value > dueDate.value) {
         dueDate.value = startDate.value;
         UI.showAlert('Duedate should be later than startdate', 'danger')
       } else {
         startDate.max = dueDate.value;
         Store.editTask('dueDate', e.target.value, e.target.parentElement.parentElement.id);
         UI.drawChart();
       }
     });

     statusSelector.addEventListener('change', (e) => {
       switch (statusSelector.value) {
         case "1-In progress":
           row.classList.remove('table-warning');
           row.classList.remove('table-success');
           break;
         case "2-Pending":
           row.classList.remove('table-success');
           row.classList.add('table-warning');
           break;
         case "3-Finished":
           row.classList.remove('table-warning');
           row.classList.add('table-success');
           break;
       }
       Store.editTask("status", e.target.value, e.target.parentElement.parentElement.id);
     })

     //проверяем статус задачи
     statusSelector.value = task.status;
     switch (statusSelector.value) {
       case "2-Pending":
         row.classList.add('table-warning');
         break;
       case "3-Finished":
         row.classList.add('table-success');
         break;
     }
     taskList.appendChild(row);
   }


   static drawChart() {
     const minDayWidth = 5; //px
     const daysScale = document.querySelector('.days');
     const chartField = document.querySelector('.timingChartData');
     const chartTasks = document.querySelector('.tasksInChartData');
     daysScale.innerHTML = '';
     chartField.innerHTML = '';
     chartTasks.innerHTML = '';

     const tasks = Store.getTasks();
     UI.sortTasks(tasks, 'startDate');

     const chartStartDate = tasks.length ? new Date(tasks[0].startDate) : new Date();
     this.minDate = chartStartDate;
     const maxDate = tasks.reduce((prev, cur) => cur.dueDate > prev.dueDate ? cur : prev, {
       dueDate: '1970-01-01'
     });
     const oneDayInMs = 1000 * 3600 * 24;

     const totalDuration = (new Date(maxDate.dueDate) - chartStartDate) / oneDayInMs; // в днях
     while (totalDuration * minDayWidth * currentScale + 3 * minDayWidth * currentScale > daysScale.getBoundingClientRect().width) {
       currentScale--;
       if (currentScale == 1) {
         break
       }
     }


     const maxDaysOnScreen = Math.floor(daysScale.getBoundingClientRect().width / (currentScale * minDayWidth));
     const daysOnScreen = Math.max(totalDuration + 2, totalDuration + (maxDaysOnScreen - totalDuration) - 1);



     for (let i = -1; i < daysOnScreen; i++) {
       const dateCell = document.createElement('div');
       let day = chartStartDate.getDate() + i;
       day = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth(), day);

       if (day.getDay() == 0 || day.getDay() == 6) {
         dateCell.classList.add('table-warning');
       }
       dateCell.classList.add("day", 'border', 'border-primary', 'py-1');
       dateCell.style.width = currentScale * minDayWidth + 'px';

       // dateCell.innerHTML = day.toLocaleDateString('en-Gb', {
       //   month: 'short',
       //   day: 'numeric'
       // });
       daysScale.appendChild(dateCell);
     }
     tasks.forEach(task => drawTaskOnChart(task));


     // отрисовываем таск на графике
     function drawTaskOnChart(task) {
       const chartRowTaskName = document.createElement('div');
       const chartRowtaskTiming = document.createElement('div');
       const dayWidth = document.querySelector('.day').getBoundingClientRect().width;

       const taskStart = ((new Date(task.startDate).getTime() - UI.minDate.getTime()) + oneDayInMs) / oneDayInMs * dayWidth;
       const taskDuration = ((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / oneDayInMs) * dayWidth + dayWidth;

       chartRowTaskName.innerHTML = `
        <div class="taskName border border-primary px-1">${task.task}</div>`
       chartRowtaskTiming.innerHTML = `
        <div class="taskDates w-100">
          <div class="timeBlock bg-primary" id="${task.id+'time'}" style="left: ${taskStart}px; width: ${taskDuration}px">
            <div class="left"></div>
            <div class="right"></div>
          </div>
        </div>`

       chartRowTaskName.classList.add('d-flex', 'mt-1', 'taskRow');
       chartRowtaskTiming.classList.add('d-flex', 'mt-1', 'taskRow');

       chartTasks.appendChild(chartRowTaskName);
       chartField.appendChild(chartRowtaskTiming);

       const resizedBox = chartRowtaskTiming.querySelector('.timeBlock');
       const leftResizer = resizedBox.querySelector('.left');
       const rightResizer = resizedBox.querySelector('.right');

       resizedBox.addEventListener('mousedown', UI.moveBlock);
       leftResizer.addEventListener('mousedown', UI.resizeBlock);
       rightResizer.addEventListener('mousedown', UI.resizeBlock);
     }

     currentScale = 8;
   }

   static moveBlock(e) {
     if (e.target.classList.contains('left') || e.target.classList.contains('right')) {
       return
     }
     e.preventDefault();
     const resizedBox = e.target;
     const bar = resizedBox.parentElement.getBoundingClientRect();

     window.addEventListener('mousemove', mousemove);
     window.addEventListener('mouseup', mouseup);
     e.target.parentElement.addEventListener('mouseout', mouseup)
     let prevX = e.clientX;

     function mousemove(e) {
       const nextX = prevX - e.clientX;
       const box = resizedBox.getBoundingClientRect();
       resizedBox.style.left = (box.left - bar.left) - nextX + 'px';
       if (box.left < bar.left) {
         resizedBox.style.left = 0 + 'px'
       }
       if (box.right > bar.right) {
         resizedBox.style.left = bar.right - bar.left - (box.width) + 'px'
       }
       prevX = e.clientX;
     }

     function mouseup() {
       //округляем до полудня     
       const dayWidth = document.querySelector('.day').getBoundingClientRect().width;
       const box = resizedBox.getBoundingClientRect();
       const gap = (box.left - bar.left) % dayWidth;
       const left = (box.left - bar.left) - (gap > dayWidth / 2 ? (gap - dayWidth / 2) : gap);
       resizedBox.style.left = left + 'px';

       UI.changeTiming(resizedBox);

       window.removeEventListener('mousemove', mousemove);
       window.removeEventListener('mouseup', mouseup);
       resizedBox.parentElement.removeEventListener('mouseout', mouseup)

       UI.drawChart()
     }
   }

   static resizeBlock(e) {
     e.preventDefault();
     const element = e.target
     const resizedBox = element.parentElement;
     const bar = resizedBox.parentElement.getBoundingClientRect();

     window.addEventListener('mousemove', mousemove);
     window.addEventListener('mouseup', mouseup);
     let prevX = e.clientX;

     function mousemove(e) {
       const nextX = prevX - e.clientX;
       const box = resizedBox.getBoundingClientRect();
       if (element.classList.contains('left')) {
         resizedBox.style.left = (box.left - bar.left) - nextX + 'px';
         if (box.left < bar.left) {
           resizedBox.style.left = 0 + 'px'
         }
         prevX = e.clientX;
         resizedBox.style.width = box.width + nextX + 'px';
       } else {
         if (box.right > bar.right) {
           resizedBox.style.left = bar.right - bar.left - (box.width) + 'px'
         }
         prevX = e.clientX;
         resizedBox.style.width = box.width - nextX + 'px';
       }
     }

     function mouseup() {
       //округляем до полудня

       const dayWidth = document.querySelector('.day').getBoundingClientRect().width;
       const box = resizedBox.getBoundingClientRect();

       const gap = (box.left - bar.left) % dayWidth;
       const left = (box.left - bar.left) - (gap > dayWidth / 2 ? (gap - dayWidth / 2) : gap);

       const width = box.width + (gap > dayWidth / 2 ? (gap - dayWidth / 2) : gap);

       resizedBox.style.left = left + 'px';
       resizedBox.style.width = width + 'px'

       UI.changeTiming(resizedBox);

       window.removeEventListener('mousemove', mousemove);
       window.removeEventListener('mouseup', mouseup);
       resizedBox.parentElement.removeEventListener('mouseout', mouseup)

       UI.drawChart()
     }
   }
   // изменяем время задачи от  размера и положения блока 
   static changeTiming(resizedBox) {
     const dayWidth = document.querySelector('.day').getBoundingClientRect().width;
     const bar = resizedBox.parentElement.getBoundingClientRect();
     const oneDayInMs = 1000 * 3600 * 24;
     const box = resizedBox.getBoundingClientRect()

     const newStartDate = (((box.left - bar.left) / dayWidth) * oneDayInMs) - oneDayInMs + UI.minDate.getTime()
     const newEndDate = ((box.right - bar.left) / dayWidth) * oneDayInMs - 1.5 * oneDayInMs + UI.minDate.getTime()

     function dateForValue(date) {
       const year = date.getFullYear()
       let month = date.getMonth() + 1;
       if (month <= 9) {
         month = '0' + month;
       }
       let day = date.getDate();
       if (day <= 9) {
         day = '0' + day;
       }
       return `${year}-${month}-${day}`
     }

     const changeTaskId = resizedBox.id.slice(0, -4)
     const startDateInput = document.querySelector(`#${changeTaskId}`).querySelector('.startDate');
     const endDateInput = document.querySelector(`#${changeTaskId}`).querySelector('.dueDate');

     startDateInput.value = dateForValue(new Date(newStartDate));
     endDateInput.value = dateForValue(new Date(newEndDate));

     Store.editTask('startDate', startDateInput.value, changeTaskId);
     Store.editTask('dueDate', endDateInput.value, changeTaskId);
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
     key = key ? key : 'startDate';
     tasks.sort((a, b) => a[key] > b[key] ? 1 : -1);
   }

   // показываем оповещение
   static showAlert(message, className) {
     const div = document.createElement('div');
     div.className = `alert alert-${className} w-50`
     div.appendChild(document.createTextNode(message));
     const container = document.querySelector('.container');
     container.parentElement.appendChild(div);

     window.addEventListener('click', () => div.classList.add('d-none'), {
       once: true
     })

     setTimeout(() => {
       window.removeEventListener('click', () => div.classList.add('d-none'), {
         once: true
       })
       div.remove()
     }, 5000)

   }
   // очищаем поля ввода 
   static clearFields() {
     document.querySelector('#task-text').value = '';
     document.querySelector('#startDate').value = '';
     document.querySelector('#startDate').max = '';
     document.querySelector('#dueDate').value = '';
     document.querySelector('#dueDate').min = '';
   }
 }





 // ~~~~~~~~~~~~~~~~~~~~~EVENTS - СОБЫТИЯ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 // ограничение дат инпута
 document.querySelector('#startDate').addEventListener('input', (e) => {
   const dueDate = document.querySelector('#dueDate')
   dueDate.min = e.target.value;
 })
 document.querySelector('#dueDate').addEventListener('input', (e) => {
   const startDate = document.querySelector('#startDate');
   startDate.max = e.target.value
 })


 // Event: display tasks - после загрузки страницы, показываем список задач из localStorage
 document.addEventListener('DOMContentLoaded', UI.displayTasks);


 // Event: add Task - добавляем задачу из формы в список
 document.querySelector('#task-form').addEventListener('submit', (evt) => {
   evt.preventDefault();

   // get form input - получаем данные из формы
   const text = document.querySelector('#task-text').value;
   const startDate = document.querySelector('#startDate').value;
   const dueDate = document.querySelector('#dueDate').value;

   // Validation - проверка поля на заполненность
   if (text === '' || startDate === '' || dueDate === '') {
     UI.showAlert('Please, fill all fields', 'danger');
   } else if (startDate > dueDate) {
     UI.showAlert('Duedate should be later than startdate', 'danger')
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

 // events: sort Tasks

 document.querySelector('#statusColumn').addEventListener('click', () => {
   UI.displayTasks('status')
 })
 document.querySelector('#startDateColumn').addEventListener('click', () => {
   UI.displayTasks('startDate')
 })
 document.querySelector('#dueDateColumn').addEventListener('click', () => {
   UI.displayTasks('dueDate')
 })