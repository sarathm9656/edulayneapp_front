import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const CourseInstructors = ({ courseId }) => {
  const [instructors, setInstructors] = useState([]);
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInstructors();
    fetchAvailableInstructors();
  }, [courseId]);

  const fetchInstructors = async () => {
    try {
      const response = await fetch(`${api_url}/courses/${courseId}/instructors`);
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      showSnackbar('Error fetching instructors', 'error');
    }
  };

  const fetchAvailableInstructors = async () => {
    try {
      const response = await fetch('/api/users?role=instructor');
      if (response.ok) {
        const data = await response.json();
        setAvailableInstructors(data.data);
      }
    } catch (error) {
      console.error('Error fetching available instructors:', error);
      showSnackbar('Error fetching available instructors', 'error');
    }
  };

  const handleAssignInstructors = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instructorIds: selectedInstructors.map(instructor => instructor._id)
        })
      });

      if (response.ok) {
        await fetchInstructors();
        setOpenDialog(false);
        setSelectedInstructors([]);
        showSnackbar('Instructors assigned successfully');
      }
    } catch (error) {
      console.error('Error assigning instructors:', error);
      showSnackbar('Error assigning instructors', 'error');
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/instructors/${instructorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchInstructors();
        showSnackbar('Instructor removed successfully');
      }
    } catch (error) {
      console.error('Error removing instructor:', error);
      showSnackbar('Error removing instructor', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Course Instructors</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Assign Instructors
        </Button>
      </Box>

      <Paper>
        <List>
          {instructors.map((instructor) => (
            <ListItem
              key={instructor._id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveInstructor(instructor._id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar src={instructor.profile_image}>
                  {instructor.first_name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${instructor.first_name} ${instructor.last_name}`}
                secondary={instructor.email}
              />
            </ListItem>
          ))}
          {instructors.length === 0 && (
            <ListItem>
              <ListItemText primary="No instructors assigned" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Instructors</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availableInstructors}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
            value={selectedInstructors}
            onChange={(event, newValue) => setSelectedInstructors(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Instructors"
                placeholder="Search instructors"
                margin="normal"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`${option.first_name} ${option.last_name}`}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignInstructors} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseInstructors; 