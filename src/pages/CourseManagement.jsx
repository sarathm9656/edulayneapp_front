import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import CourseContent from '../components/CourseContent';
import CourseInstructors from '../components/CourseInstructors';
import { useParams } from 'react-router-dom';

const CourseManagement = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Course Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Content" />
            <Tab label="Instructors" />
          </Tabs>
        </Box>

        {activeTab === 0 && <CourseContent courseId={courseId} />}
        {activeTab === 1 && <CourseInstructors courseId={courseId} />}
      </Box>
    </Container>
    
  );
};

export default CourseManagement;
