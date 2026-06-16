package com.agrilearn.service;

import com.agrilearn.dto.response.LiveClassResponse;

import java.util.List;
import java.util.Map;

public interface LiveClassService {
    List<LiveClassResponse> getUpcomingClasses();
    LiveClassResponse getLiveClassById(Long id);
    LiveClassResponse scheduleClass(Map<String, Object> body);
    void registerForClass(Long classId);
    LiveClassResponse startClass(Long classId);
}
