// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const taskCountElement = document.getElementById('task-count');

    // --- Application State ---
    // Load tasks from Local Storage or initialize an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- Core Functions ---

    /**
     * Saves the current tasks array to Local Storage.
     */
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    /**
     * Updates the displayed task count.
     */
    const updateTaskCount = () => {
        const pendingTasks = tasks.filter(task => !task.completed).length;
        if (taskCountElement) {
            taskCountElement.textContent = pendingTasks === 1 ? '1 task remaining' : `${pendingTasks} tasks remaining`;
        }
    };

    /**
     * Toggles the visibility of the empty state message based on task presence.
     */
    const updateEmptyState = () => {
        if (tasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            taskList.classList.remove('hidden');
        }
    };

    /**
     * Renders a single task item to the DOM.
     * @param {object} task - The task object to render.
     */
    const renderTask = (task) => {
        const listItem = document.createElement('li');
        listItem.dataset.taskId = task.id;
        listItem.className = `flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-3 transition-all duration-300 ease-in-out transform hover:shadow-lg ${task.completed ? 'completed-task' : ''}`;
        if (task.completed) {
            listItem.classList.add('opacity-60');
        }

        // Checkbox for completing task
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'form-checkbox h-6 w-6 text-blue-500 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors duration-200';
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        // Task text
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskText.className = `flex-grow mx-4 text-gray-700 dark:text-gray-200 ${task.completed ? 'line-through' : ''}`;

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600';
        deleteButton.innerHTML = '<i data-lucide="trash-2" class="w-5 h-5"></i>'; // Lucide icon for delete
        deleteButton.setAttribute('aria-label', 'Delete task');
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex items-center space-x-3';
        controlsDiv.appendChild(checkbox);
        controlsDiv.appendChild(taskText);

        listItem.appendChild(controlsDiv);
        listItem.appendChild(deleteButton);

        // Add a subtle animation class for new items
        listItem.classList.add('task-enter-active');
        setTimeout(() => listItem.classList.remove('task-enter-active'), 500); // Remove after animation

        return listItem;
    };

    /**
     * Renders the entire list of tasks to the DOM.
     * Clears existing tasks and re-renders from the `tasks` array.
     */
    const renderTaskList = () => {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const listItem = renderTask(task);
            taskList.appendChild(listItem);
        });
        updateEmptyState();
        updateTaskCount();
        if (window.lucide) {
            window.lucide.createIcons(); // Re-initialize Lucide icons
        }
    };

    /**
     * Adds a new task to the list.
     * @param {Event} event - The form submission event.
     */
    const handleAddTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            // Provide visual feedback for empty input
            taskInput.classList.add('border-red-500', 'animate-shake');
            taskInput.focus();
            setTimeout(() => {
                taskInput.classList.remove('border-red-500', 'animate-shake');
            }, 800);
            return;
        }

        const newTask = {
            id: Date.now(), // Simple unique ID
            text: taskText,
            completed: false
        };

        tasks.unshift(newTask); // Add to the beginning of the array for newest first
        saveTasks();
        renderTaskList();
        taskInput.value = ''; // Clear input field
        taskInput.focus(); // Set focus back to input
    };

    /**
     * Toggles the completion status of a task.
     * @param {number} taskId - The ID of the task to toggle.
     */
    const toggleTaskCompletion = (taskId) => {
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTaskList(); // Re-render to update visual state
    };

    /**
     * Deletes a task from the list.
     * @param {number} taskId - The ID of the task to delete.
     */
    const deleteTask = (taskId) => {
        const taskElement = taskList.querySelector(`li[data-task-id='${taskId}']`);
        if (taskElement) {
            taskElement.classList.add('task-exit-active'); // Add animation class
            // Wait for animation to complete before removing from data and re-rendering
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTaskList(); 
            }, 300); // Match animation duration
        } else {
            // Fallback if element not found (should not happen in normal flow)
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTaskList();
        }
    };

    // --- Event Listeners ---
    if (taskForm) {
        taskForm.addEventListener('submit', handleAddTask);
    }

    // --- Initial Render ---
    renderTaskList(); // Render tasks on page load
});
