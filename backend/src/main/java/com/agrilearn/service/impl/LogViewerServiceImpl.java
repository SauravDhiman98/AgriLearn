package com.agrilearn.service.impl;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import com.agrilearn.logging.InMemoryLogAppender;
import com.agrilearn.logging.LogEntry;
import com.agrilearn.service.LogViewerService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LogViewerServiceImpl implements LogViewerService {

    /** Known application loggers to expose for level management */
    private static final List<String> KNOWN_LOGGERS = List.of(
            "ROOT",
            "com.agrilearn",
            "com.agrilearn.service",
            "com.agrilearn.controller",
            "com.agrilearn.security",
            "com.agrilearn.repository",
            "org.springframework.web",
            "org.springframework.security",
            "org.hibernate.SQL",
            "org.hibernate.type"
    );

    @Override
    public List<LogEntry> getLogs(String level, String keyword, int page, int size) {
        List<LogEntry> filtered = filtered(InMemoryLogAppender.getAll(), level, keyword);
        // Most recent first
        Collections.reverse(filtered);
        int from = Math.max(0, page * size);
        int to   = Math.min(filtered.size(), from + size);
        if (from >= filtered.size()) return List.of();
        return filtered.subList(from, to);
    }

    @Override
    public List<LogEntry> getLogsSince(long afterId, String level, String keyword) {
        List<LogEntry> since = InMemoryLogAppender.getSince(afterId);
        return filtered(since, level, keyword);
    }

    @Override
    public long countLogs(String level, String keyword) {
        return filtered(InMemoryLogAppender.getAll(), level, keyword).size();
    }

    @Override
    public Map<String, String> getLogLevels() {
        LoggerContext ctx = (LoggerContext) LoggerFactory.getILoggerFactory();
        Map<String, String> levels = new LinkedHashMap<>();
        for (String name : KNOWN_LOGGERS) {
            ch.qos.logback.classic.Logger logger = "ROOT".equals(name)
                    ? ctx.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME)
                    : ctx.getLogger(name);
            Level effective = logger.getEffectiveLevel();
            levels.put(name, effective != null ? effective.toString() : "INHERITED");
        }
        return levels;
    }

    @Override
    public void setLogLevel(String loggerName, String level) {
        LoggerContext ctx = (LoggerContext) LoggerFactory.getILoggerFactory();
        String resolvedName = "ROOT".equals(loggerName)
                ? org.slf4j.Logger.ROOT_LOGGER_NAME : loggerName;
        ch.qos.logback.classic.Logger logger = ctx.getLogger(resolvedName);

        Level newLevel;
        try {
            newLevel = Level.toLevel(level.toUpperCase(), Level.INFO);
        } catch (Exception e) {
            newLevel = Level.INFO;
        }
        logger.setLevel(newLevel);
        log.info("Log level for '{}' changed to {}", loggerName, newLevel);
    }

    @Override
    public void clearLogs() {
        InMemoryLogAppender.clear();
        log.info("In-memory log buffer cleared by admin");
    }

    @Override
    public String exportLogs(String level, String keyword) {
        List<LogEntry> all = new ArrayList<>(InMemoryLogAppender.getAll());
        return filtered(all, level, keyword)
                .stream()
                .map(LogEntry::toLogLine)
                .collect(Collectors.joining("\n"));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<LogEntry> filtered(List<LogEntry> entries, String level, String keyword) {
        return entries.stream()
                .filter(e -> level == null || level.isBlank() || "ALL".equalsIgnoreCase(level)
                        || e.getLevel().equalsIgnoreCase(level)
                        || isAtLeastLevel(e.getLevel(), level))
                .filter(e -> keyword == null || keyword.isBlank()
                        || e.getMessage().toLowerCase().contains(keyword.toLowerCase())
                        || e.getLogger().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }

    /** Returns true if entryLevel is >= minimumLevel in severity */
    private boolean isAtLeastLevel(String entryLevel, String minimumLevel) {
        return levelOrder(entryLevel) >= levelOrder(minimumLevel);
    }

    private int levelOrder(String level) {
        return switch (level.toUpperCase()) {
            case "TRACE" -> 0;
            case "DEBUG" -> 1;
            case "INFO"  -> 2;
            case "WARN"  -> 3;
            case "ERROR" -> 4;
            default      -> 2;
        };
    }
}
