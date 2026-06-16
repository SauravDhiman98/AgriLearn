package com.agrilearn.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.ThrowableProxyUtil;
import ch.qos.logback.core.AppenderBase;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

/**
 * Custom Logback appender that stores the last MAX_ENTRIES log events in an
 * in-memory circular buffer. The LogViewerController reads from this buffer
 * to power the real-time log viewer UI without touching the file system.
 */
public class InMemoryLogAppender extends AppenderBase<ILoggingEvent> {

    private static final int MAX_ENTRIES = 2_000;
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").withZone(ZoneId.systemDefault());

    /** Thread-safe circular buffer */
    private static final List<LogEntry> BUFFER = new CopyOnWriteArrayList<>();

    /** Live-stream listeners (SSE / polling support) */
    private static final List<Consumer<LogEntry>> LISTENERS = new CopyOnWriteArrayList<>();

    /** Global monotonically increasing ID */
    private static final AtomicLong COUNTER = new AtomicLong(0);

    @Override
    protected void append(ILoggingEvent event) {
        LogEntry entry = toEntry(event);
        BUFFER.add(entry);
        // Trim oldest entries to keep buffer bounded
        if (BUFFER.size() > MAX_ENTRIES) {
            int excess = BUFFER.size() - MAX_ENTRIES;
            for (int i = 0; i < excess; i++) {
                if (!BUFFER.isEmpty()) BUFFER.remove(0);
            }
        }
        // Notify live listeners
        LISTENERS.forEach(listener -> {
            try { listener.accept(entry); }
            catch (Exception ignored) { /* listener will be removed on next error */ }
        });
    }

    // ── Static API used by LogViewerService ──────────────────────────────────

    public static List<LogEntry> getAll() {
        return new ArrayList<>(BUFFER);
    }

    public static List<LogEntry> getSince(long afterId) {
        return BUFFER.stream().filter(e -> e.getId() > afterId).toList();
    }

    public static void addListener(Consumer<LogEntry> listener) {
        LISTENERS.add(listener);
    }

    public static void removeListener(Consumer<LogEntry> listener) {
        LISTENERS.remove(listener);
    }

    public static void clear() {
        BUFFER.clear();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static LogEntry toEntry(ILoggingEvent event) {
        String timestamp = FORMATTER.format(Instant.ofEpochMilli(event.getTimeStamp()));
        String loggerName = event.getLoggerName();
        String loggerShort = abbreviate(loggerName, 40);

        IThrowableProxy throwable = event.getThrowableProxy();
        boolean hasEx = throwable != null;
        String exText = hasEx ? ThrowableProxyUtil.asString(throwable) : null;

        return LogEntry.builder()
                .id(COUNTER.incrementAndGet())
                .timestamp(timestamp)
                .level(event.getLevel().toString())
                .thread(event.getThreadName())
                .logger(loggerName)
                .loggerShort(loggerShort)
                .message(event.getFormattedMessage())
                .hasException(hasEx)
                .exception(exText)
                .build();
    }

    /** Abbreviate logger name like Logback does: com.agrilearn.service → c.a.service */
    private static String abbreviate(String name, int maxLen) {
        if (name == null || name.length() <= maxLen) return name;
        String[] parts = name.split("\\.");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            sb.append(parts[i].charAt(0)).append('.');
        }
        sb.append(parts[parts.length - 1]);
        String result = sb.toString();
        if (result.length() > maxLen) {
            return result.substring(result.length() - maxLen);
        }
        return result;
    }
}
