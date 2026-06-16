package com.agrilearn.service;

import com.agrilearn.dto.request.CreateCourseRequest;
import com.agrilearn.dto.response.CourseResponse;
import com.agrilearn.dto.response.EnrollmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface CourseService {
    Page<CourseResponse> listCourses(String category, String language, String keyword, Pageable pageable);
    Page<CourseResponse> listAllCourses(Pageable pageable);   // admin — no status filter
    CourseResponse getCourseById(Long id);
    List<CourseResponse> getFeaturedCourses();
    void enrollUser(Long courseId);
    Map<String, Object> getUserProgress(Long courseId);
    void completeLesson(Long courseId, Long lessonId);
    void rateCourse(Long courseId, int rating);
    List<CourseResponse> getMyCourses();
    List<EnrollmentResponse> getMyEnrollments();
    CourseResponse createCourse(CreateCourseRequest request);
}
