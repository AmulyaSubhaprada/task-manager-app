import { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import Header from '../components/Header';
import AddTaskModal from '../components/AddTaskModal';
import { Search, Plus, Edit, Trash2, ArrowBigRightDash, ArrowBigLeftDash, Inbox } from 'lucide-react';
import { IconButton } from '@mui/material';
import AlertDialogeBox from '../components/AlertDialogeBox';
import toast from 'react-hot-toast';

export default function Home({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || []); 
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [editData, setEditData] = useState();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState();
  const rowsPerPage = 20;

  // Define the priority order
  const priorityOrder = ['high', 'medium', 'low'];

  // Fetch tasks from local storage
  const fetchTasks = useCallback(() => {
    setLoading(true);
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
    // Filter tasks based on search term across multiple fields
    const filteredTasks = storedTasks.filter(task => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTermLower) ||
        task.description.toLowerCase().includes(searchTermLower) ||
        task.priority.toLowerCase().includes(searchTermLower) ||
        (task.completed ? "completed" : "ongoing").includes(searchTermLower)
      );
    });
  
    // Sort tasks by priority
    const sortedTasks = filteredTasks.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });
  
    const paginatedTasks = sortedTasks.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    setTasks(paginatedTasks);
    setLoading(false);
  }, [searchTerm, page, rowsPerPage]);

  // Debounced fetch function
  const debouncedFetchTasks = useCallback(
    _.debounce(fetchTasks, 300),
    [fetchTasks]
  );

  // Effect to fetch tasks on initial load and when searchTerm changes
  useEffect(() => {
    debouncedFetchTasks();
    return debouncedFetchTasks.cancel; 
  }, [debouncedFetchTasks]);

  const handleDeleteTask = (taskId) => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = storedTasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    toast.success("Task deleted successfully ");
    fetchTasks();
  };

  const handleDeleteTasks = (taskId) => {
    setOpenDialog(true);
    setDeleteTaskId(taskId);
  };

  const deleteConform = () => {
    handleDeleteTask(deleteTaskId);
  };

  //  pagination
  const handleChangePage = (direction) => {
    if (direction === 'next') setPage(page + 1);
    if (direction === 'prev' && page > 0) setPage(page - 1);
  };

  const handleEditModal = (task) => {
    setEditData(task);
    toggleModal();
  };

  const handleAddClick = () => {
    setEditData('');
    toggleModal();
  };

  const toggleModal = () => setOpenModal(!openModal);

  // Toggle completed status of a task
  const handleToggleCompleted = (taskId) => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = storedTasks.map(task => {
      if (task.id === taskId) {
        return { 
            ...task, 
            completed: !task.completed, 
            priority: !task.completed ? 'low' : task.priority 
        };
      }
      return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    toast.success("Task status updated successfully");
    fetchTasks();
  };

  const [darkMode, setDarkMode] = useState(false);

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "darkmode" : "lightmode"}>
      <Header handleToggleTheme={handleToggleTheme} darkMode={darkMode} />
      <div className='main-container'>
        <div className="search-add-container">
          <div className='search-container' style={{ border: darkMode ? "1px solid #FFFF" : null }}>
            <input
              type="text"
              placeholder="Search Tasks"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ color: darkMode ? "#FFFF" : null }}
            />
            <Search />
          </div>
          <button className="add-task-btn" onClick={handleAddClick}>
            <Plus /> Add Task
          </button>
        </div>

        {/* Task Table */}
        <table className={`task-table ${darkMode ? "dark-task-table" : null}`}>
          <thead>
            <tr>
              <th>SL</th>
              <th>Task Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Show skeletal loading 
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="5">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : tasks.length > 0 ? (
              tasks.map((task,index) => (
                <tr key={task.id} className={`priority-${task.priority}`}>
                  <td className='table-data'>
                    <input type="checkbox" checked={task.completed} disabled />
                    {index+1}</td>
                  <td>{task.title}</td>
                  <td className='table-data'>{task.description}</td>
                  <td className='table-data'>
                    <span onClick={() => handleToggleCompleted(task.id)} style={{ cursor: 'pointer', color: task.completed ? 'green' : 'red' }}>
                      {task.completed ? "Completed" : "Ongoing"}
                    </span>
                  </td>
                  <td className='table-data'>{task.priority}</td>
                  <td className='table-data'>
                    <IconButton color="primary" onClick={() => handleEditModal(task)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteTasks(task.id)}>
                      <Trash2 />
                    </IconButton>
                  </td>
                </tr>
              ))
            ) : (
              // Show message if no tasks are available
              <tr>
                <td></td>
                <td colSpan="5" className="no-tasks-message">
                  <Inbox />
                  No tasks available. Please add tasks to display.
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => handleChangePage('prev')}>
            <ArrowBigLeftDash />Previous</button>
          <button onClick={() => handleChangePage('next')}>Next<ArrowBigRightDash /></button>
        </div>
      </div>

      <AddTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        fetchTasks={fetchTasks}
        taskToEdit={editData}
      />
      <AlertDialogeBox
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        deleteConform={deleteConform}
      />
    </div>
  );
}


export async function getServerSideProps() {
 
  const initialTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', priority: 'high', completed: false },
    { id: 2, title: 'Task 2', description: 'Description 2', priority: 'medium', completed: false },
    
  ];

  return {
    props: {
      initialTasks, 
    },
  };
}
