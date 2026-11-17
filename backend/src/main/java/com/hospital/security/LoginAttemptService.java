package com.hospital.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_SECONDS = 5 * 60; // Khóa tạm 5 phút sau 5 lần nhập sai liên tiếp

    private record AttemptInfo(int count, Instant lockedUntil) {}

    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }
        String key = username.trim().toLowerCase();
        AttemptInfo info = attempts.get(key);
        if (info == null || info.lockedUntil() == null) {
            return false;
        }
        if (Instant.now().isAfter(info.lockedUntil())) {
            attempts.remove(key);
            return false;
        }
        return true;
    }

    public void loginSucceeded(String username) {
        if (username != null && !username.isBlank()) {
            attempts.remove(username.trim().toLowerCase());
        }
    }

    public void loginFailed(String username) {
        if (username == null || username.isBlank()) {
            return;
        }
        String key = username.trim().toLowerCase();
        attempts.compute(key, (k, existing) -> {
            Instant now = Instant.now();
            if (existing != null && existing.lockedUntil() != null && now.isAfter(existing.lockedUntil())) {
                existing = null;
            }
            int nextCount = (existing == null ? 0 : existing.count()) + 1;
            Instant lockUntil = nextCount >= MAX_ATTEMPTS ? now.plusSeconds(LOCK_DURATION_SECONDS) : null;
            return new AttemptInfo(nextCount, lockUntil);
        });
    }
}
