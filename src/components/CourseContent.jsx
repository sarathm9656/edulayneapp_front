import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";

const CourseContent = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentModule, setCurrentModule] = useState({
    module_title: "",
    module_description: "",
    display_order: 1,
  });
  const [currentLesson, setCurrentLesson] = useState({
    lesson_title: "",
    lesson_type_id: "",
    description: "",
    video_url: "",
    lesson_duration: 0,
    is_downloadable: false,
    is_preview: false,
    display_order: 1,
  });
  const [lessonTypes, setLessonTypes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchModules();
    fetchLessonTypes();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api_url}/courses/${courseId}/modules`);
      setModules(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch modules");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to fetch modules",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonTypes = async () => {
    try {
      const response = await axios.get("/api/lesson-types");
      setLessonTypes(response.data.data);
    } catch (err) {
      setError("Failed to fetch lesson types");
    }
  };

  const validateModule = () => {
    const errors = {};
    if (!currentModule.module_title?.trim()) {
      errors.module_title = "Module title is required";
    } else if (currentModule.module_title.length < 3 || currentModule.module_title.length > 100) {
      errors.module_title = "Module title must be between 3 and 100 characters";
    }

    if (!currentModule.module_description?.trim()) {
      errors.module_description = "Module description is required";
    } else if (currentModule.module_description.length < 10) {
      errors.module_description = "Module description must be at least 10 characters long";
    }

    if (currentModule.display_order < 1) {
      errors.display_order = "Display order must be a positive number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLesson = () => {
    const errors = {};
    if (!currentLesson.lesson_title?.trim()) {
      errors.lesson_title = "Lesson title is required";
    } else if (currentLesson.lesson_title.length < 3 || currentLesson.lesson_title.length > 100) {
      errors.lesson_title = "Lesson title must be between 3 and 100 characters";
    }

    if (!currentLesson.lesson_type_id) {
      errors.lesson_type_id = "Lesson type is required";
    }

    if (!currentLesson.description?.trim()) {
      errors.description = "Description is required";
    } else if (currentLesson.description.length < 10) {
      errors.description = "Description must be at least 10 characters long";
    }

    if (currentLesson.lesson_type_id === "video" && !currentLesson.video_url?.trim()) {
      errors.video_url = "Video URL is required for video lessons";
    }

    if (currentLesson.lesson_duration < 0) {
      errors.lesson_duration = "Duration must be a non-negative number";
    }

    if (currentLesson.display_order < 1) {
      errors.display_order = "Display order must be a positive number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    
    if (!validateModule()) {
      setSnackbar({
        open: true,
        message: "Please fix the validation errors",
        severity: "error",
      });
      return;
    }

    try {
      const moduleData = {
        ...currentModule,
        course_id: courseId,
      };

      if (currentModule._id) {
        await axios.put(`/api/courses/${courseId}/modules/${currentModule._id}`, moduleData);
        setSnackbar({
          open: true,
          message: "Module updated successfully",
          severity: "success",
        });
      } else {
        await axios.post(`/api/courses/${courseId}/modules`, moduleData);
        setSnackbar({
          open: true,
          message: "Module created successfully",
          severity: "success",
        });
      }

      setOpenModuleDialog(false);
      fetchModules();
      resetModuleForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save module";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    if (!validateLesson()) {
      setSnackbar({
        open: true,
        message: "Please fix the validation errors",
        severity: "error",
      });
      return;
    }

    try {
      const lessonData = {
        ...currentLesson,
        module_id: selectedModule._id,
      };

      if (currentLesson._id) {
        await axios.put(
          `/api/courses/${courseId}/modules/${selectedModule._id}/lessons/${currentLesson._id}`,
          lessonData
        );
        setSnackbar({
          open: true,
          message: "Lesson updated successfully",
          severity: "success",
        });
      } else {
        await axios.post(
          `/api/courses/${courseId}/modules/${selectedModule._id}/lessons`,
          lessonData
        );
        setSnackbar({
          open: true,
          message: "Lesson created successfully",
          severity: "success",
        });
      }

      setOpenLessonDialog(false);
      fetchModules();
      resetLessonForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save lesson";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleEditModule = (module) => {
    setCurrentModule(module);
    setOpenModuleDialog(true);
  };

  const handleEditLesson = (module, lesson) => {
    setSelectedModule(module);
    setCurrentLesson(lesson);
    setOpenLessonDialog(true);
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module? This will also delete all lessons in this module.")) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}/modules/${moduleId}`);
      setSnackbar({
        open: true,
        message: "Module deleted successfully",
        severity: "success",
      });
      fetchModules();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete module",
        severity: "error",
      });
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      setSnackbar({
        open: true,
        message: "Lesson deleted successfully",
        severity: "success",
      });
      fetchModules();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete lesson",
        severity: "error",
      });
    }
  };

  const resetModuleForm = () => {
    setCurrentModule({
      module_title: "",
      module_description: "",
      display_order: 1,
    });
    setValidationErrors({});
  };

  const resetLessonForm = () => {
    setCurrentLesson({
      lesson_title: "",
      lesson_type_id: "",
      description: "",
      video_url: "",
      lesson_duration: 0,
      is_downloadable: false,
      is_preview: false,
      display_order: 1,
    });
    setValidationErrors({});
  };

  const getLessonTypeIcon = (typeId) => {
    const type = lessonTypes.find(t => t._id === typeId);
    switch (type?.name?.toLowerCase()) {
      case "video":
        return <VideoLibraryIcon />;
      case "document":
        return <DescriptionIcon />;
      case "quiz":
        return <QuizIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Course Content
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            resetModuleForm();
            setOpenModuleDialog(true);
          }}
        >
          Add Module
        </Button>
      </Box>

      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} key={module._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {module.module_title}
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {module.module_description}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Edit Module">
                      <IconButton onClick={() => handleEditModule(module)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Module">
                      <IconButton onClick={() => handleDeleteModule(module._id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Lesson">
                      <IconButton
                        onClick={() => {
                          setSelectedModule(module);
                          resetLessonForm();
                          setOpenLessonDialog(true);
                        }}
                        size="small"
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {module.lessons?.map((lesson) => (
                    <Grid item xs={12} md={6} lg={4} key={lesson._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box display="flex" alignItems="center" gap={1}>
                              {getLessonTypeIcon(lesson.lesson_type_id)}
                              <Typography variant="subtitle1">
                                {lesson.lesson_title}
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title="Edit Lesson">
                                <IconButton
                                  onClick={() => handleEditLesson(module, lesson)}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Lesson">
                                <IconButton
                                  onClick={() => handleDeleteLesson(module._id, lesson._id)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {lesson.description}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            {lesson.is_preview && (
                              <Chip
                                label="Preview"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {lesson.is_downloadable && (
                              <Chip
                                label="Downloadable"
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Module Dialog */}
      <Dialog
        open={openModuleDialog}
        onClose={() => setOpenModuleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentModule._id ? "Edit Module" : "Add New Module"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Module Title"
              name="module_title"
              value={currentModule.module_title}
              onChange={(e) => setCurrentModule({ ...currentModule, module_title: e.target.value })}
              error={!!validationErrors.module_title}
              helperText={validationErrors.module_title}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Module Description"
              name="module_description"
              value={currentModule.module_description}
              onChange={(e) => setCurrentModule({ ...currentModule, module_description: e.target.value })}
              error={!!validationErrors.module_description}
              helperText={validationErrors.module_description}
              required
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Display Order"
              name="display_order"
              type="number"
              value={currentModule.display_order}
              onChange={(e) => setCurrentModule({ ...currentModule, display_order: parseInt(e.target.value) })}
              error={!!validationErrors.display_order}
              helperText={validationErrors.display_order}
              required
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModuleDialog(false)}>Cancel</Button>
          <Button onClick={handleAddModule} variant="contained" color="primary">
            {currentModule._id ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog
        open={openLessonDialog}
        onClose={() => setOpenLessonDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentLesson._id ? "Edit Lesson" : "Add New Lesson"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Lesson Title"
              name="lesson_title"
              value={currentLesson.lesson_title}
              onChange={(e) => setCurrentLesson({ ...currentLesson, lesson_title: e.target.value })}
              error={!!validationErrors.lesson_title}
              helperText={validationErrors.lesson_title}
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal" error={!!validationErrors.lesson_type_id} required>
              <InputLabel>Lesson Type</InputLabel>
              <Select
                value={currentLesson.lesson_type_id}
                onChange={(e) => setCurrentLesson({ ...currentLesson, lesson_type_id: e.target.value })}
                label="Lesson Type"
              >
                {lessonTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.lesson_type_id && (
                <Typography color="error" variant="caption">
                  {validationErrors.lesson_type_id}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentLesson.description}
              onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              required
              multiline
              rows={3}
              margin="normal"
            />
            {currentLesson.lesson_type_id === "video" && (
              <TextField
                fullWidth
                label="Video URL"
                name="video_url"
                value={currentLesson.video_url}
                onChange={(e) => setCurrentLesson({ ...currentLesson, video_url: e.target.value })}
                error={!!validationErrors.video_url}
                helperText={validationErrors.video_url}
                required
                margin="normal"
              />
            )}
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="lesson_duration"
              type="number"
              value={currentLesson.lesson_duration}
              onChange={(e) => setCurrentLesson({ ...currentLesson, lesson_duration: parseInt(e.target.value) })}
              error={!!validationErrors.lesson_duration}
              helperText={validationErrors.lesson_duration}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Display Order"
              name="display_order"
              type="number"
              value={currentLesson.display_order}
              onChange={(e) => setCurrentLesson({ ...currentLesson, display_order: parseInt(e.target.value) })}
              error={!!validationErrors.display_order}
              helperText={validationErrors.display_order}
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentLesson.is_downloadable}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, is_downloadable: e.target.checked })}
                  />
                }
                label="Allow Download"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentLesson.is_preview}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, is_preview: e.target.checked })}
                  />
                }
                label="Preview Lesson"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLessonDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLesson} variant="contained" color="primary">
            {currentLesson._id ? "Update" : "Create"}
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseContent;
