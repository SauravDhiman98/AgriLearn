package com.agrilearn.service.impl;

import com.agrilearn.dto.response.LiveClassResponse;
import com.agrilearn.entity.LiveClass;
import com.agrilearn.exception.BadRequestException;
import com.agrilearn.exception.ResourceNotFoundException;
import com.agrilearn.repository.LiveClassRepository;
import com.agrilearn.repository.UserRepository;
import com.agrilearn.service.LiveClassService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LiveClassServiceImpl implements LiveClassService {

    private final LiveClassRepository liveClassRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LiveClassResponse> getUpcomingClasses() {
        return liveClassRepository.findUpcomingClasses(
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(30)
        ).stream().map(LiveClassResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LiveClassResponse getLiveClassById(Long id) {
        return LiveClassResponse.from(liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class", id)));
    }

    @Override
    public LiveClassResponse scheduleClass(Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String title = (String) body.get("title");
        if (title == null || title.isBlank()) throw new BadRequestException("Title is required");

        String scheduledAtStr = (String) body.get("scheduledAt");
        LocalDateTime scheduledAt = scheduledAtStr != null
                ? LocalDateTime.parse(scheduledAtStr)
                : LocalDateTime.now().plusDays(1);

        if (scheduledAt.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Scheduled time must be in the future");
        }

        int durationMinutes = body.containsKey("durationMinutes")
                ? Integer.parseInt(body.get("durationMinutes").toString()) : 60;

        LiveClass liveClass = LiveClass.builder()
                .title(title)
                .description((String) body.get("description"))
                .instructor(instructor)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .premiumOnly(Boolean.parseBoolean(body.getOrDefault("premiumOnly", "false").toString()))
                .build();

        LiveClassResponse response = LiveClassResponse.from(liveClassRepository.save(liveClass));
        log.info("Live class scheduled: '{}' (id={}) by instructor '{}' at {}",
                title, response.getId(), email, scheduledAt);
        return response;
    }

    @Override
    public void registerForClass(Long classId) {
        var liveClass = liveClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Live class", classId));
        if (liveClass.getStatus() == LiveClass.LiveClassStatus.CANCELLED) {
            throw new BadRequestException("This class has been cancelled");
        }
        if (liveClass.getStatus() == LiveClass.LiveClassStatus.COMPLETED) {
            throw new BadRequestException("This class has already ended");
        }
        liveClass.setRegisteredCount(liveClass.getRegisteredCount() + 1);
        liveClassRepository.save(liveClass);
    }

    @Override
    public LiveClassResponse startClass(Long classId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var liveClass = liveClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Live class", classId));

        if (!liveClass.getInstructor().getEmail().equals(email)) {
            throw new BadRequestException("Only the instructor can start this class");
        }
        liveClass.setStatus(LiveClass.LiveClassStatus.LIVE);
        log.info("Live class id={} '{}' started by instructor '{}'", classId, liveClass.getTitle(), email);
        return LiveClassResponse.from(liveClassRepository.save(liveClass));
    }
}
