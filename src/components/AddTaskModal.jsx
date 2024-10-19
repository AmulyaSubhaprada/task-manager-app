import { useState, useEffect } from 'react';
import { Box, Modal, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import toast from 'react-hot-toast';

const AddTaskModal = ({ open, onClose, fetchTasks, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [completed, setCompleted] = useState(false); 
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setCompleted(taskToEdit.completed || false); 
    } else {
      setTitle('');
      setDescription('');
      setPriority('low');
      setCompleted(false); 
    }
  }, [taskToEdit]);

  const handleSaveTask = () => {
    setLoading(true);
    
    const taskData = {
      title,
      description,
      priority:priority, 
      completed,
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    if (taskToEdit) {
      // Edit task logic
      tasks = tasks.map(task => 
        task.id === taskToEdit.id ? { ...task, ...taskData } : task
      );
    } else {
      // Add task logic
      const newTask = { ...taskData, id: Date.now() }; // Generate a unique ID
      tasks.push(newTask);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    setLoading(false);
    toast.success(`Task ${taskToEdit ? "edited" : "added"} Successfully`);
    onClose();
    fetchTasks(); 
    setTitle('');
    setDescription('');
    setPriority('low');
    setCompleted(false); 
  };

  const handleCancel=()=>{
    onClose();
    setTitle('');
    setDescription('');
    setPriority('low');
    setCompleted(false); 
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <h2>{taskToEdit ? 'Edit Task' : 'Add Task'}</h2>
        <TextField
          fullWidth
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={handleSaveTask} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Saving...' : taskToEdit ? 'Save Task' : 'Add Task'}
          </Button>
          <Button onClick={handleCancel} variant="outlined" color="error">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
