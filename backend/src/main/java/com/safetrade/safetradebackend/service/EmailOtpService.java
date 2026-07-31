package com.safetrade.safetradebackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailOtpService {

    private final JavaMailSender mailSender;

    @Value("${safetrade.mail.from:noreply@safetrade.app}")
    private String fromAddress;

    // email → {otp, expiresAt}
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_SECONDS = 600; // 10 minutes
    private final SecureRandom random = new SecureRandom();

    public EmailOtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Generates and emails a fresh OTP to the given address. */
    public void sendOtp(String email) {
        String otp = generateOtp();
        long expiresAt = Instant.now().getEpochSecond() + OTP_TTL_SECONDS;
        store.put(email.toLowerCase(), new OtpEntry(otp, expiresAt));
        sendEmail(email, otp);
    }

    /** Returns true and removes the OTP if it matches and hasn't expired. */
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().getEpochSecond() > entry.expiresAt()) {
            store.remove(email.toLowerCase());
            return false;
        }
        if (!entry.otp().equals(otp.trim())) return false;
        store.remove(email.toLowerCase());
        return true;
    }

    private String generateOtp() {
        int code = 100_000 + random.nextInt(900_000);
        return String.valueOf(code);
    }

    private void sendEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("SafeTrade — Your Verification Code");
            helper.setText(buildEmailBody(otp), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailOtpService] Failed to send OTP to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please check the email address and try again.");
        }
    }

    private String buildEmailBody(String otp) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#16a34a;margin-bottom:8px;">SafeTrade Verification</h2>
              <p style="color:#333;font-size:15px;">Your one-time verification code is:</p>
              <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#16a34a;margin:24px 0;text-align:center;">
                %s
              </div>
              <p style="color:#666;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
              <p style="color:#aaa;font-size:11px;margin-top:24px;">If you did not request this, you can safely ignore this email.</p>
            </div>
            """.formatted(otp);
    }

    private record OtpEntry(String otp, long expiresAt) {}
}
