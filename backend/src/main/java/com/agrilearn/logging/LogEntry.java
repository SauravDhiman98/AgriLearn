package com.agrilearn.logging;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogEntry {

    private long id;
    private String timestamp;     // ISO-8601 formatted
    private String level;         // ERROR | WARN | INFO | DEBUG | TRACE
    private String thread;
    private String logger;        // fully qualified logger name
    private String loggerShort;   // abbreviated to 36 chars
    private String message;
    private boolean hasException;
    private String exception;     // formatted stack trace (null if none)

    public String toLogLine() {
        return timestamp + " [" + thread + "] " + String.format("%-5s", level)
                + " " + String.format("%-40s", loggerShort) + " : " + message
                + (hasException && exception != null ? "\n" + exception : "");
    }
}
