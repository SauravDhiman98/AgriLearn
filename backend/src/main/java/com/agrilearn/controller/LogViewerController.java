package com.agrilearn.controller;

import com.agrilearn.logging.LogEntry;
import com.agrilearn.service.LogViewerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Log Viewer", description = "Real-time backend log viewer (admin only)")
public class LogViewerController {

    private final LogViewerService logViewerService;

    /**
     * Paginated log entries.
     * GET /admin/logs?level=ERROR&keyword=login&page=0&size=100
     */
    @GetMapping
    @Operation(summary = "Get buffered log entries (paginated, most recent first)")
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(required = false, defaultValue = "ALL") String level,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size) {

        List<LogEntry> entries = logViewerService.getLogs(level, keyword, page, size);
        long total = logViewerService.countLogs(level, keyword);
        return ResponseEntity.ok(Map.of(
                "entries", entries,
                "total", total,
                "page", page,
                "size", size,
                "totalPages", (int) Math.ceil((double) total / size)
        ));
    }

    /**
     * Polling endpoint — returns only entries added AFTER a given ID.
     * Frontend calls this every 2 seconds to simulate live streaming.
     * GET /admin/logs/since/{id}?level=ALL&keyword=
     */
    @GetMapping("/since/{afterId}")
    @Operation(summary = "Get log entries added after a given entry ID (for live polling)")
    public ResponseEntity<List<LogEntry>> getLogsSince(
            @PathVariable long afterId,
            @RequestParam(required = false, defaultValue = "ALL") String level,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(logViewerService.getLogsSince(afterId, level, keyword));
    }

    /**
     * Current log levels for all known loggers.
     * GET /admin/logs/levels
     */
    @GetMapping("/levels")
    @Operation(summary = "Get current log levels for all known loggers")
    public ResponseEntity<Map<String, String>> getLevels() {
        return ResponseEntity.ok(logViewerService.getLogLevels());
    }

    /**
     * Dynamically change a logger's level at runtime.
     * POST /admin/logs/levels/{loggerName}?level=DEBUG
     */
    @PostMapping("/levels/{loggerName}")
    @Operation(summary = "Set log level for a specific logger at runtime")
    public ResponseEntity<String> setLevel(
            @PathVariable String loggerName,
            @RequestParam String level) {
        logViewerService.setLogLevel(loggerName, level);
        return ResponseEntity.ok("Log level for '" + loggerName + "' set to " + level.toUpperCase());
    }

    /**
     * Clear in-memory log buffer.
     * DELETE /admin/logs
     */
    @DeleteMapping
    @Operation(summary = "Clear the in-memory log buffer")
    public ResponseEntity<String> clearLogs() {
        logViewerService.clearLogs();
        return ResponseEntity.ok("Log buffer cleared");
    }

    /**
     * Download logs as plain text file.
     * GET /admin/logs/download?level=ERROR&keyword=
     */
    @GetMapping("/download")
    @Operation(summary = "Download filtered logs as a .log text file")
    public ResponseEntity<byte[]> downloadLogs(
            @RequestParam(required = false, defaultValue = "ALL") String level,
            @RequestParam(required = false) String keyword) {

        String content = logViewerService.exportLogs(level, keyword);
        String filename = "agrilearn-logs-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"))
                + ".log";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Summary stats about the log buffer.
     * GET /admin/logs/stats
     */
    @GetMapping("/stats")
    @Operation(summary = "Get log level counts and buffer summary")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<LogEntry> all = logViewerService.getLogs("ALL", null, 0, Integer.MAX_VALUE);
        long errors  = all.stream().filter(e -> "ERROR".equals(e.getLevel())).count();
        long warnings= all.stream().filter(e -> "WARN" .equals(e.getLevel())).count();
        long infos   = all.stream().filter(e -> "INFO" .equals(e.getLevel())).count();
        long debugs  = all.stream().filter(e -> "DEBUG".equals(e.getLevel())).count();
        return ResponseEntity.ok(Map.of(
                "totalBuffered", all.size(),
                "errors",   errors,
                "warnings", warnings,
                "infos",    infos,
                "debugs",   debugs
        ));
    }
}
