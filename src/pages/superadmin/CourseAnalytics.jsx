import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, loading }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const CourseAnalytics = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    totalRevenue: 0,
    topCourses: [],
    recentCourses: [],
    categoryDistribution: [],
    enrollmentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/superadmin/analytics/courses?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch course analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user.token, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !stats.totalCourses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Course Analytics</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchAnalytics}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<SchoolIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={<TrendingUpIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={<PeopleIcon sx={{ color: '#ed6c02' }} />}
            color="#ed6c02"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={<StarIcon sx={{ color: '#9c27b0' }} />}
            color="#9c27b0"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Top Performing Courses"
              action={
                <IconButton onClick={fetchAnalytics}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Enrollments</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <Typography variant="body2">{course.title}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {course.instructor}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={course.tenant}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{course.enrollments}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <StarIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                            {course.rating.toFixed(1)}
                          </Box>
                        </TableCell>
                        <TableCell>{formatCurrency(course.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Category Distribution" />
            <CardContent>
              {stats.categoryDistribution.map((category) => (
                <Box key={category.name} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{category.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {category.count} courses
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                    <Box
                      sx={{
                        width: `${(category.count / stats.totalCourses) * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: 4
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="Recent Courses" />
            <CardContent>
              {stats.recentCourses.map((course) => (
                <Box
                  key={course._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" noWrap>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(course.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={course.status}
                    size="small"
                    color={course.status === 'published' ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseAnalytics; 