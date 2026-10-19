package com.resumeanalyzer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> rootStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ResuVantage AI - Resume Analyzer & Match Engine Backend",
                "framework", "Spring Boot 3.3.5 / Java 21 LTS",
                "timestamp", Instant.now().toString(),
                "frontendUrl", "https://resume-analyzer.ksvaishnavidevibca.workers.dev",
                "healthCheck", "/health"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "HEALTHY"));
    }
}
