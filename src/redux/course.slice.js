import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";

// !course related api calls

export const fetchCourses = createAsyncThunk(
  "tenant/fetchCourses",
  async (page = 1) => {
    const response = await api.get(`/courses?limit=12&page=${page}`);

    return {
      courses: response.data.data,
      pagination: response.data.pagination,
    };
  }
);

export const fetchCourseBySearchValue = createAsyncThunk(
  "tenant/fetchCourseBySearchValue",
  async (searchValue) => {
    const response = await api.get(`/courses/search/${searchValue}`);
    return response.data.data;
  }
);

export const fetchCategories = createAsyncThunk(
  "tenant/fetchCategories",
  async () => {
    const response = await api.get(`/categories`);
    return response.data.data;
  }
);

export const fetchCourseDetails = createAsyncThunk(
  "tenant/fetchCourseDetails",
  async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);

    console.log(response.data.data, "response inside the fetchCourseDetails");
    return response.data.data;
  }
);
export const createCourse = createAsyncThunk(
  "tenant/createCourse",
  async (course, { rejectWithValue }) => {
    try {
      console.log("Course data received in slice:", course);

      // Create FormData for file upload
      const formData = new FormData();

      // Add all course data to FormData
      formData.append("course_title", course.course_title);
      formData.append("short_description", course.short_description);
      formData.append("description", course.description);
      formData.append("category", course.category);
      formData.append("subcategory", course.subcategory);
      formData.append("language", course.language);
      formData.append("level", course.level);
      formData.append("max_enrollment", course.max_enrollment);
      formData.append("start_date", course.start_date);
      formData.append("end_date", course.end_date);
      formData.append("drip_content_enabled", course.drip_content_enabled);

      // Add the file with the correct field name that matches the backend
      if (course.image) {
        console.log("Adding image to FormData:", course.image);
        formData.append("file", course.image);
      } else {
        console.log("No image found in course data");
      }

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const response = await api.post(`/courses`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response from server:", response);
      return response.data.data;
    } catch (error) {
      console.error("Error in createCourse:", error);
      // console.error("Error response:", error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchCourses = createAsyncThunk(
  "tenant/searchCourses",
  async (searchValue) => {
    console.log(searchValue, "searchValue========================");
    const response = await api.get(
      `/courses/search/course/value/${searchValue}`
    );
    console.log(response, "response");
    return response.data.data;
  }
);

export const filterCoursesByCategory = createAsyncThunk(
  "tenant/filterCoursesByCategory",
  async (categoryId) => {
    if (categoryId === "all") {
      const response = await api.get(`/courses`);
      return response.data.data;
    }

    const response = await api.get(`/courses/category/${categoryId}`);
    return response.data.data;
  }
);

export const filterCoursesByLevel = createAsyncThunk(
  "tenant/filterCoursesByLevel",
  async (levelId) => {
    console.log("filterCoursesByLevel called with levelId:", levelId);

    if (levelId === "all") {
      console.log("Fetching all courses");
      const response = await api.get(`/courses`);
      console.log("All courses response:", response.data);
      return response.data.data;
    }

    console.log("Fetching courses for level:", levelId);
    const response = await api.get(`/courses/level/${levelId}`);
    console.log("Level filtered response:", response.data);
    return response.data.data;
  }
);

export const filterCoursesByCategoryAndLevel = createAsyncThunk(
  "tenant/filterCoursesByCategoryAndLevel",
  async ({ categoryId, levelId }) => {
    console.log("filterCoursesByCategoryAndLevel called with:", {
      categoryId,
      levelId,
    });

    const response = await api.get(
      `/courses/category/${categoryId}/level/${levelId}`
    );
    console.log("Category and Level filtered response:", response.data);
    return response.data.data;
  }
);

// !subcategory related api calls

export const fetchSubcategories = createAsyncThunk(
  "tenant/fetchSubcategories",
  async () => {
    const response = await api.get(`/subcategories`);
    return response.data.data;
  }
);

// !level related api calls

export const fetchLevels = createAsyncThunk("tenant/fetchLevels", async () => {
  const response = await api.get(`/levels`);
  return response.data.data;
});

// !language related api calls

export const fetchLanguages = createAsyncThunk(
  "tenant/fetchLanguages",
  async () => {
    const response = await api.get(`/languages`);
    return response.data.data;
  }
);

// !subcategory by category related api calls

export const fetchSubcategoriesByCategory = createAsyncThunk(
  "tenant/fetchSubcategoriesByCategory",
  async (categoryId) => {
    const response = await api.get(`/subcategories/${categoryId}`);
    console.log(response, "response");
    return response.data.data;
  }
);

export const createSubcategory = createAsyncThunk(
  "tenant/createSubcategory",
  async (subcategory) => {
    console.log(subcategory, "subcategory");
    const response = await api.post(`/subcategories`, subcategory);
    console.log(response, "response");
    return response.data.data;
  }
);
// /create-module-and-assign-to-course/:course_id``

export const createModuleAndAssignToCourse = createAsyncThunk(
  "tenant/createModuleAndAssignToCourse",
  async (module) => {
    console.log(module, "module inside the slice 124");
    const response = await api.post(
      `/modules/create-module-and-assign-to-course/${module.course_id}`,
      module
    );
    console.log(response, "response");
    return response.data.data;
  }
);

// !module related api calls

export const fetchModulesByCourseId = createAsyncThunk(
  "tenant/fetchModulesByCourseId",
  async (courseId) => {
    try {
      console.log("hit on fetchModulesByCourse", courseId);

      const response = await api.get(
        `/modules/get-modules-associated-with-the-course/${courseId}`
      );
      console.log(response.data.data);

      // Combine modules with their lessons
      const { modules, lessons } = response.data.data;

      // Create a map of lessons by module_id for quick lookup
      const lessonsByModule = {};
      lessons.forEach(lesson => {
        if (!lessonsByModule[lesson.module_id]) {
          lessonsByModule[lesson.module_id] = [];
        }
        lessonsByModule[lesson.module_id].push(lesson);
      });

      // Add lessons to each module
      const modulesWithLessons = modules.map(module => ({
        ...module,
        lessons: lessonsByModule[module._id] || []
      }));

      return modulesWithLessons;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const fetchModules = createAsyncThunk(
  "tenant/fetchModules",
  async (courseId) => {
    const response = await api.get(`/modules/${courseId}`);
    return response.data.data;
  }
);

// !fetch lessons

export const fetchLessons = createAsyncThunk(
  "tenant/fetchLessons",
  async (moduleId) => {
    const response = await api.get(`/lessons/${moduleId}`);
    console.log(response, "response inside the fetchLessons");
    return response.data.data;
  }
);

// !lessong api calls

export const fetchLessonsByModuleId = createAsyncThunk(
  "tenant/fetchLessonsByModuleId",
  async (moduleId) => {
    const response = await api.get(`/lessons/${moduleId}`);
    // console.log(
    //   response,
    //   "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2response inside the fetchLessonsByModuleId"
    // );
    return response.data.data;
  }
);

// !update lesson orders

export const updateLessonOrders = createAsyncThunk(
  "tenant/updateLessonOrders",
  async ({ lessons, moduleId }) => {
    const response = await api.put(`/lessons/update-order`, {
      lessons: lessons,
    });
    console.log(response, "response inside the updateLessonOrders");
    return { data: response.data.data, moduleId };
  }
);

export const fetchInstructorsByCourseId = createAsyncThunk(
  "tenant/fetchInstructorsByCourseId",
  async (courseId) => {
    const response = await api.get(`/instructors/${courseId}`);
    return response.data.data;
  }
);

// create category
export const createCategory = createAsyncThunk(
  "tenant/createCategory",
  async (categoryName, { dispatch }) => {
    console.log(categoryName, "category inside the createCategory");
    const response = await api.post(`/categories`, { category: categoryName });
    console.log(response, "response inside the createCategory");
    if (response.data.success) {
      toast.success("Category created successfully");
      dispatch(fetchCategories());
    } else {
      toast.error("Something went wrong");
    }
    return response.data.data;
  }
);

// create level
export const createLevel = createAsyncThunk(
  "tenant/createLevel",
  async (course_level, { dispatch }) => {
    const response = await api.post(`/levels`, { course_level });
    if (response.data.success) {
      toast.success("Level created successfully");
      dispatch(fetchLevels());
    } else {
      toast.error("Something went wrong");
    }
    return response.data.data;
  }
);

// create language
export const createLanguage = createAsyncThunk(
  "tenant/createLanguage",
  async (language, { dispatch }) => {
    const response = await api.post(`/languages`, { language });
    if (response.data.success) {
      toast.success("Language created successfully");
      dispatch(fetchLanguages());
    } else {
      toast.error("Something went wrong");
    }
    return response.data.data;
  }
);

export const fetchSingleCourse = createAsyncThunk(
  "course/fetchSingleCourse",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/get-single-course/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "An error occurred" }
      );
    }
  }
);

export const fetchTenantCourses = createAsyncThunk(
  "course/fetchTenantCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/getcourses/tenent");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "An error occurred" }
      );
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    categories: [],
    subcategories: [],
    levels: [],
    languages: [],
    lessons: {},
    courseDetails: {},
    modules: [],
    modulesLoading: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCourses: 0,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    singleCourse: null,
    tenantCourses: [],
    coursesLoading: false,
  },
  reducers: {
    clearModules(state) {
      state.modules = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.courses = action.payload.courses;
      state.pagination = action.payload.pagination;
      state.coursesLoading = false;
    });
    builder.addCase(fetchCourseBySearchValue.fulfilled, (state, action) => {
      state.courses = action.payload;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });
    builder.addCase(fetchSubcategories.fulfilled, (state, action) => {
      state.subcategories = action.payload;
    });
    builder.addCase(fetchLevels.fulfilled, (state, action) => {
      state.levels = action.payload;
    });
    builder.addCase(fetchLanguages.fulfilled, (state, action) => {
      state.languages = action.payload;
    });
    builder.addCase(createLevel.fulfilled, (state, action) => {
      state.levels.push(action.payload);
    });
    builder.addCase(createLanguage.fulfilled, (state, action) => {
      state.languages.push(action.payload);
    });
    builder.addCase(createCourse.fulfilled, (state, action) => {
      state.courses.push(action.payload);
    });
    builder.addCase(createSubcategory.fulfilled, (state, action) => {
      state.subcategories.push(action.payload);
    });
    builder.addCase(fetchSubcategoriesByCategory.fulfilled, (state, action) => {
      state.subcategories = action.payload;
    });
    builder.addCase(searchCourses.fulfilled, (state, action) => {
      state.courses = action.payload;
    });
    builder.addCase(filterCoursesByCategory.fulfilled, (state, action) => {
      state.courses = action.payload;
    });
    builder.addCase(filterCoursesByLevel.fulfilled, (state, action) => {
      console.log(
        "filterCoursesByLevel.fulfilled with payload:",
        action.payload
      );
      state.courses = action.payload;
    });
    builder.addCase(filterCoursesByLevel.rejected, (state, action) => {
      console.error("filterCoursesByLevel.rejected:", action.error);
    });
    builder.addCase(
      filterCoursesByCategoryAndLevel.fulfilled,
      (state, action) => {
        console.log(
          "filterCoursesByCategoryAndLevel.fulfilled with payload:",
          action.payload
        );
        state.courses = action.payload;
      }
    );
    builder.addCase(
      filterCoursesByCategoryAndLevel.rejected,
      (state, action) => {
        console.error(
          "filterCoursesByCategoryAndLevel.rejected:",
          action.error
        );
      }
    );
    builder.addCase(fetchModulesByCourseId.pending, (state) => {
      state.modulesLoading = true;
    });
    builder.addCase(fetchModulesByCourseId.fulfilled, (state, action) => {
      state.modules = action.payload;
      state.modulesLoading = false;
    });
    builder.addCase(fetchModulesByCourseId.rejected, (state) => {
      state.modulesLoading = false;
    });
    builder.addCase(fetchLessonsByModuleId.fulfilled, (state, action) => {
      console.log(
        action.payload,
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2action.payload inside the fetchLessonsByModuleId"
      );
      const moduleId = action.meta.arg;
      state.lessons[moduleId] = action.payload;
    });
    builder.addCase(updateLessonOrders.fulfilled, (state, action) => {
      const moduleId = action.payload.moduleId;
      if (moduleId && state.lessons[moduleId]) {
        state.lessons[moduleId] = action.payload.data.lessons;
      }
    });
    builder.addCase(fetchLessons.fulfilled, (state, action) => {
      const moduleId = action.meta.arg;
      state.lessons[moduleId] = action.payload;
    });
    builder.addCase(fetchCourseDetails.fulfilled, (state, action) => {
      state.courseDetails = action.payload;
    });
    builder.addCase(fetchSingleCourse.fulfilled, (state, action) => {
      state.singleCourse = action.payload;
    });
    builder.addCase(fetchTenantCourses.pending, (state) => {
      state.coursesLoading = true;
    });
    builder.addCase(fetchTenantCourses.fulfilled, (state, action) => {
      state.tenantCourses = action.payload;
      state.coursesLoading = false;
    });
    builder.addCase(fetchTenantCourses.rejected, (state) => {
      state.coursesLoading = false;
    });
  },
});

export default courseSlice.reducer;
