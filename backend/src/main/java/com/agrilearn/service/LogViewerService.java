package com.agrilearn.service;

import com.agrilearn.logging.LogEntry;

import java.util.List;
import java.util.Map;

public interface LogViewerService {

    /** Get buffered log entries with optional level and keyword filters */
    List<LogEntry> getLogs(String level, String keyword, int page, int size);

    /** Get entries added after a given log entry ID (for polling) */
    List<LogEntry> getLogsSince(long afterId, String level, String keyword);

    /** Count total buffered entries (for pagination) */
    long countLogs(String level, String keyword);

    /** Get current effective log levels for all known loggers */
    Map<String, String> getLogLevels();

    /** Dynamically change log level for a specific logger */
    void setLogLevel(String loggerName, String level);

    /** Clear in-memory buffer */
    void clearLogs();

    /** Return all buffered logs as plain text for download */
    String exportLogs(String level, String keyword);
}
